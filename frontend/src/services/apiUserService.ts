import api from './api';
import type { AuthUser } from '../types';

export const apiUserService = {
  async getAllUsers(): Promise<AuthUser[]> {
    const { data } = await api.get<AuthUser[]>('/users');
    return data;
  },

  async getUserById(userId: string): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>(`/users/${userId}`);
    return data;
  },

  async updateUser(userId: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>(`/users/${userId}`, updates);
    return data;
  },

  async updateUserRole(userId: string, role: AuthUser['role']): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>(`/users/${userId}/role`, { role });
    return data;
  },
};
