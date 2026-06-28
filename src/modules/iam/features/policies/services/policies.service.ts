import { axiosClient } from '@/api/axiosClient';
import type { Policy } from '@/modules/iam/types/iam.types';
import type { PaginatedResponse, PaginationParams } from '@/types';;

export interface PolicyQueryParams extends PaginationParams {
  type?: 'MANAGED' | 'INLINE';
  sort?: string;
  order?: 'asc' | 'desc';
}

export const policiesApi = {
  listPolicies: async (params?: PolicyQueryParams): Promise<PaginatedResponse<Policy>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Policy>>('/iam/policies', { params });
    return data;
  },

  getPolicy: async (id: string): Promise<Policy> => {
    const { data } = await axiosClient.get<{ success: boolean; data: Policy }>(`/iam/policies/${id}`);
    return data.data;
  },

  createPolicy: async (payload: Partial<Policy>): Promise<Policy> => {
    const { data } = await axiosClient.post<{ success: boolean; data: Policy }>('/iam/policies', payload);
    return data.data;
  },

  updatePolicy: async (id: string, payload: Partial<Policy>): Promise<Policy> => {
    const { data } = await axiosClient.put<{ success: boolean; data: Policy }>(`/iam/policies/${id}`, payload);
    return data.data;
  },

  deletePolicy: async (id: string): Promise<void> => {
    await axiosClient.delete(`/iam/policies/${id}`);
  },
};
