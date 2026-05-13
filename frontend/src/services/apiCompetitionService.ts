import api from './api';
import type {
  Competition,
  CompetitionRegistration,
  CompetitionResult,
} from '../types';

// ─── Competitions ─────────────────────────────────────────────────────────────

export const apiCompetitionService = {
  async getAll(): Promise<Competition[]> {
    const { data } = await api.get<Competition[]>('/competitions');
    return data;
  },

  async getById(id: string): Promise<Competition> {
    const { data } = await api.get<Competition>(`/competitions/${id}`);
    return data;
  },

  async create(payload: Omit<Competition, 'id' | 'createdAt'>): Promise<Competition> {
    const { data } = await api.post<Competition>('/competitions', payload);
    return data;
  },

  async update(id: string, payload: Partial<Competition>): Promise<Competition> {
    const { data } = await api.patch<Competition>(`/competitions/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/competitions/${id}`);
  },
};

// ─── Competition Registrations ────────────────────────────────────────────────

export const apiCompRegistrationService = {
  async getAll(): Promise<CompetitionRegistration[]> {
    const { data } = await api.get<CompetitionRegistration[]>('/registrations');
    return data;
  },

  async getMine(): Promise<CompetitionRegistration[]> {
    const { data } = await api.get<CompetitionRegistration[]>('/registrations/my');
    return data;
  },

  async getByCompetition(competitionId: string): Promise<CompetitionRegistration[]> {
    const { data } = await api.get<CompetitionRegistration[]>(
      `/registrations/competition/${competitionId}`,
    );
    return data;
  },

  async register(
    competitionId: string,
    categoryId: string,
  ): Promise<CompetitionRegistration> {
    const { data } = await api.post<CompetitionRegistration>('/registrations', {
      competitionId,
      categoryId,
    });
    return data;
  },

  async updateStatus(
    registrationId: string,
    status: CompetitionRegistration['status'],
  ): Promise<CompetitionRegistration> {
    const { data } = await api.patch<CompetitionRegistration>(
      `/registrations/${registrationId}/status`,
      { status },
    );
    return data;
  },

  async withdraw(registrationId: string): Promise<void> {
    await api.patch(`/registrations/${registrationId}/withdraw`);
  },
};

// ─── Competition Results ──────────────────────────────────────────────────────

export const apiCompResultService = {
  async getByCompetition(competitionId: string): Promise<CompetitionResult[]> {
    const { data } = await api.get<CompetitionResult[]>(
      `/results/competition/${competitionId}`,
    );
    return data;
  },

  async getByUser(userId: string): Promise<CompetitionResult[]> {
    const { data } = await api.get<CompetitionResult[]>(`/results/user/${userId}`);
    return data;
  },

  async save(
    payload: Omit<CompetitionResult, 'id' | 'recordedAt'>,
  ): Promise<CompetitionResult> {
    const { data } = await api.post<CompetitionResult>('/results', payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/results/${id}`);
  },
};
