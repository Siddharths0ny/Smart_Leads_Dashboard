import { Response, NextFunction } from 'express';
import { Types, FilterQuery } from 'mongoose';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest, ILead, IUser } from '../types/index.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';

// Create Lead
export const createLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { name, email, status, source, notes, assignedTo } = req.body;

    // Check if email already registered in Leads
    const existingLead = await Lead.findOne({ email: email.toLowerCase() });
    if (existingLead) {
      throw new BadRequestError('Lead email already exists', 'LEAD_EMAIL_EXISTS');
    }

    // Role-based lead assignment control
    let finalAssignedTo: Types.ObjectId | undefined = undefined;

    if (req.user.role === 'admin') {
      if (assignedTo) {
        // Verify assigned user exists
        const userExists = await User.findById(assignedTo);
        if (!userExists) {
          throw new NotFoundError('Assigned user not found', 'ASSIGNED_USER_NOT_FOUND');
        }
        finalAssignedTo = new Types.ObjectId(assignedTo);
      }
    } else {
      // Sales user can only create leads assigned to themselves
      finalAssignedTo = new Types.ObjectId(req.user.id);
    }

    const lead = new Lead({
      name,
      email: email.toLowerCase(),
      status,
      source,
      notes,
      assignedTo: finalAssignedTo,
      createdBy: new Types.ObjectId(req.user.id),
    });

    await lead.save();

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Leads (with filters and pagination)
export const getAllLeads = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ILead> = {};

    // Role restriction
    if (req.user.role === 'sales_user') {
      filter.assignedTo = new Types.ObjectId(req.user.id);
    }

    // Status filter
    if (req.query.status) {
      // Support comma-separated status values (if multi-select sends multiple)
      const statusQuery = req.query.status as string;
      if (statusQuery.includes(',')) {
        filter.status = { $in: statusQuery.split(',') };
      } else {
        filter.status = statusQuery;
      }
    }

    // Source filter
    if (req.query.source) {
      const sourceQuery = req.query.source as string;
      if (sourceQuery.includes(',')) {
        filter.source = { $in: sourceQuery.split(',') };
      } else {
        filter.source = sourceQuery;
      }
    }

    // Search filter (name or email regex)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // Sort order
    let sort: { [key: string]: 1 | -1 } = { createdAt: -1 }; // default latest
    if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    }

    const total = await Lead.countDocuments(filter);
    const pages = Math.ceil(total / limit) || 1;

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Lead
export const getLeadById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!lead) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Lead not found',
          code: 'LEAD_NOT_FOUND',
          statusCode: 404,
        },
      });
      return;
    }

    // Authorization check
    if (req.user.role === 'sales_user' && lead.assignedTo?.toString() !== req.user.id) {
      throw new ForbiddenError('You are not authorized to access this lead', 'UNAUTHORIZED_LEAD_ACCESS');
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// Update Lead
export const updateLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Lead not found',
          code: 'LEAD_NOT_FOUND',
          statusCode: 404,
        },
      });
      return;
    }

    // Authorization check
    if (req.user.role === 'sales_user' && lead.assignedTo?.toString() !== req.user.id) {
      throw new ForbiddenError('You are not authorized to update this lead', 'UNAUTHORIZED_LEAD_UPDATE');
    }

    const { name, email, status, source, notes, assignedTo } = req.body;

    // Check email uniqueness if email is changed
    if (email && email.toLowerCase() !== lead.email) {
      const existingLead = await Lead.findOne({ email: email.toLowerCase() });
      if (existingLead) {
        throw new BadRequestError('Lead email already exists', 'LEAD_EMAIL_EXISTS');
      }
      lead.email = email.toLowerCase();
    }

    if (name) lead.name = name;
    if (status) lead.status = status;
    if (source) lead.source = source;
    if (notes !== undefined) lead.notes = notes;

    // Only Admin can change lead assignments
    if (assignedTo !== undefined) {
      if (req.user.role === 'admin') {
        if (assignedTo === '' || assignedTo === null) {
          lead.assignedTo = undefined;
        } else {
          // Verify user exists
          const userExists = await User.findById(assignedTo);
          if (!userExists) {
            throw new NotFoundError('Assigned user not found', 'ASSIGNED_USER_NOT_FOUND');
          }
          lead.assignedTo = new Types.ObjectId(assignedTo);
        }
      }
    }

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Lead
export const deleteLead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Lead not found',
          code: 'LEAD_NOT_FOUND',
          statusCode: 404,
        },
      });
      return;
    }

    // Authorization check
    if (req.user.role === 'sales_user' && lead.assignedTo?.toString() !== req.user.id) {
      throw new ForbiddenError('You are not authorized to delete this lead', 'UNAUTHORIZED_LEAD_DELETE');
    }

    await Lead.deleteOne({ _id: lead._id });

    res.status(200).json({
      success: true,
      data: {
        message: 'Lead deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

// CSV Export
export const exportLeads = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const filter: FilterQuery<ILead> = {};

    // Role restriction
    if (req.user.role === 'sales_user') {
      filter.assignedTo = new Types.ObjectId(req.user.id);
    }

    // Apply exact same filters as Get All Leads (except pagination)
    if (req.query.status) {
      const statusQuery = req.query.status as string;
      if (statusQuery.includes(',')) {
        filter.status = { $in: statusQuery.split(',') };
      } else {
        filter.status = statusQuery;
      }
    }

    if (req.query.source) {
      const sourceQuery = req.query.source as string;
      if (sourceQuery.includes(',')) {
        filter.source = { $in: sourceQuery.split(',') };
      } else {
        filter.source = sourceQuery;
      }
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    let sort: { [key: string]: 1 | -1 } = { createdAt: -1 };
    if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name')
      .sort(sort);

    // Generate CSV contents manually
    const headers = ['Name', 'Email', 'Status', 'Source', 'Assigned To', 'Created At'];
    
    const escapeCsv = (str: string) => {
      if (str === null || str === undefined) return '';
      const escaped = str.toString().replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    const rows = leads.map(lead => [
      escapeCsv(lead.name),
      escapeCsv(lead.email),
      escapeCsv(lead.status),
      escapeCsv(lead.source),
      escapeCsv((lead.assignedTo as unknown as IUser | null)?.name || 'Unassigned'),
      escapeCsv(lead.createdAt.toISOString()),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
