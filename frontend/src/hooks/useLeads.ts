import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import leadService, { LeadFilters } from '../services/leadService.js';
import { CreateLeadPayload, UpdateLeadPayload } from '../types/index.js';
import { useAuthStore } from '../store/authStore.js';

export const useLeads = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Leads list query
  const useLeadsQuery = (filters: LeadFilters) => {
    return useQuery({
      queryKey: ['leads', filters],
      queryFn: () => leadService.getLeads(filters),
      placeholderData: (previousData) => previousData, // Maintain view layout during page changes
      staleTime: 5000,
    });
  };

  // Single lead query
  const useLeadQuery = (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: ['lead', id],
      queryFn: () => leadService.getLead(id),
      enabled: enabled && !!id,
    });
  };

  // Assignable users listing query (Admin only)
  const useUsersQuery = (enabled: boolean = true) => {
    return useQuery({
      queryKey: ['users'],
      queryFn: () => leadService.getUsers(),
      enabled: enabled && isAdmin,
      staleTime: 60000, // cache users list longer
    });
  };

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: (leadData: CreateLeadPayload) => leadService.createLead(leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadPayload }) =>
      leadService.updateLead(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (response?.data?._id) {
        queryClient.invalidateQueries({ queryKey: ['lead', response.data._id] });
      }
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => leadService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  return {
    useLeadsQuery,
    useLeadQuery,
    useUsersQuery,
    
    createLead: createLeadMutation.mutateAsync,
    isCreating: createLeadMutation.isPending,
    createError: createLeadMutation.error,
    
    updateLead: updateLeadMutation.mutateAsync,
    isUpdating: updateLeadMutation.isPending,
    updateError: updateLeadMutation.error,
    
    deleteLead: deleteLeadMutation.mutateAsync,
    isDeleting: deleteLeadMutation.isPending,
    deleteError: deleteLeadMutation.error,
  };
};

export default useLeads;
