import { axiosClient } from '@/api/axiosClient';
import type { Alert, CreateAlertDTO, UpdateAlertDTO } from '../types/alerts.types';
import type { PaginatedResponse, PaginationParams } from '@/types';;

export const alertsService = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Alert>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Alert>>('/alerts', { params });
    return data;
  },

  get: async (id: string): Promise<Alert> => {
    const { data } = await axiosClient.get<{ success: boolean; data: Alert }>(`/alerts/${id}`);
    return data.data;
  },

  create: async (payload: CreateAlertDTO): Promise<Alert> => {
    const { data } = await axiosClient.post<{ success: boolean; data: Alert }>('/alerts', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateAlertDTO): Promise<Alert> => {
    const { data } = await axiosClient.put<{ success: boolean; data: Alert }>(`/alerts/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/alerts/${id}`);
  }
};
