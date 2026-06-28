import { axiosClient } from '@/api/axiosClient';
import type { Setting, UpdateSettingDTO } from '../types/settings.types';
import type { PaginatedResponse, PaginationParams } from '@/types';;

export const settingsService = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Setting>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Setting>>('/settings', { params });
    return data;
  },

  update: async (payload: UpdateSettingDTO): Promise<Setting> => {
    const { data } = await axiosClient.put<{ success: boolean; data: Setting }>('/settings', payload);
    return data.data;
  }
};
