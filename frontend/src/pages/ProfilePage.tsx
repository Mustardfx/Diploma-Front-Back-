import { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiEnrollmentService, apiAttendanceService } from '../services/apiSectionService';
import type { Section } from '../types';

type Stats = { total: number; present: number; percent: number };
type MySection = { id: string; section: Section; stats: Stats | null };

const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  coach: 'Тренер',
  athlete: 'Спортсмен',
  judge: 'Судья',
};

const THEMES: { value: 'dark' | 'light' | 'cosmic'; label: string; swatch: React.CSSProperties }[] = [
  { value: 'dark',   label: 'Тёмная',  swatch: { background: '#020617', borderColor: '#334155' } },
  { value: 'light',  label: 'Светлая', swatch: { background: '#f1f5f9', borderColor: '#cbd5e1' } },
  { value: 'cosmic', label: 'Космос',  swatch: { background: 'radial-gradient(ellipse at 30% 20%, #6366f1, transparent 60%), radial-gradient(ellipse at 80% 70%, #a855f7, transparent 55%), #05010f', borderColor: 'rgba(139,92,246,0.5)' } },
];

export function ProfilePage() {
  const { user, updateProfile, hasRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    patronymic: user?.patronymic ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    sport: user?.sport ?? '',
    bio: user?.bio ?? '',
    birthDate: user?.birthDate ?? '',
  });
  const [notification, setNotification] = useState('');
  const [mySections, setMySections] = useState<MySection[]>([]);

  // My enrollments + attendance stats (from backend)
  useEffect(() => {
    if (!user || user.role !== 'athlete') { setMySections([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const enrollments = (await apiEnrollmentService.getMine()).filter(e => e.status === 'active' && e.section);
        const rows = await Promise.all(enrollments.map(async (e) => {
          let stats: Stats | null = null;
          try { stats = await apiAttendanceService.getUserStats(user.id, e.sectionId); } catch { stats = null; }
          return { id: e.id, section: e.section as Section, stats };
        }));
        if (!cancelled) setMySections(rows);
      } catch { if (!cancelled) setMySections([]); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    try {
      await updateProfile(form);
      setEditing(false);
      setNotification('Профиль обновлён!');
    } catch (e) {
      setNotification((e as Error).message || 'Не удалось сохранить профиль');
    }
    setTimeout(() => setNotification(''), 3000);
  };

  const avgAttendance = mySections.length > 0
    ? Math.round(mySections.reduce((sum, x) => sum + (x.stats?.percent ?? 0), 0) / mySections.length)
    : 0;

  return (
    <MainLayout>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white">Профиль</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-colors"
            >
              Редактировать
            </button>
          )}
        </div>

        {notification && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
            {notification}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar + role */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl mx-auto mb-4">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="text-white font-bold text-lg">
                {user.lastName} {user.firstName}
              </div>
              {user.patronymic && (
                <div className="text-slate-400 text-sm mt-0.5">
                  {user.patronymic}
                </div>
              )}
              <div
                className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : user.role === "coach"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : user.role === "judge"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {ROLE_LABELS[user.role]}
              </div>
              <div className="mt-3 text-slate-500 text-xs">{user.email}</div>
            </div>

            {/* Тема оформления */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 text-sm">Тема оформления</h3>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`rounded-xl border p-2 transition-all text-left ${
                      theme === t.value
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="w-full h-10 rounded-lg border mb-2" style={t.swatch} />
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs text-white truncate">{t.label}</span>
                      {theme === t.value && <span className="text-emerald-400 text-xs flex-shrink-0">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats (athlete only) */}
            {hasRole("athlete") && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4 text-sm">
                  Статистика
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Секций", value: mySections.length },
                    {
                      label: "Средняя посещаемость",
                      value: `${avgAttendance}%`,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex justify-between items-center"
                    >
                      <span className="text-slate-400 text-sm">
                        {stat.label}
                      </span>
                      <span className="text-white font-bold text-sm">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Личные данные</h2>

              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Фамилия", field: "lastName" as const },
                      { label: "Имя", field: "firstName" as const },
                    ].map((f) => (
                      <div key={f.field}>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                          {f.label}
                        </label>
                        <input
                          value={form[f.field]}
                          onChange={set(f.field)}
                          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                  {[
                    { label: "Отчество", field: "patronymic" as const },
                    { label: "Телефон", field: "phone" as const },
                    { label: "Город", field: "city" as const },
                    { label: "Вид спорта", field: "sport" as const },
                    {
                      label: "Дата рождения",
                      field: "birthDate" as const,
                      type: "date",
                    },
                  ].map((f) => (
                    <div key={f.field}>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type ?? "text"}
                        value={form[f.field]}
                        onChange={set(f.field)}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      О себе
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={set("bio")}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Телефон", value: user.phone },
                    { label: "Город", value: user.city },
                    { label: "Вид спорта", value: user.sport },
                    {
                      label: "Дата рождения",
                      value: user.birthDate
                        ? new Date(user.birthDate).toLocaleDateString("ru-RU")
                        : undefined,
                    },
                  ]
                    .filter((f) => f.value)
                    .map((f) => (
                      <div
                        key={f.label}
                        className="flex justify-between py-2 border-b border-slate-800 last:border-0"
                      >
                        <span className="text-slate-400 text-sm">
                          {f.label}
                        </span>
                        <span className="text-white text-sm">{f.value}</span>
                      </div>
                    ))}
                  {user.bio && (
                    <p className="text-slate-300 text-sm pt-2 leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                  {!user.phone && !user.city && !user.sport && !user.bio && (
                    <p className="text-slate-500 text-sm">
                      Профиль не заполнен. Нажмите «Редактировать» чтобы
                      добавить информацию.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* My sections (athlete) */}
            {hasRole("athlete") && mySections.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-bold mb-4">Мои секции</h2>
                <div className="space-y-3">
                  {mySections.map(({ section, stats }) => {
                    if (!section) return null;
                    return (
                      <div
                        key={section.id}
                        className="flex items-center justify-between py-2.5 px-4 bg-slate-800 rounded-xl"
                      >
                        <div>
                          <div className="text-white text-sm font-medium">
                            {section.name}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {section.sport}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-bold ${!stats || stats.total === 0 ? "text-slate-500" : stats.percent >= 75 ? "text-emerald-400" : stats.percent >= 50 ? "text-yellow-400" : "text-red-400"}`}
                          >
                            {stats && stats.total > 0
                              ? `${stats.percent}%`
                              : "—"}
                          </div>
                          <div className="text-slate-500 text-xs">
                            посещаемость
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
