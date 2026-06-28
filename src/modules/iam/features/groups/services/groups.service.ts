import { axiosClient } from '@/api/axiosClient';
import type { Group, GroupDetails } from '@/modules/iam/types/iam.types';
import type { PaginatedResponse, PaginationParams } from '@/types';;

export const groupsApi = {
  listGroups: async (params?: PaginationParams): Promise<PaginatedResponse<Group>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Group>>('/iam/groups', { params });
    return data;
  },

  getGroup: async (id: string): Promise<GroupDetails> => {
    const { data } = await axiosClient.get<{ success: boolean; data: GroupDetails }>(`/iam/groups/${id}`);
    return data.data;
  },

  createGroup: async (payload: { name: string; description?: string }): Promise<Group> => {
    const { data } = await axiosClient.post<{ success: boolean; data: Group }>('/iam/groups', payload);
    return data.data;
  },

  updateGroup: async (id: string, payload: { name?: string; description?: string }): Promise<Group> => {
    const { data } = await axiosClient.put<{ success: boolean; data: Group }>(`/iam/groups/${id}`, payload);
    return data.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await axiosClient.delete(`/iam/groups/${id}`);
  },

  addMember: async (groupId: string, userId: string): Promise<void> => {
    await axiosClient.post(`/iam/groups/${groupId}/members`, { userId });
  },

  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await axiosClient.delete(`/iam/groups/${groupId}/members/${userId}`);
  },

  attachPolicy: async (groupId: string, policyId: string): Promise<void> => {
    await axiosClient.post(`/iam/groups/${groupId}/policies`, { policyId });
  },

  detachPolicy: async (groupId: string, policyId: string): Promise<void> => {
    await axiosClient.delete(`/iam/groups/${groupId}/policies/${policyId}`);
  },
};
