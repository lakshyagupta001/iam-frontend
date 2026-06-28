import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { UserProfile } from '../api/auth.api';
import { axiosClient } from '../api/axiosClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: UserProfile) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const queryClient = useQueryClient();

  // Initial load: Attempt silent refresh
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.accessToken);
        // We need to set the token on the client immediately so `authApi.me()` succeeds
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        const meRes = await authApi.me();
        setUser(meRes.data);
      } catch (error) {
        // Silently fail if no valid refresh token
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up Axios interceptors for auth & silent refresh
  useEffect(() => {
    const requestInterceptor = axiosClient.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If 401 and we haven't retried yet, and the request wasn't already a refresh or login attempt
        if (
          error.response?.status === 401 && 
          !originalRequest._retry &&
          originalRequest.url !== '/auth/refresh' &&
          originalRequest.url !== '/auth/login'
        ) {
          originalRequest._retry = true;
          try {
            const { data } = await authApi.refresh();
            setAccessToken(data.accessToken);
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return axiosClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, force logout
            setUser(null);
            setAccessToken(null);
            queryClient.clear();
            return Promise.reject(refreshError);
          }
        }
        
        if (error.response?.status === 403) {
          toast.error('Access Denied', {
            description: 'You do not have permission to perform this action.'
          });
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.request.eject(requestInterceptor);
      axiosClient.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, queryClient]);

  const login = (token: string, profile: UserProfile) => {
    setAccessToken(token);
    setUser(profile);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
