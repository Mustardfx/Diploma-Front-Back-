import api from './api';
import type {
  Competition,
  CompetitionRegistration,
  CompetitionResult,
  LeaderboardRow,
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
    // judgeId проставляет бэкенд из токена; DTO его запрещает (forbidNonWhitelisted).
    const { judgeId: _judgeId, ...body } = payload;
    const { data } = await api.post<CompetitionResult>('/results', body);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/results/${id}`);
  },
};

// ─── Баллы за уроки + рейтинг ─────────────────────────────────────────────────

export const apiLessonPointsService = {
  // Накопленный рейтинг по баллам за уроки (опц. в рамках секции)
  async getLeaderboard(sectionId?: string): Promise<LeaderboardRow[]> {
    const url = sectionId
      ? `/results/leaderboard/section/${sectionId}`
      : '/results/leaderboard';
    const { data } = await api.get<LeaderboardRow[]>(url);
    return data;
  },

  // Баллы за уроки конкретной секции (для UI тренера)
  async getBySection(sectionId: string): Promise<CompetitionResult[]> {
    const { data } = await api.get<CompetitionResult[]>(`/results/lesson/section/${sectionId}`);
    return data;
  },

  async save(payload: {
    sectionId: string;
    userId: string;
    lessonDate: string;
    score: number;
    notes?: string;
  }): Promise<CompetitionResult> {
    const { data } = await api.post<CompetitionResult>('/results/lesson', payload);
    return data;
  },
};
