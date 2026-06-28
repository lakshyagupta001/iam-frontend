import { axiosClient } from '@/api/axiosClient';
import type { LoginFormValues, RegisterFormValues } from '@/modules/auth/validation/auth.validation';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isRoot: boolean;
  orgId: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: UserProfile;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: UserProfile;
}

export const authApi = {
  register: async (credentials: RegisterFormValues): Promise<RegisterResponse> => {
    // We send only the required fields to the backend (ignoring confirmPassword)
    const { organizationName, name, email, password } = credentials;
    const { data } = await axiosClient.post<RegisterResponse>('/auth/register', { organizationName, name, email, password });
    return data;
  },

  login: async (credentials: LoginFormValues): Promise<LoginResponse> => {
    const { data } = await axiosClient.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  refresh: async (): Promise<RefreshResponse> => {
    const { data } = await axiosClient.post<RefreshResponse>('/auth/refresh');
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  },

  me: async (): Promise<MeResponse> => {
    const { data } = await axiosClient.get<MeResponse>('/auth/me');
    return data;
  },
};
