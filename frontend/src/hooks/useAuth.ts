import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';
import { ApiResponse, User } from '../types/index.js';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth, logout: storeLogout } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const { data } = await api.post<ApiResponse<{ token: string; user: User }>>(
        '/auth/login',
        credentials
      );
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: Record<string, string>) => {
      const { data } = await api.post<ApiResponse<{ token: string; user: User }>>(
        '/auth/register',
        userData
      );
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  // Profile validation query
  const useMeQuery = (enabled: boolean) => {
    return useQuery({
      queryKey: ['me'],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        return data.data.user;
      },
      enabled,
      retry: false,
    });
  };

  const logout = () => {
    storeLogout();
    queryClient.clear();
  };

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    
    logout,
    useMeQuery,
  };
};

export default useAuth;
