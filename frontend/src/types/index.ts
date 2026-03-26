// ==================== РОЛИ ====================
export type UserRole = 'admin' | 'coach' | 'athlete' | 'judge';

// ==================== ПОЛЬЗОВАТЕЛЬ ====================
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  birthDate?: string;
  city?: string;
  sport?: string;
  createdAt: string;
}

export type AuthUser = Omit<User, 'password'>;

// ==================== СЕКЦИИ ====================
export interface Section {
  id: string;
  name: string;
  sport: string;
  coachId: string;
  description: string;
  schedule: ScheduleItem[];
  maxParticipants: number;
  location: string;
  ageMin?: number;
  ageMax?: number;
  price?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ScheduleItem {
  dayOfWeek: number; // 0=Пн, 1=Вт, ...
  timeStart: string; // "10:00"
  timeEnd: string;   // "12:00"
}

// ==================== ЗАПИСЬ НА СЕКЦИЮ ====================
export interface Enrollment {
  id: string;
  sectionId: string;
  userId: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
}

// ==================== ПОСЕЩАЕМОСТЬ ====================
export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  sectionId: string;
  userId: string;
  date: string; // "2025-03-10"
  present: boolean;
  note?: string;
}

// ==================== СОРЕВНОВАНИЯ ====================
export interface Competition {
  id: string;
  name: string;
  sport: string;
  organizerId: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  categories: CompetitionCategory[];
  imageUrl?: string;
  createdAt: string;
}

export interface CompetitionCategory {
  id: string;
  name: string;       // "Юниоры до 18", "Взрослые"
  ageMin?: number;
  ageMax?: number;
  weightClass?: string;
}

// ==================== РЕГИСТРАЦИЯ НА СОРЕВНОВАНИЕ ====================
export interface CompetitionRegistration {
  id: string;
  competitionId: string;
  userId: string;
  categoryId: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  registeredAt: string;
  judgeId?: string;
}

// ==================== РЕЗУЛЬТАТЫ СОРЕВНОВАНИЯ ====================
export interface CompetitionResult {
  id: string;
  competitionId: string;
  registrationId: string;
  userId: string;
  categoryId: string;
  place?: number;
  score?: number;
  notes?: string;
  judgeId: string;
  recordedAt: string;
}

// ==================== УВЕДОМЛЕНИЯ ====================
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}
