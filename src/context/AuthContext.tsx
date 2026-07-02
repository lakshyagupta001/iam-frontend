import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/modules/auth/services/auth.service';
import type { UserProfile } from '@/modules/auth/services/auth.service';
import { usersApi } from '@/modules/iam/features/users/services/users.service';
import { axiosClient } from '@/api/axiosClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Record<string, boolean> | null;
  hasPermission: (action: string | string[]) => boolean;
  refreshPermissions: () => Promise<void>;
  login: (accessToken: string, user: UserProfile) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);
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

        const perms = await usersApi.getEffectivePermissions(meRes.data.id);
        setPermissions(perms);
      } catch (error) {
        // Silently fail if no valid refresh token
        setAccessToken(null);
        setUser(null);
        setPermissions(null);
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
            setPermissions(null);
            queryClient.clear();
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 403) {
          const errorMessage = error.response?.data?.message || '';

          if (errorMessage.includes('Delegation Bypass Prevention')) {
            toast.error(' Access Denied (403)', {
              description: errorMessage,
              id: 'auth-403'
            });
          } else if (errorMessage.includes('Boundary') || errorMessage.includes('boundary')) {
            toast.error(' Access Denied (403)', {
              description: 'This permission is restricted by your assigned boundary.',
              id: 'auth-403'
            });
          } else {
            toast.error(' Access Denied (403)', {
              description: 'You do not have permission to perform this action.',
              id: 'auth-403'
            });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.request.eject(requestInterceptor);
      axiosClient.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, queryClient]);

  const login = async (token: string, profile: UserProfile) => {
    setAccessToken(token);
    setUser(profile);
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const perms = await usersApi.getEffectivePermissions(profile.id);
      setPermissions(perms);
    } catch (e) {
      console.error('Failed to fetch permissions on login');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
      setPermissions(null);
      queryClient.clear();
    }
  };

  const hasPermission = (action: string | string[]) => {
    if (user?.isRoot) return true;
    if (!permissions) return false;
    
    if (Array.isArray(action)) {
      return action.some(act => !!permissions[act]);
    }
    
    return !!permissions[action];
  };

  const refreshPermissions = async () => {
    if (!user) return;
    try {
      const perms = await usersApi.getEffectivePermissions(user.id);
      setPermissions(perms);
    } catch (e) {
      console.error('Failed to refresh permissions', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      permissions,
      hasPermission,
      refreshPermissions,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
