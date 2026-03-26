import type { Section, Enrollment, AttendanceRecord } from '../types';

const SECTIONS_KEY = 'sport_sections';
const ENROLLMENTS_KEY = 'sport_enrollments';
const ATTENDANCE_KEY = 'sport_attendance';

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// ==================== МОКОВЫЕ ДАННЫЕ ====================
const DEFAULT_SECTIONS: Section[] = [
  {
    id: 's1',
    name: 'Вольная борьба',
    sport: 'Борьба',
    coachId: '2',
    description: 'Секция по вольной борьбе для начинающих и опытных спортсменов. Развиваем силу, ловкость и стратегическое мышление.',
    schedule: [
      { dayOfWeek: 0, timeStart: '09:00', timeEnd: '11:00' },
      { dayOfWeek: 2, timeStart: '09:00', timeEnd: '11:00' },
      { dayOfWeek: 4, timeStart: '09:00', timeEnd: '11:00' },
    ],
    maxParticipants: 20,
    location: 'Спортзал №1, ул. Абая 12',
    ageMin: 10,
    ageMax: 18,
    price: 5000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 's2',
    name: 'Греко-римская борьба',
    sport: 'Борьба',
    coachId: '2',
    description: 'Классическая борьба. Техника, дисциплина, командный дух. Подготовка к региональным соревнованиям.',
    schedule: [
      { dayOfWeek: 1, timeStart: '14:00', timeEnd: '16:00' },
      { dayOfWeek: 3, timeStart: '14:00', timeEnd: '16:00' },
      { dayOfWeek: 5, timeStart: '10:00', timeEnd: '12:00' },
    ],
    maxParticipants: 15,
    location: 'Спортзал №2, ул. Абая 12',
    ageMin: 12,
    ageMax: 25,
    price: 4500,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 's3',
    name: 'Бокс',
    sport: 'Бокс',
    coachId: '2',
    description: 'Профессиональная подготовка боксёров. Работа с тренером, спарринги, общефизическая подготовка.',
    schedule: [
      { dayOfWeek: 0, timeStart: '17:00', timeEnd: '19:00' },
      { dayOfWeek: 2, timeStart: '17:00', timeEnd: '19:00' },
      { dayOfWeek: 4, timeStart: '17:00', timeEnd: '19:00' },
    ],
    maxParticipants: 12,
    location: 'Боксёрский клуб, пр. Достык 45',
    ageMin: 14,
    price: 6000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 's4',
    name: 'Плавание (продвинутый)',
    sport: 'Плавание',
    coachId: '2',
    description: 'Секция для опытных пловцов. Совершенствование техники всех стилей плавания, подготовка к соревнованиям.',
    schedule: [
      { dayOfWeek: 1, timeStart: '07:00', timeEnd: '09:00' },
      { dayOfWeek: 3, timeStart: '07:00', timeEnd: '09:00' },
      { dayOfWeek: 5, timeStart: '07:00', timeEnd: '09:00' },
    ],
    maxParticipants: 10,
    location: 'Бассейн Олимп, ул. Тимирязева 28',
    ageMin: 8,
    price: 8000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 's5',
    name: 'Лёгкая атлетика',
    sport: 'Лёгкая атлетика',
    coachId: '2',
    description: 'Бег, прыжки, метания. Развитие выносливости и скоростных качеств. Участие в городских соревнованиях.',
    schedule: [
      { dayOfWeek: 0, timeStart: '08:00', timeEnd: '10:00' },
      { dayOfWeek: 2, timeStart: '08:00', timeEnd: '10:00' },
      { dayOfWeek: 6, timeStart: '09:00', timeEnd: '11:00' },
    ],
    maxParticipants: 25,
    location: 'Центральный стадион',
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_ENROLLMENTS: Enrollment[] = [
  { id: 'e1', sectionId: 's1', userId: '3', status: 'active', enrolledAt: new Date().toISOString() },
  { id: 'e2', sectionId: 's3', userId: '3', status: 'active', enrolledAt: new Date().toISOString() },
];

// ==================== INIT ====================
function init() {
  if (!localStorage.getItem(SECTIONS_KEY)) {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(DEFAULT_SECTIONS));
  }
  if (!localStorage.getItem(ENROLLMENTS_KEY)) {
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(DEFAULT_ENROLLMENTS));
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
  }
}

