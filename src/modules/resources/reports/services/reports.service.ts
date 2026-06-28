import { axiosClient } from '@/api/axiosClient';
import type { Report, CreateReportDTO, UpdateReportDTO } from '../types/reports.types';
import type { PaginatedResponse, PaginationParams } from '@/types';;

export const reportsService = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Report>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Report>>('/reports', { params });
    return data;
  },

  get: async (id: string): Promise<Report> => {
    const { data } = await axiosClient.get<{ success: boolean; data: Report }>(`/reports/${id}`);
    return data.data;
  },

  create: async (payload: CreateReportDTO): Promise<Report> => {
    const { data } = await axiosClient.post<{ success: boolean; data: Report }>('/reports', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateReportDTO): Promise<Report> => {
    const { data } = await axiosClient.put<{ success: boolean; data: Report }>(`/reports/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/reports/${id}`);
  }
};
