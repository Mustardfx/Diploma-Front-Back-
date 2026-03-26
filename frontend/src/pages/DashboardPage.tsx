import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { sectionService, enrollmentService, attendanceService } from '../services/sectionService';
import { competitionService, compRegistrationService } from '../services/competitionService';
import { authService } from '../services/authService';

// ==================== ATHLETE DASHBOARD ====================
function AthleteDashboard({ userId }: { userId: string }) {
  const data = useMemo(() => {
    const myEnrollments = enrollmentService.getUserEnrollments(userId).filter(e => e.status === 'active');
    const mySections = myEnrollments.map(e => sectionService.getById(e.sectionId)).filter(Boolean);
    const myRegs = compRegistrationService.getUserRegistrations(userId).filter(r => r.status !== 'withdrawn');
    const myComps = myRegs.map(r => ({ reg: r, comp: competitionService.getById(r.competitionId) })).filter(x => x.comp);
    const avgAttendance = mySections.length > 0
      ? Math.round(mySections.reduce((sum, s) => sum + attendanceService.getUserStats(userId, s!.id).percent, 0) / mySections.length)
      : 0;
    const upcomingComps = competitionService.getAll().filter(c => c.status === 'upcoming').slice(0, 3);
    return { myEnrollments, mySections, myRegs, myComps, avgAttendance, upcomingComps };
  }, [userId]);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Мои секции', value: data.mySections.length, color: 'text-emerald-400', to: '/sections' },
          { label: 'Соревнований', value: data.myRegs.length, color: 'text-amber-400', to: '/competitions' },
          { label: 'Посещаемость', value: `${data.avgAttendance}%`, color: data.avgAttendance >= 75 ? 'text-emerald-400' : data.avgAttendance >= 50 ? 'text-yellow-400' : 'text-red-400' },
          { label: 'Одобрено заявок', value: data.myRegs.filter(r => r.status === 'approved').length, color: 'text-blue-400' },
        ].map(item => (
          <div key={item.label} className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 ${item.to ? 'hover:border-slate-600 transition-all' : ''}`}>
            {item.to ? (
              <Link to={item.to} className="block">
                <div className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</div>
                <div className="text-slate-400 text-sm">{item.label}</div>
              </Link>
            ) : (
              <>
                <div className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</div>
                <div className="text-slate-400 text-sm">{item.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My sections */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Мои секции</h2>
            <Link to="/sections" className="text-emerald-400 text-sm hover:text-emerald-300">Все секции →</Link>
          </div>
          {data.mySections.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm mb-3">Вы не записаны ни на одну секцию</p>
              <Link to="/sections" className="text-emerald-400 text-sm hover:text-emerald-300">Найти секцию →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.mySections.map(section => {
                if (!section) return null;
                const stats = attendanceService.getUserStats(userId, section.id);
                return (
                  <Link key={section.id} to={`/sections/${section.id}`}
                    className="flex items-center justify-between py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                    <div>
                      <div className="text-white text-sm font-medium">{section.name}</div>
                      <div className="text-slate-500 text-xs">{section.sport}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${stats.total === 0 ? 'text-slate-500' : stats.percent >= 75 ? 'text-emerald-400' : stats.percent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {stats.total > 0 ? `${stats.percent}%` : '—'}
                      </div>
                      <div className="text-slate-600 text-xs">посещаемость</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming competitions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Предстоящие соревнования</h2>
            <Link to="/competitions" className="text-amber-400 text-sm hover:text-amber-300">Все →</Link>
          </div>
          {data.upcomingComps.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Нет предстоящих соревнований</p>
          ) : (
            <div className="space-y-3">
              {data.upcomingComps.map(comp => {
                const myReg = compRegistrationService.isRegistered(userId, comp.id);
                return (
                  <Link key={comp.id} to={`/competitions/${comp.id}`}
                    className="flex items-center gap-3 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0 text-sm">⚡</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{comp.name}</div>
                      <div className="text-slate-500 text-xs">{new Date(comp.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
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
  const data = useMemo(() => {
    const mySections = sectionService.getByCoach(userId);
    const totalParticipants = mySections.reduce((sum, s) => sum + sectionService.getEnrolledCount(s.id), 0);
    const activeSections = mySections.filter(s => s.isActive);
    return { mySections, totalParticipants, activeSections };
  }, [userId]);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Мои секции', value: data.mySections.length, color: 'text-blue-400' },
          { label: 'Активных', value: data.activeSections.length, color: 'text-emerald-400' },
          { label: 'Участников всего', value: data.totalParticipants, color: 'text-purple-400' },
        ].map(item => (
          <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</div>
            <div className="text-slate-400 text-sm">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Мои секции</h2>
            <Link to="/coach/sections" className="text-blue-400 text-sm hover:text-blue-300">Управление →</Link>
          </div>
          {data.mySections.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm mb-3">У вас нет секций</p>
              <Link to="/coach/sections" className="text-blue-400 text-sm">Создать секцию →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.mySections.map(s => {
                const count = sectionService.getEnrolledCount(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between py-2.5 px-3 bg-slate-800 rounded-xl">
                    <div>
                      <div className="text-white text-sm font-medium">{s.name}</div>
                      <div className="text-slate-500 text-xs">{s.sport}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${s.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{s.isActive ? '● Акт.' : '○ Неакт.'}</span>
                      <span className="text-slate-400 text-sm font-medium">{count}/{s.maxParticipants}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Быстрые действия</h2>
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
  const comps = useMemo(() => competitionService.getAll().filter(c => c.status === 'ongoing' || c.status === 'upcoming'), []);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Актуальные соревнования</h2>
          <Link to="/judge/panel" className="text-purple-400 text-sm hover:text-purple-300">Открыть панель →</Link>
        </div>
        {comps.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">Нет активных соревнований</p>
        ) : (
          <div className="space-y-3">
            {comps.map(c => {
              const count = competitionService.getRegisteredCount(c.id);
              return (
                <div key={c.id} className="flex items-center gap-4 py-3 px-4 bg-slate-800 rounded-xl">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'ongoing' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{c.name}</div>
                    <div className="text-slate-500 text-xs">{c.sport} · {count} участников</div>
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

      <Link to="/judge/panel" className="flex items-center justify-center gap-3 py-5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-2xl transition-colors">
        <span className="text-2xl">⊖</span>
        <span className="text-purple-400 font-bold">Открыть судейскую панель</span>
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
        <p className="text-slate-400 mt-1">{greetings[user.role] ?? ''}</p>
      </div>

      {hasRole('athlete') && <AthleteDashboard userId={user.id} />}
      {hasRole('coach') && <CoachDashboard userId={user.id} />}
      {hasRole('judge') && <JudgeDashboard />}
    </MainLayout>
  );
}
