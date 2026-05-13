import api from './api';
import type { Section, Enrollment, AttendanceRecord } from '../types';

// ─── Sections ────────────────────────────────────────────────────────────────

export const apiSectionService = {
  async getAll(): Promise<Section[]> {
    const { data } = await api.get<Section[]>('/sections');
    return data;
  },

  async getById(id: string): Promise<Section> {
    const { data } = await api.get<Section>(`/sections/${id}`);
    return data;
  },

  async create(payload: Omit<Section, 'id' | 'createdAt'>): Promise<Section> {
    const { data } = await api.post<Section>('/sections', payload);
    return data;
  },

  async update(id: string, payload: Partial<Section>): Promise<Section> {
    const { data } = await api.patch<Section>(`/sections/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/sections/${id}`);
  },
};

// ─── Enrollments ─────────────────────────────────────────────────────────────

export const apiEnrollmentService = {
  async getAll(): Promise<Enrollment[]> {
    const { data } = await api.get<Enrollment[]>('/enrollments');
    return data;
  },

  async getMine(): Promise<Enrollment[]> {
    const { data } = await api.get<Enrollment[]>('/enrollments/my');
    return data;
  },

  async getBySection(sectionId: string): Promise<Enrollment[]> {
    const { data } = await api.get<Enrollment[]>(`/enrollments/section/${sectionId}`);
    return data;
  },

  async enroll(sectionId: string): Promise<Enrollment> {
    const { data } = await api.post<Enrollment>('/enrollments', { sectionId });
    return data;
  },

  async cancel(enrollmentId: string): Promise<void> {
    await api.patch(`/enrollments/${enrollmentId}/cancel`);
  },
};

// ─── Attendance ───────────────────────────────────────────────────────────────

export const apiAttendanceService = {
  async getForSection(sectionId: string, date: string): Promise<AttendanceRecord[]> {
    const { data } = await api.get<AttendanceRecord[]>(
      `/attendance?sectionId=${sectionId}&date=${date}`,
    );
    return data;
  },

  async getUserStats(
    userId: string,
    sectionId: string,
  ): Promise<{ total: number; present: number; percent: number }> {
    const { data } = await api.get(`/attendance/stats/${userId}/${sectionId}`);
    return data;
  },

  async mark(records: Omit<AttendanceRecord, 'id'>[]): Promise<void> {
    await api.post('/attendance/mark', records);
  },
};
