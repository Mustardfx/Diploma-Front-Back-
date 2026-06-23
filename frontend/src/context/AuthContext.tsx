import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiAuthService } from '../services/apiAuthService';
import { apiUserService } from '../services/apiUserService';
import { authService } from '../services/authService';
import type { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendOnline: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    // Restore from cache immediately so UI doesn't flash
    const cached = apiAuthService.getCurrentUser() ?? authService.getCurrentUser();
    setUser(cached);

    // Try to reach the real backend
    if (apiAuthService.isAuthenticated()) {
      apiAuthService.getMe()
        .then((freshUser) => {
          setBackendOnline(true);
          setUser(freshUser);
        })
        .catch((err) => {
          const msg = (err as Error).message ?? '';
          // Сетевая ошибка → бэкенд недоступен, остаёмся в offline-режиме с кэшем.
          // Любая иная (истёкшая/невалидная сессия) → чистим, чтобы не показывать
          // чужого/устаревшего пользователя (источник «подмены аккаунта» при рефреше).
          if (msg.includes('Нет соединения')) {
            setBackendOnline(false);
          } else {
            apiAuthService.logout();
            setUser(null);
            setBackendOnline(false);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    // 401 interceptor broadcasts this event
    const handle401 = () => { setUser(null); setBackendOnline(false); };
    window.addEventListener('auth:unauthorized', handle401);
    return () => window.removeEventListener('auth:unauthorized', handle401);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Try real API first
      const authUser = await apiAuthService.login({ email, password });
      setBackendOnline(true);
      setUser(authUser);
    } catch (err) {
      const msg = (err as Error).message;
      // If it's a network/server error, fall back to localStorage
      if (
        msg.includes('Нет соединения') ||
        msg.includes('Ошибка сервера') ||
        msg.includes('ECONNREFUSED')
      ) {
        const authUser = authService.login(email, password);
        setBackendOnline(false);
        setUser(authUser);
      } else {
        throw err;
      }
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const authUser = await apiAuthService.register(data);
      setBackendOnline(true);
      setUser(authUser);
    } catch (err) {
      const msg = (err as Error).message;
      if (
        msg.includes('Нет соединения') ||
        msg.includes('Ошибка сервера') ||
        msg.includes('ECONNREFUSED')
      ) {
        const authUser = authService.register(data);
        setBackendOnline(false);
        setUser(authUser);
      } else {
        throw err;
      }
    }
  };

  const logout = () => {
    apiAuthService.logout();
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return;
    if (backendOnline) {
      // Persist to the database; fall back to local cache only if the request fails.
      const { id: _id, role: _role, ...profile } = updates;
      const updated = await apiUserService.update(user.id, profile);
      localStorage.setItem('sport_app_current_user', JSON.stringify(updated));
      setUser(updated);
    } else {
      const updated = authService.updateProfile(user.id, updates);
      setUser(updated);
    }
  };

  const hasRole = (...roles: UserRole[]) => {
    return !!user && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      backendOnline,
      login,
      register,
      logout,
      updateProfile,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
