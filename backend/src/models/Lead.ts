import { Schema, model } from 'mongoose';
import { ILead } from '../types/index.js';

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Lead name must be at least 2 characters long'],
      maxlength: [100, 'Lead name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    status: {
      type: String,
      required: [true, 'Lead status is required'],
      enum: {
        values: ['new', 'contacted', 'qualified', 'lost'],
        message: 'Status must be one of: new, contacted, qualified, lost',
      },
      default: 'new',
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: {
        values: ['website', 'instagram', 'referral'],
        message: 'Source must be one of: website, instagram, referral',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Email is unique
leadSchema.index({ email: 1 }, { unique: true });

// Composite index for filtering
leadSchema.index({ status: 1, source: 1 });

// Index for sorting
leadSchema.index({ createdAt: -1 });

export const Lead = model<ILead>('Lead', leadSchema);
export default Lead;
