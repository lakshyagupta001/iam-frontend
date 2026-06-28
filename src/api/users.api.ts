import { axiosClient } from './axiosClient';
import type { UserProfile, UserDetails, PaginatedResponse, PaginationParams } from '../types';

export const usersApi = {
  listUsers: async (params?: PaginationParams): Promise<PaginatedResponse<UserProfile>> => {
    const { data } = await axiosClient.get<PaginatedResponse<UserProfile>>('/iam/users', { params });
    return data;
  },

  createUser: async (payload: { name: string; email: string; password?: string }): Promise<UserProfile> => {
    const { data } = await axiosClient.post<{ success: boolean; data: UserProfile }>('/iam/users', payload);
    return data.data;
  },
  
  getUser: async (id: string): Promise<UserDetails> => {
    const { data } = await axiosClient.get<{ success: boolean; data: UserDetails }>(`/iam/users/${id}`);
    return data.data;
  },

  attachPolicy: async (userId: string, policyId: string): Promise<void> => {
    await axiosClient.post(`/iam/users/${userId}/policies`, { policyId });
  },

  detachPolicy: async (userId: string, policyId: string): Promise<void> => {
    await axiosClient.delete(`/iam/users/${userId}/policies/${policyId}`);
  },

  getEffectivePermissions: async (userId: string): Promise<Record<string, boolean>> => {
    const { data } = await axiosClient.get<{ success: boolean; data: Record<string, boolean> }>(`/iam/users/${userId}/effective-permissions`);
    return data.data;
  },

  getBoundary: async (userId: string): Promise<any | null> => {
    const { data } = await axiosClient.get<{ success: boolean; data: any }>(`/iam/users/${userId}/boundary`);
    return data.data;
  },

  assignBoundary: async (userId: string, policyId: string): Promise<any> => {
    const { data } = await axiosClient.put<{ success: boolean; data: any }>(`/iam/users/${userId}/boundary`, { policyId });
    return data.data;
  },

  removeBoundary: async (userId: string): Promise<void> => {
    await axiosClient.delete(`/iam/users/${userId}/boundary`);
  }
};
