import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings.service';
import type { UpdateSettingDTO } from '../types/settings.types';

export const settingKeys = {
  all: ['settings'] as const,
  lists: () => [...settingKeys.all, 'list'] as const,
  list: (params: any) => [...settingKeys.lists(), params] as const,
};

export const useSettings = (params?: { page: number; limit: number; search?: string }) => {
  return useQuery({
    queryKey: settingKeys.list(params),
    queryFn: () => settingsService.list(params),
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingDTO) => settingsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.lists() });
    },
  });
};