function getSections(): Section[] {
  init();
  return JSON.parse(localStorage.getItem(SECTIONS_KEY) ?? '[]');
}
function saveSections(s: Section[]) {
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(s));
}
function getEnrollments(): Enrollment[] {
  init();
  return JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) ?? '[]');
}
function saveEnrollments(e: Enrollment[]) {
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(e));
}
function getAttendance(): AttendanceRecord[] {
  init();
  return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) ?? '[]');
}
function saveAttendance(a: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(a));
}

// ==================== SECTIONS SERVICE ====================
export const sectionService = {
  getAll(): Section[] {
    return getSections();
  },

  getById(id: string): Section | null {
    return getSections().find(s => s.id === id) ?? null;
  },

  getByCoach(coachId: string): Section[] {
    return getSections().filter(s => s.coachId === coachId);
  },

  create(data: Omit<Section, 'id' | 'createdAt'>): Section {
    const sections = getSections();
    const newSection: Section = {
      ...data,
      id: `s_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    sections.push(newSection);
    saveSections(sections);
    return newSection;
  },

  update(id: string, data: Partial<Section>): Section {
    const sections = getSections();
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Секция не найдена');
    sections[idx] = { ...sections[idx], ...data };
    saveSections(sections);
    return sections[idx];
  },

  delete(id: string): void {
    saveSections(getSections().filter(s => s.id !== id));
  },

  getEnrolledCount(sectionId: string): number {
    return getEnrollments().filter(e => e.sectionId === sectionId && e.status === 'active').length;
  },

  formatSchedule(section: Section): string {
    return section.schedule
      .map(s => `${DAY_NAMES[s.dayOfWeek]} ${s.timeStart}–${s.timeEnd}`)
      .join(', ');
  },
};

// ==================== ENROLLMENT SERVICE ====================
export const enrollmentService = {
  getAll(): Enrollment[] {
    return getEnrollments();
  },

  getUserEnrollments(userId: string): Enrollment[] {
    return getEnrollments().filter(e => e.userId === userId);
  },

  getSectionEnrollments(sectionId: string): Enrollment[] {
    return getEnrollments().filter(e => e.sectionId === sectionId && e.status === 'active');
  },

  isEnrolled(userId: string, sectionId: string): boolean {
    return getEnrollments().some(e => e.userId === userId && e.sectionId === sectionId && e.status === 'active');
  },

  enroll(userId: string, sectionId: string): Enrollment {
    const enrollments = getEnrollments();
    const existing = enrollments.find(e => e.userId === userId && e.sectionId === sectionId);
    if (existing) {
      if (existing.status === 'active') throw new Error('Вы уже записаны на эту секцию');
      existing.status = 'active';
      saveEnrollments(enrollments);
      return existing;
    }
    const section = sectionService.getById(sectionId);
    if (!section) throw new Error('Секция не найдена');
    const count = sectionService.getEnrolledCount(sectionId);
    if (count >= section.maxParticipants) throw new Error('Секция заполнена');

    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      sectionId,
      userId,
      status: 'active',
      enrolledAt: new Date().toISOString(),
    };
    enrollments.push(newEnrollment);
    saveEnrollments(enrollments);
    return newEnrollment;
  },

  cancel(userId: string, sectionId: string): void {
    const enrollments = getEnrollments();
    const e = enrollments.find(en => en.userId === userId && en.sectionId === sectionId && en.status === 'active');
    if (!e) throw new Error('Запись не найдена');
    e.status = 'cancelled';
    saveEnrollments(enrollments);
  },
};

// ==================== ATTENDANCE SERVICE ====================
export const attendanceService = {
  getForSection(sectionId: string, date: string): AttendanceRecord[] {
    return getAttendance().filter(a => a.sectionId === sectionId && a.date === date);
  },

  getUserStats(userId: string, sectionId: string): { total: number; present: number; percent: number } {
    const records = getAttendance().filter(a => a.userId === userId && a.sectionId === sectionId);
    const present = records.filter(a => a.present).length;
    return {
      total: records.length,
      present,
      percent: records.length ? Math.round((present / records.length) * 100) : 0,
    };
  },

  markAttendance(records: Omit<AttendanceRecord, 'id'>[]): void {
    const all = getAttendance();
    records.forEach(rec => {
      const idx = all.findIndex(a => a.userId === rec.userId && a.sectionId === rec.sectionId && a.date === rec.date);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...rec };
      } else {
        all.push({ ...rec, id: `att_${Date.now()}_${Math.random()}` });
      }
    });
    saveAttendance(all);
  },
};
