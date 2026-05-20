import { Request } from 'express';
import { Types } from 'mongoose';

export type Role = 'admin' | 'sales_user';
export type Status = 'new' | 'contacted' | 'qualified' | 'lost';
export type Source = 'website' | 'instagram' | 'referral';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: Types.ObjectId;
  name: string;
  email: string;
  status: Status;
  source: Source;
  notes?: string;
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
}

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
