


import type { User, AuthUser, UserRole } from '../types';

const USERS_KEY = 'sport_app_users';
const CURRENT_USER_KEY = 'sport_app_current_user';
const TOKEN_KEY = 'sport_app_token';

const DEFAULT_USERS: User[] = [
  { id: '1', email: 'admin@sport.ru', password: 'admin123', role: 'admin', firstName: 'Александр', lastName: 'Иванов', patronymic: 'Петрович', phone: '+7 (700) 000-00-01', city: 'Алматы', createdAt: new Date().toISOString() },
  { id: '2', email: 'coach@sport.ru', password: 'coach123', role: 'coach', firstName: 'Мария', lastName: 'Сергеева', patronymic: 'Николаевна', phone: '+7 (700) 000-00-02', sport: 'Борьба', city: 'Алматы', createdAt: new Date().toISOString() },
  { id: '3', email: 'athlete@sport.ru', password: 'athlete123', role: 'athlete', firstName: 'Дмитрий', lastName: 'Козлов', phone: '+7 (700) 000-00-03', sport: 'Борьба', city: 'Алматы', birthDate: '2000-05-15', createdAt: new Date().toISOString() },
  { id: '4', email: 'judge@sport.ru', password: 'judge123', role: 'judge', firstName: 'Елена', lastName: 'Петрова', patronymic: 'Владимировна', phone: '+7 (700) 000-00-04', sport: 'Борьба', city: 'Алматы', createdAt: new Date().toISOString() },
];

function initUsers(): void {
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
}
function getUsers(): User[] { initUsers(); return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); }
function saveUsers(users: User[]): void { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function generateToken(userId: string): string { return `token_${userId}_${Date.now()}`; }
function toAuthUser(user: User): AuthUser { const { password: _, ...authUser } = user; return authUser; }

export const authService = {
  login(email: string, password: string): AuthUser {
    const user = getUsers().find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Неверный email или пароль');
    localStorage.setItem(TOKEN_KEY, generateToken(user.id));
    const authUser = toAuthUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return authUser;
  },

  register(data: { email: string; password: string; firstName: string; lastName: string; patronymic?: string; phone?: string; role?: UserRole; }): AuthUser {
    const users = getUsers();
    if (users.find(u => u.email === data.email)) throw new Error('Пользователь с таким email уже существует');
    const newUser: User = { id: `user_${Date.now()}`, email: data.email, password: data.password, role: data.role ?? 'athlete', firstName: data.firstName, lastName: data.lastName, patronymic: data.patronymic, phone: data.phone, createdAt: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    const authUser = toAuthUser(newUser);
    localStorage.setItem(TOKEN_KEY, generateToken(newUser.id));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return authUser;
  },

  // Создать пользователя без смены сессии (для администратора)
  createUser(data: { email: string; password: string; firstName: string; lastName: string; patronymic?: string; phone?: string; role?: UserRole; }): AuthUser {
    const users = getUsers();
    if (users.find(u => u.email === data.email)) throw new Error('Пользователь с таким email уже существует');
    const newUser: User = { id: `user_${Date.now()}`, email: data.email, password: data.password, role: data.role ?? 'athlete', firstName: data.firstName, lastName: data.lastName, patronymic: data.patronymic, phone: data.phone, createdAt: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    return toAuthUser(newUser);
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated(): boolean { return !!localStorage.getItem(TOKEN_KEY); },

  updateProfile(userId: string, updates: Partial<Omit<User, 'id' | 'password'>>): AuthUser {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('Пользователь не найден');
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    const authUser = toAuthUser(users[idx]);
    // Обновить сессию только если редактируется текущий пользователь
    const currentRaw = localStorage.getItem(CURRENT_USER_KEY);
    if (currentRaw && (JSON.parse(currentRaw) as AuthUser).id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    }
    return authUser;
  },

  getAllUsers(): AuthUser[] { return getUsers().map(toAuthUser); },

  getUserById(id: string): AuthUser | null {
    const user = getUsers().find(u => u.id === id);
    return user ? toAuthUser(user) : null;
  },
};
