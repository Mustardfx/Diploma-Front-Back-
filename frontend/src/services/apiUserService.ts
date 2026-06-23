import api from './api';
import type { AuthUser, UserRole } from '../types';

// ─── Users ─────────────────────────────────────────────────────────────────────

export const apiUserService = {
  async getAll(): Promise<AuthUser[]> {
    const { data } = await api.get<AuthUser[]>('/users');
    return data;
  },

  async getById(id: string): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>(`/users/${id}`);
    return data;
  },

  async create(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    patronymic?: string;
    phone?: string;
    role?: UserRole;
  }): Promise<AuthUser> {
    const { data } = await api.post<AuthUser>('/users', payload);
    return data;
  },

  async update(id: string, payload: Partial<Omit<AuthUser, 'id'>>): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>(`/users/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
