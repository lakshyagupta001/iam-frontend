import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';

export const auditKeys = {
  all: ['audit'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params: any) => [...auditKeys.lists(), params] as const,
};

export const useAuditLogs = (params?: { page: number; limit: number; search?: string }) => {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => auditService.list(params),
  });
};
