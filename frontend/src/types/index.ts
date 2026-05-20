export type Role = 'admin' | 'sales_user';
export type Status = 'new' | 'contacted' | 'qualified' | 'lost';
export type Source = 'website' | 'instagram' | 'referral';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: Status;
  source: Source;
  notes?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: Role;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: Role;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMetadata;
  error?: {
    message: string;
    code: string;
    statusCode: number;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  status: Status;
  source: Source;
  notes?: string;
  assignedTo?: string | null;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;
