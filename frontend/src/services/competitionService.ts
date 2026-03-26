import type { Competition, CompetitionRegistration, CompetitionResult, CompetitionCategory } from '../types';

const COMPETITIONS_KEY = 'sport_competitions';
const REGISTRATIONS_KEY = 'sport_comp_registrations';
const RESULTS_KEY = 'sport_comp_results';

// ==================== МОКОВЫЕ ДАННЫЕ ====================
const DEFAULT_COMPETITIONS: Competition[] = [
  {
    id: 'c1',
    name: 'Открытый чемпионат по вольной борьбе',
    sport: 'Борьба',
    organizerId: '2',
    description: 'Ежегодный открытый чемпионат города по вольной борьбе. Принимаются спортсмены всех возрастных категорий. Победители получают медали и денежные призы.',
    location: 'Дворец спорта, пр. Абая 44',
    startDate: '2026-04-15',
    endDate: '2026-04-16',
    registrationDeadline: '2026-04-01',
    maxParticipants: 64,
    status: 'upcoming',
    categories: [
      { id: 'cat1', name: 'Юниоры до 18', ageMin: 14, ageMax: 18 },
      { id: 'cat2', name: 'Взрослые до 74 кг', ageMin: 18, weightClass: 'до 74 кг' },
      { id: 'cat3', name: 'Взрослые до 86 кг', ageMin: 18, weightClass: 'до 86 кг' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Городские соревнования по боксу',
    sport: 'Бокс',
    organizerId: '2',
    description: 'Отборочные соревнования для участия в областном чемпионате. Судейство по правилам AIBA.',
    location: 'Боксёрский клуб «Чемпион», ул. Достык 12',
    startDate: '2026-03-20',
    endDate: '2026-03-20',
    registrationDeadline: '2026-03-10',
    maxParticipants: 32,
    status: 'ongoing',
    categories: [
      { id: 'cat4', name: 'До 60 кг', weightClass: 'до 60 кг' },
      { id: 'cat5', name: 'До 69 кг', weightClass: 'до 69 кг' },
      { id: 'cat6', name: 'До 75 кг', weightClass: 'до 75 кг' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'Первенство школьников по лёгкой атлетике',
    sport: 'Лёгкая атлетика',
    organizerId: '2',
    description: 'Соревнования среди учащихся школ города. Дисциплины: бег 100м, 400м, прыжки в длину, метание.',
    location: 'Центральный стадион',
    startDate: '2026-02-10',
    endDate: '2026-02-10',
    registrationDeadline: '2026-02-01',
    maxParticipants: 100,
    status: 'completed',
    categories: [
      { id: 'cat7', name: 'Мальчики 12–14 лет', ageMin: 12, ageMax: 14 },
      { id: 'cat8', name: 'Девочки 12–14 лет', ageMin: 12, ageMax: 14 },
      { id: 'cat9', name: 'Юноши 15–17 лет', ageMin: 15, ageMax: 17 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c4',
    name: 'Кубок города по плаванию',
    sport: 'Плавание',
    organizerId: '2',
    description: 'Соревнования по плаванию вольным стилем и брасс на дистанции 50м и 100м.',
    location: 'Бассейн «Олимп», ул. Тимирязева 28',
    startDate: '2026-05-05',
    endDate: '2026-05-06',
    registrationDeadline: '2026-04-20',
    maxParticipants: 50,
    status: 'upcoming',
    categories: [
      { id: 'cat10', name: 'Дети до 12 лет', ageMax: 12 },
      { id: 'cat11', name: 'Юниоры 13–17 лет', ageMin: 13, ageMax: 17 },
      { id: 'cat12', name: 'Взрослые 18+', ageMin: 18 },
    ],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_REGISTRATIONS: CompetitionRegistration[] = [
  { id: 'cr1', competitionId: 'c1', userId: '3', categoryId: 'cat1', status: 'approved', registeredAt: new Date().toISOString() },
  { id: 'cr2', competitionId: 'c2', userId: '3', categoryId: 'cat4', status: 'pending', registeredAt: new Date().toISOString() },
];

const DEFAULT_RESULTS: CompetitionResult[] = [
  { id: 'res1', competitionId: 'c3', registrationId: 'cr1', userId: '3', categoryId: 'cat7', place: 2, score: 95, judgeId: '4', recordedAt: new Date().toISOString() },
];

// ==================== INIT ====================
function init() {
  if (!localStorage.getItem(COMPETITIONS_KEY)) localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(DEFAULT_COMPETITIONS));
  if (!localStorage.getItem(REGISTRATIONS_KEY)) localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(DEFAULT_REGISTRATIONS));
  if (!localStorage.getItem(RESULTS_KEY)) localStorage.setItem(RESULTS_KEY, JSON.stringify(DEFAULT_RESULTS));
}

function getCompetitions(): Competition[] { init(); return JSON.parse(localStorage.getItem(COMPETITIONS_KEY) ?? '[]'); }
function saveCompetitions(d: Competition[]) { localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(d)); }
function getRegistrations(): CompetitionRegistration[] { init(); return JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) ?? '[]'); }
function saveRegistrations(d: CompetitionRegistration[]) { localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(d)); }
function getResults(): CompetitionResult[] { init(); return JSON.parse(localStorage.getItem(RESULTS_KEY) ?? '[]'); }
function saveResults(d: CompetitionResult[]) { localStorage.setItem(RESULTS_KEY, JSON.stringify(d)); }

// ==================== COMPETITION SERVICE ====================
export const competitionService = {
  getAll(): Competition[] { return getCompetitions(); },

  getById(id: string): Competition | null { return getCompetitions().find(c => c.id === id) ?? null; },

  getByOrganizer(organizerId: string): Competition[] { return getCompetitions().filter(c => c.organizerId === organizerId); },

  create(data: Omit<Competition, 'id' | 'createdAt'>): Competition {
    const all = getCompetitions();
    const item: Competition = { ...data, id: `comp_${Date.now()}`, createdAt: new Date().toISOString() };
    all.push(item);
    saveCompetitions(all);
    return item;
  },

  update(id: string, data: Partial<Competition>): Competition {
    const all = getCompetitions();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Соревнование не найдено');
    all[idx] = { ...all[idx], ...data };
    saveCompetitions(all);
    return all[idx];
  },

  delete(id: string): void { saveCompetitions(getCompetitions().filter(c => c.id !== id)); },

  getRegisteredCount(competitionId: string): number {
    return getRegistrations().filter(r => r.competitionId === competitionId && r.status !== 'rejected' && r.status !== 'withdrawn').length;
  },

  isDeadlinePassed(competition: Competition): boolean {
    return new Date(competition.registrationDeadline) < new Date();
  },

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  },
};

// ==================== REGISTRATION SERVICE ====================
export const compRegistrationService = {
  getAll(): CompetitionRegistration[] { return getRegistrations(); },

  getUserRegistrations(userId: string): CompetitionRegistration[] {
    return getRegistrations().filter(r => r.userId === userId);
  },

  getCompetitionRegistrations(competitionId: string): CompetitionRegistration[] {
    return getRegistrations().filter(r => r.competitionId === competitionId);
  },

  isRegistered(userId: string, competitionId: string): CompetitionRegistration | null {
    return getRegistrations().find(r => r.userId === userId && r.competitionId === competitionId && r.status !== 'withdrawn') ?? null;
  },

  register(userId: string, competitionId: string, categoryId: string): CompetitionRegistration {
    const regs = getRegistrations();
    const existing = regs.find(r => r.userId === userId && r.competitionId === competitionId);
    if (existing && existing.status !== 'withdrawn') throw new Error('Вы уже зарегистрированы на это соревнование');

    const comp = competitionService.getById(competitionId);
    if (!comp) throw new Error('Соревнование не найдено');
    if (comp.status === 'completed' || comp.status === 'cancelled') throw new Error('Регистрация закрыта');
    if (competitionService.isDeadlinePassed(comp)) throw new Error('Срок регистрации истёк');
    const count = competitionService.getRegisteredCount(competitionId);
    if (count >= comp.maxParticipants) throw new Error('Достигнут лимит участников');

    const reg: CompetitionRegistration = {
      id: `cr_${Date.now()}`,
      competitionId,
      userId,
      categoryId,
      status: 'pending',
      registeredAt: new Date().toISOString(),
    };
    if (existing) {
      const idx = regs.findIndex(r => r.id === existing.id);
      regs[idx] = { ...reg, id: existing.id };
    } else {
      regs.push(reg);
    }
    saveRegistrations(regs);
    return reg;
  },

  withdraw(userId: string, competitionId: string): void {
    const regs = getRegistrations();
    const r = regs.find(r => r.userId === userId && r.competitionId === competitionId);
    if (!r) throw new Error('Регистрация не найдена');
    r.status = 'withdrawn';
    saveRegistrations(regs);
  },

  updateStatus(registrationId: string, status: CompetitionRegistration['status']): void {
    const regs = getRegistrations();
    const idx = regs.findIndex(r => r.id === registrationId);
    if (idx === -1) throw new Error('Регистрация не найдена');
    regs[idx].status = status;
    saveRegistrations(regs);
  },
};

// ==================== RESULTS SERVICE ====================
export const compResultService = {
  getCompetitionResults(competitionId: string): CompetitionResult[] {
    return getResults().filter(r => r.competitionId === competitionId);
  },

  getUserResults(userId: string): CompetitionResult[] {
    return getResults().filter(r => r.userId === userId);
  },

  saveResult(data: Omit<CompetitionResult, 'id' | 'recordedAt'>): CompetitionResult {
    const all = getResults();
    const existing = all.findIndex(r => r.registrationId === data.registrationId);
    const result: CompetitionResult = { ...data, id: `res_${Date.now()}`, recordedAt: new Date().toISOString() };
    if (existing >= 0) { all[existing] = result; } else { all.push(result); }
    saveResults(all);
    return result;
  },

  deleteResult(id: string): void { saveResults(getResults().filter(r => r.id !== id)); },
};
