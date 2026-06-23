import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { apiSectionService, apiEnrollmentService, apiAttendanceService } from '../services/apiSectionService';
import { apiCompetitionService, apiCompRegistrationService } from '../services/apiCompetitionService';
import { sectionService, enrollmentService, attendanceService } from '../services/sectionService';
import { competitionService, compRegistrationService } from '../services/competitionService';
import type { Competition, CompetitionRegistration, Section, Enrollment } from '../types';

// ==================== ATHLETE DASHBOARD ====================
function AthleteDashboard({ userId }: { userId: string }) {
  const [, setMyEnrollments] = useState<Enrollment[]>([]);
  const [mySections, setMySections] = useState<(Section | null)[]>([]);
  const [myRegs, setMyRegs] = useState<CompetitionRegistration[]>([]);
  const [, setMyComps] = useState<(Competition | null)[]>([]);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [sectionStats, setSectionStats] = useState<Record<string, { total: number; present: number; percent: number }>>({});
  const [upcomingComps, setUpcomingComps] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [enr, regs, comps] = await Promise.all([
          apiEnrollmentService.getMine().catch(() => enrollmentService.getUserEnrollments(userId)),
          apiCompRegistrationService.getMine().catch(() => compRegistrationService.getUserRegistrations(userId)),
          apiCompetitionService.getAll().catch(() => competitionService.getAll()),
        ]);
        if (!cancelled) {
          const active = enr.filter(e => e.status === 'active');
          setMyEnrollments(active);
          const sections = await Promise.all(active.map(e => apiSectionService.getById(e.sectionId).catch(() => sectionService.getById(e.sectionId))));
          setMySections(sections);
          setMyRegs(regs);
          const competitionData = await Promise.all(regs.map(r => apiCompetitionService.getById(r.competitionId).catch(() => competitionService.getById(r.competitionId))));
          setMyComps(competitionData);
          const validSections = sections.filter((s): s is Section => s !== null);
          if (validSections.length > 0) {
            const stats = await Promise.all(validSections.map(s => apiAttendanceService.getUserStats(userId, s.id).catch(() => attendanceService.getUserStats(userId, s.id))));
            const statsMap: Record<string, { total: number; present: number; percent: number }> = {};
            validSections.forEach((s, i) => { statsMap[s.id] = stats[i]; });
            if (!cancelled) setSectionStats(statsMap);
            const avg = Math.round(stats.reduce((sum, s) => sum + s.percent, 0) / stats.length);
            setAvgAttendance(avg);
          }
          setUpcomingComps(comps.filter(c => c.status === 'upcoming').slice(0, 3));
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="text-center py-20 text-slate-500">
          <div className="text-4xl mb-3">⏳</div>
          <p>Загрузка…</p>
        </div>
      </div>
    );
  }

  const myValidSections = mySections.filter((s): s is Section => s !== null);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Мои секции', value: myValidSections.length, color: 'text-emerald-400', to: '/sections' },
          { label: 'Соревнований', value: myRegs.length, color: 'text-amber-400', to: '/competitions' },
          { label: 'Посещаемость', value: `${avgAttendance}%`, color: avgAttendance >= 75 ? 'text-emerald-400' : avgAttendance >= 50 ? 'text-yellow-400' : 'text-red-400' },
          { label: 'Одобрено заявок', value: myRegs.filter(r => r.status === 'approved').length, color: 'text-blue-400' },
        ].map(item => (
          <div key={item.label} className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 ${item.to ? 'hover:border-slate-600 transition-all' : ''}`}>
            {item.to ? (
              <Link to={item.to} className="block">
                <div className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</div>
                <div className="text-sm text-slate-400">{item.label}</div>
              </Link>
            ) : (
              <>
                <div className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</div>
                <div className="text-sm text-slate-400">{item.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* My sections */}
        <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Мои секции</h2>
            <Link to="/sections" className="text-sm text-emerald-400 hover:text-emerald-300">Все секции →</Link>
          </div>
          {myValidSections.length === 0 ? (
            <div className="py-6 text-center">
              <p className="mb-3 text-sm text-slate-500">Вы не записаны ни на одну секцию</p>
              <Link to="/sections" className="text-sm text-emerald-400 hover:text-emerald-300">Найти секцию →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myValidSections.map(section => {
                const stats = sectionStats[section.id] ?? { total: 0, present: 0, percent: 0 };
                return (
                  <Link key={section.id} to={`/sections/${section.id}`}
                    className="flex items-center justify-between py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white">{section.name}</div>
                      <div className="text-xs text-slate-500">{section.sport}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${stats.total === 0 ? 'text-slate-500' : stats.percent >= 75 ? 'text-emerald-400' : stats.percent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {stats.total > 0 ? `${stats.percent}%` : '—'}
                      </div>
                      <div className="text-xs text-slate-600">посещаемость</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming competitions */}
        <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Предстоящие соревнования</h2>
            <Link to="/competitions" className="text-sm text-amber-400 hover:text-amber-300">Все →</Link>
          </div>
          {upcomingComps.length === 0 ? (
            <p className="py-6 text-sm text-center text-slate-500">Нет предстоящих соревнований</p>
          ) : (
            <div className="space-y-3">
              {upcomingComps.map(comp => {
                const myReg = myRegs.find(r => r.competitionId === comp.id);
                return (
                  <Link key={comp.id} to={`/competitions/${comp.id}`}
                    className="flex items-center gap-3 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm rounded-lg bg-amber-500/10 text-amber-400">⚡</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{comp.name}</div>
                      <div className="text-xs text-slate-500">{new Date(comp.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    {myReg && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${myReg.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {myReg.status === 'approved' ? '✓' : '⏳'}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== COACH DASHBOARD ====================
function CoachDashboard({ userId }: { userId: string }) {
  const [mySections, setMySections] = useState<Section[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [sections, enrs] = await Promise.all([
          apiSectionService.getMine().catch(() => sectionService.getByCoach(userId)),
          apiEnrollmentService.getAll().catch(() => enrollmentService.getAll()),
        ]);
        if (!cancelled) {
          setMySections(sections);
          setEnrollments(enrs);
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const getEnrolledCount = (sectionId: string) =>
    enrollments.filter(e => e.sectionId === sectionId && e.status === 'active').length;

  const activeSections = mySections.filter(s => s.isActive);

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="text-center py-20 text-slate-500">
          <div className="text-4xl mb-3">⏳</div>
          <p>Загрузка…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Мои секции', value: mySections.length, color: 'text-blue-400' },
          { label: 'Активных', value: activeSections.length, color: 'text-emerald-400' },
          { label: 'Участников всего', value: enrollments.filter(e => e.status === 'active').length, color: 'text-purple-400' },
        ].map(item => (
          <div key={item.label} className="p-5 border bg-slate-900 border-slate-800 rounded-2xl">
            <div className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</div>
            <div className="text-sm text-slate-400">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Мои секции</h2>
            <Link to="/coach/sections" className="text-sm text-blue-400 hover:text-blue-300">Управление →</Link>
          </div>
          {mySections.length === 0 ? (
            <div className="py-6 text-center">
              <p className="mb-3 text-sm text-slate-500">У вас нет секций</p>
              <Link to="/coach/sections" className="text-sm text-blue-400">Создать секцию →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {mySections.map(s => {
                const count = getEnrolledCount(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between py-2.5 px-3 bg-slate-800 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-white">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.sport}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${s.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{s.isActive ? '● Акт.' : '○ Неакт.'}</span>
                      <span className="text-sm font-medium text-slate-400">{count}/{s.maxParticipants}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
          <h2 className="mb-4 font-bold text-white">Быстрые действия</h2>
          <div className="space-y-3">
            {[
              { label: '+ Создать секцию', to: '/coach/sections', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20' },
              { label: '✓ Отметить посещаемость', to: '/coach/attendance', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20' },
              { label: '◈ Все секции', to: '/sections', color: 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' },
              { label: '⚡ Соревнования', to: '/competitions', color: 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' },
            ].map(action => (
              <Link key={action.to} to={action.to} className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== JUDGE DASHBOARD ====================
function JudgeDashboard() {
  const [comps, setComps] = useState<Competition[]>([]);
  const [regs, setRegs] = useState<CompetitionRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [c, r] = await Promise.all([
          apiCompetitionService.getAll(),
          apiCompRegistrationService.getAll(),
        ]);
        if (!cancelled) {
          setComps(c.filter(c => c.status === 'ongoing' || c.status === 'upcoming'));
          setRegs(r);
        }
      } catch {
        if (!cancelled) {
          setComps([]);
          setRegs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const getRegisteredCount = (competitionId: string) =>
    regs.filter(r => r.competitionId === competitionId && r.status !== 'rejected' && r.status !== 'withdrawn').length;

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="text-center py-20 text-slate-500">
          <div className="text-4xl mb-3">⏳</div>
          <p>Загрузка…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Актуальные соревнования</h2>
          <Link to="/judge/panel" className="text-sm text-purple-400 hover:text-purple-300">Открыть панель →</Link>
        </div>
        {comps.length === 0 ? (
          <p className="py-6 text-sm text-center text-slate-500">Нет активных соревнований</p>
        ) : (
          <div className="space-y-3">
            {comps.map(c => {
              const count = getRegisteredCount(c.id);
              return (
                <div key={c.id} className="flex items-center gap-4 px-4 py-3 bg-slate-800 rounded-xl">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'ongoing' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.sport} · {count} участников</div>
                  </div>
                  <Link to="/judge/panel" className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors">
                    Судить
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link to="/judge/panel" className="flex items-center justify-center gap-3 py-5 transition-colors border bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 rounded-2xl">
        <span className="text-2xl">⊖</span>
        <span className="font-bold text-purple-400">Открыть судейскую панель</span>
      </Link>
    </div>
  );
}

// ==================== MAIN ====================
export function DashboardPage() {
  const { user, hasRole } = useAuth();
  if (!user) return null;

  // Redirect admin to dedicated dashboard
  if (hasRole('admin')) return <Navigate to="/admin" replace />;

  const greetings: Record<string, string> = {
    coach: 'Кабинет тренера',
    athlete: 'Личный кабинет',
    judge: 'Судейский кабинет',
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">
          Добро пожаловать, {user.firstName}!
        </h1>
        <p className="mt-1 text-slate-400">{greetings[user.role] ?? ''}</p>
      </div>

      {hasRole('athlete') && <AthleteDashboard userId={user.id} />}
      {hasRole('coach') && <CoachDashboard userId={user.id} />}
      {hasRole('judge') && <JudgeDashboard />}
    </MainLayout>
  );
}
