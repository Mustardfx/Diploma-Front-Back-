import api from './api';
import type { AuthUser } from '../types';

const TOKEN_KEY = 'sport_app_token';
const CURRENT_USER_KEY = 'sport_app_current_user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

function persist(data: AuthResponse): AuthUser {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export const apiAuthService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return persist(data);
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return persist(data);
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/users/me');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
    return data;
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return data.message;
  },

  async resetPassword(token: string, password: string): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', { token, password });
    return data.message;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data.message;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
