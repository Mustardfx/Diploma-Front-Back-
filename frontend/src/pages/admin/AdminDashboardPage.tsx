import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { MainLayout } from '../../components/layout/MainLayout';
import { apiUserService } from '../../services/apiUserService';
import { apiSectionService, apiEnrollmentService } from '../../services/apiSectionService';
import { apiCompetitionService, apiCompRegistrationService } from '../../services/apiCompetitionService';
import type { AuthUser, Competition, CompetitionRegistration, Enrollment, Section } from '../../types';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: string;
  to?: string;
}

function StatCard({ label, value, sub, color, icon, to }: StatCardProps) {
  const content = (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all ${to ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>{icon}</div>
        {to && <span className="text-xs text-slate-600">→</span>}
      </div>
      <div className="mb-1 text-3xl font-black text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="mt-1 text-xs text-slate-600">{sub}</div>}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export function AdminDashboardPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [u, s, c, e, r] = await Promise.all([
          apiUserService.getAll().catch(() => []),
          apiSectionService.getAll().catch(() => []),
          apiCompetitionService.getAll().catch(() => []),
          apiEnrollmentService.getAll().catch(() => []),
          apiCompRegistrationService.getAll().catch(() => []),
        ]);
        setUsers(u);
        setSections(s);
        setCompetitions(c);
        setEnrollments(e);
        setRegistrations(r);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const getRegisteredCount = (competitionId: string) =>
    registrations.filter(r => r.competitionId === competitionId && r.status !== 'rejected' && r.status !== 'withdrawn').length;

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      athletes: users.filter(u => u.role === 'athlete').length,
      coaches: users.filter(u => u.role === 'coach').length,
      judges: users.filter(u => u.role === 'judge').length,
      totalSections: sections.length,
      activeSections: sections.filter(s => s.isActive).length,
      totalEnrollments: enrollments.filter(e => e.status === 'active').length,
      totalCompetitions: competitions.length,
      upcomingCompetitions: competitions.filter(c => c.status === 'upcoming').length,
      ongoingCompetitions: competitions.filter(c => c.status === 'ongoing').length,
      pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
      recentUsers: [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
      recentCompetitions: [...competitions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
    };
  }, [users, sections, competitions, enrollments, registrations]);

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-red-500/10 text-red-400 border border-red-500/20',
    coach: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    athlete: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    judge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  };
  const ROLE_LABELS: Record<string, string> = { admin: 'Админ', coach: 'Тренер', athlete: 'Спортсмен', judge: 'Судья' };

  const COMP_STATUS: Record<string, string> = {
    upcoming: 'text-blue-400', ongoing: 'text-emerald-400',
    completed: 'text-slate-400', cancelled: 'text-red-400',
  };
  const COMP_LABEL: Record<string, string> = {
    upcoming: 'Предстоит', ongoing: 'Идёт', completed: 'Завершено', cancelled: 'Отменено',
  };

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Панель администратора</h1>
          <p className="text-slate-400 mt-1">Всего: {loading ? '...' : stats.totalUsers}</p>
        </div>

        {loading && (
          <div className="text-center py-20 text-slate-500">
            <div className="text-4xl mb-3">⏳</div>
            <p>Загрузка данных…</p>
          </div>
        )}

        {!loading && (
          <>
          <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
            <StatCard label="Пользователей" value={stats.totalUsers} sub={`${stats.athletes} спортсменов`} color="bg-emerald-500/10 text-emerald-400" icon="◎" to="/admin/users" />
            <StatCard label="Секций" value={stats.totalSections} sub={`${stats.activeSections} активных`} color="bg-blue-500/10 text-blue-400" icon="◈" to="/admin/sections" />
            <StatCard label="Соревнований" value={stats.totalCompetitions} sub={`${stats.upcomingCompetitions} предстоит`} color="bg-amber-500/10 text-amber-400" icon="⚡" to="/admin/competitions" />
            <StatCard label="Записей на секции" value={stats.totalEnrollments} sub="активных" color="bg-purple-500/10 text-purple-400" icon="✓" />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
            {[
              { label: 'Тренеров', value: stats.coaches, color: 'text-blue-400' },
              { label: 'Судей', value: stats.judges, color: 'text-amber-400' },
              { label: 'Идут сейчас', value: stats.ongoingCompetitions, color: 'text-emerald-400' },
              { label: 'Заявок ожидают', value: stats.pendingRegistrations, color: stats.pendingRegistrations > 0 ? 'text-yellow-400' : 'text-slate-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 border bg-slate-900 border-slate-800 rounded-xl">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className={`text-xl font-black ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent users */}
            <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">Последние пользователи</h2>
                <Link to="/admin/users" className="text-sm text-emerald-400 hover:text-emerald-300">Все →</Link>
              </div>
              <div className="space-y-3">
                {stats.recentUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-bold rounded-full bg-slate-700 text-slate-300">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{u.lastName} {u.firstName}</div>
                      <div className="text-xs truncate text-slate-500">{u.email}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent competitions */}
            <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">Соревнования</h2>
                <Link to="/admin/competitions" className="text-sm text-amber-400 hover:text-amber-300">Все →</Link>
              </div>
              <div className="space-y-3">
                {stats.recentCompetitions.map(c => {
                  const count = getRegisteredCount(c.id);
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm rounded-xl bg-slate-800 text-amber-400">⚡</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{c.name}</div>
                        <div className="text-xs text-slate-500">{count}/{c.maxParticipants} участников</div>
                      </div>
                      <span className={`text-xs font-medium flex-shrink-0 ${COMP_STATUS[c.status]}`}>
                        {COMP_LABEL[c.status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="p-6 border lg:col-span-2 bg-slate-900 border-slate-800 rounded-2xl">
              <h2 className="mb-4 font-bold text-white">Быстрые действия</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'Добавить пользователя', to: '/admin/users', color: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
                  { label: 'Создать секцию', to: '/coach/sections', color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20' },
                  { label: 'Создать соревнование', to: '/admin/competitions', color: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20' },
                  { label: 'Отметить посещаемость', to: '/coach/attendance', color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20' },
                ].map(action => (
                  <Link key={action.to} to={action.to}
                    className={`p-4 rounded-xl border text-sm font-medium text-center transition-colors ${action.color}`}>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </MainLayout>
);
}
