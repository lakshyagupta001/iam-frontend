import { axiosClient } from '@/api/axiosClient';
import type { AuditLog } from '../types/audit.types';
import type { PaginatedResponse, PaginationParams } from '@/types';;

export const auditService = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<AuditLog>> => {
    const { data } = await axiosClient.get<PaginatedResponse<AuditLog>>('/audit', { params });
    return data;
  },
  get: async (id: string): Promise<AuditLog> => {
    const { data } = await axiosClient.get<AuditLog>(`/audit/${id}`);
    return data;
  }
};
