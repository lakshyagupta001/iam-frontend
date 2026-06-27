import { axiosClient } from './axiosClient';
import type { UserProfile } from './auth.api';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
}

export const usersApi = {
  listUsers: async (): Promise<UserProfile[]> => {
    const { data } = await axiosClient.get<{ success: boolean; data: UserProfile[] }>('/iam/users');
    return data.data;
  },
  createUser: async (payload: CreateUserPayload): Promise<UserProfile> => {
    const { data } = await axiosClient.post<{ success: boolean; data: UserProfile }>('/iam/users', payload);
    return data.data;
  },
};
