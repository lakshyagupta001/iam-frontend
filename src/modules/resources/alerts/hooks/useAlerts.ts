import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '../services/alerts.service';
import type { CreateAlertDTO } from '../types/alerts.types';

export const alertKeys = {
  all: ['alerts'] as const,
  lists: () => [...alertKeys.all, 'list'] as const,
  list: (params: any) => [...alertKeys.lists(), params] as const,
  details: () => [...alertKeys.all, 'detail'] as const,
  detail: (id: string) => [...alertKeys.details(), id] as const,
};

export const useAlerts = (params?: { page: number; limit: number; search?: string }) => {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: () => alertsService.list(params),
  });
};

export const useAlert = (id: string) => {
  return useQuery({
    queryKey: alertKeys.detail(id),
    queryFn: () => alertsService.get(id),
    enabled: !!id,
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlertDTO) => alertsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsService.acknowledge(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertKeys.detail(id) });
    },
  });
};

export const useDeleteAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
};
