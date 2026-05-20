import api from './api.js';
import { Lead, ApiResponse, User, CreateLeadPayload, UpdateLeadPayload } from '../types/index.js';

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string; // Comma-separated or single
  source?: string; // Comma-separated or single
  search?: string;
  sort?: string;
}

export const leadService = {
  // Fetch paginated leads list
  getLeads: async (filters: LeadFilters): Promise<ApiResponse<Lead[]>> => {
    const { data } = await api.get<ApiResponse<Lead[]>>('/leads', { params: filters });
    return data;
  },

  // Fetch single lead detail
  getLead: async (id: string): Promise<ApiResponse<Lead>> => {
    const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return data;
  },

  // Create new lead
  createLead: async (leadData: CreateLeadPayload): Promise<ApiResponse<Lead>> => {
    const { data } = await api.post<ApiResponse<Lead>>('/leads', leadData);
    return data;
  },

  // Update lead
  updateLead: async (id: string, leadData: UpdateLeadPayload): Promise<ApiResponse<Lead>> => {
    const { data } = await api.put<ApiResponse<Lead>>(`/leads/${id}`, leadData);
    return data;
  },

  // Delete lead
  deleteLead: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/leads/${id}`);
    return data;
  },

  // Fetch all users (admin-only function for assignee dropdown)
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const { data } = await api.get<ApiResponse<User[]>>('/auth/users');
    return data;
  },

  // Securely download CSV export with Authorization headers
  downloadCSV: async (filters: Omit<LeadFilters, 'page' | 'limit'>): Promise<void> => {
    const response = await api.get('/leads/export', {
      params: filters,
      responseType: 'blob', // Important to handle stream data
    });

    // Create a local blob URL and execute download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `leads_export_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default leadService;
