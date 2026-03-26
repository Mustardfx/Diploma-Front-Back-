import { useState, useMemo } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import type { AuthUser, UserRole } from '../../types';

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: 'admin',   label: 'Администратор', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'coach',   label: 'Тренер',        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'athlete', label: 'Спортсмен',     color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'judge',   label: 'Судья',         color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
];

function getRoleConfig(role: UserRole) {
  return ROLES.find(r => r.value === role) ?? ROLES[2];
}

function AddUserModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ lastName: '', firstName: '', patronymic: '', email: '', phone: '', password: '12345678', role: 'athlete' as UserRole });
  const [error, setError] = useState('');

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      authService.createUser({ ...form, role: form.role });
      onSave();
      onClose();
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">Добавить пользователя</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Фамилия *</label>
              <input value={form.lastName} onChange={set('lastName')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Имя *</label>
              <input value={form.firstName} onChange={set('firstName')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Отчество</label>
            <input value={form.patronymic} onChange={set('patronymic')} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Телефон</label>
            <input value={form.phone} onChange={set('phone')} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Роль</label>
              <select value={form.role} onChange={set('role')} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Пароль *</label>
              <input value={form.password} onChange={set('password')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm">Отмена</button>
            <button type="submit" className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm">Создать</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [tick, setTick] = useState(0);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const users: AuthUser[] = useMemo(() => authService.getAllUsers(), [tick]);

  const filtered = useMemo(() => users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    const q = search.toLowerCase();
    return !q || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  }), [users, roleFilter, search]);

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (userId === currentUser?.id) { notify('Нельзя изменить роль самому себе', 'error'); return; }
    authService.updateProfile(userId, { role: newRole } as never);
    setTick(n => n + 1);
    notify('Роль обновлена', 'success');
  };

  const roleCount = useMemo(() => {
    const counts: Record<string, number> = {};
    ROLES.forEach(r => { counts[r.value] = users.filter(u => u.role === r.value).length; });
    return counts;
  }, [users]);

  return (
    <MainLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Пользователи</h1>
            <p className="text-slate-400 mt-1">Всего: {users.length}</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors">
            + Добавить
          </button>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        {/* Role stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {ROLES.map(r => (
            <button key={r.value} onClick={() => setRoleFilter(prev => prev === r.value ? 'all' : r.value)}
              className={`p-3 rounded-xl border text-left transition-all ${roleFilter === r.value ? r.color : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
              <div className="text-2xl font-black text-white">{roleCount[r.value] ?? 0}</div>
              <div className={`text-xs mt-0.5 ${roleFilter === r.value ? '' : 'text-slate-500'}`}>{r.label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени или email..."
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm" />
        </div>

        {/* Users list */}
        <div className="space-y-2">
          {filtered.map(u => {
            const roleCfg = getRoleConfig(u.role);
            const isExpanded = expandedUser === u.id;
            const isCurrentUser = u.id === currentUser?.id;

            return (
              <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all">
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border ${roleCfg.color}`}>
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{u.lastName} {u.firstName} {u.patronymic}</span>
                      {isCurrentUser && <span className="text-xs text-slate-500">(вы)</span>}
                    </div>
                    <div className="text-slate-500 text-xs">{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${roleCfg.color}`}>{roleCfg.label}</span>
                    <span className="text-slate-600 text-sm">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-800 p-4 bg-slate-800/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-slate-400 text-xs font-medium mb-2">Данные</h4>
                        <div className="space-y-1 text-sm">
                          {u.city && <div><span className="text-slate-500">Город:</span> <span className="text-white ml-1">{u.city}</span></div>}
                          {u.sport && <div><span className="text-slate-500">Спорт:</span> <span className="text-white ml-1">{u.sport}</span></div>}
                          {u.birthDate && <div><span className="text-slate-500">Дата рождения:</span> <span className="text-white ml-1">{new Date(u.birthDate).toLocaleDateString('ru-RU')}</span></div>}
                          <div><span className="text-slate-500">Зарегистрирован:</span> <span className="text-white ml-1">{new Date(u.createdAt).toLocaleDateString('ru-RU')}</span></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-400 text-xs font-medium mb-2">Изменить роль</h4>
                        <div className="flex flex-wrap gap-2">
                          {ROLES.map(r => (
                            <button key={r.value}
                              onClick={() => handleRoleChange(u.id, r.value)}
                              disabled={isCurrentUser || u.role === r.value}
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                u.role === r.value ? r.color : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                              }`}>
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p>Пользователи не найдены</p>
          </div>
        )}

        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onSave={() => setTick(n => n + 1)}
          />
        )}
      </div>
    </MainLayout>
  );
}
