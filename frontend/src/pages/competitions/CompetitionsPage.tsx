import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { competitionService, compRegistrationService } from '../../services/competitionService';

const SPORTS = ['Все', 'Борьба', 'Бокс', 'Плавание', 'Лёгкая атлетика'];

const STATUS_CONFIG = {
  upcoming:  { label: 'Предстоит',   color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ongoing:   { label: 'Идёт сейчас', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  completed: { label: 'Завершено',   color: 'bg-slate-600/30 text-slate-400 border-slate-600' },
  cancelled: { label: 'Отменено',    color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export function CompetitionsPage() {
  const { user, hasRole } = useAuth();
  const [sport, setSport] = useState('Все');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [tick, setTick] = useState(0);

  const competitions = useMemo(() => competitionService.getAll(), [tick]);
  const canManage = hasRole('coach', 'admin');

  const filtered = useMemo(() => competitions.filter(c => {
    if (sport !== 'Все' && c.sport !== sport) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [competitions, sport, statusFilter, search]);

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleWithdraw = (competitionId: string) => {
    if (!user) return;
    try {
      compRegistrationService.withdraw(user.id, competitionId);
      setTick(n => n + 1);
      notify('Регистрация отменена', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Соревнования</h1>
            <p className="text-slate-400 mt-1">Найдено: {filtered.length}</p>
          </div>
          {canManage && (
            <Link to="/admin/competitions" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors">
              + Управление
            </Link>
          )}
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="flex-1 min-w-48 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {SPORTS.map(s => (
              <button key={s} onClick={() => setSport(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sport === s ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 text-sm">
            <option value="all">Все статусы</option>
            <option value="upcoming">Предстоит</option>
            <option value="ongoing">Идёт сейчас</option>
            <option value="completed">Завершено</option>
          </select>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">⚡</div>
            <p>Соревнования не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(comp => {
              const cfg = STATUS_CONFIG[comp.status];
              const count = competitionService.getRegisteredCount(comp.id);
              const myReg = user ? compRegistrationService.isRegistered(user.id, comp.id) : null;
              const deadlinePassed = competitionService.isDeadlinePassed(comp);

              return (
                <div key={comp.id} className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-5 flex flex-col gap-4 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{comp.sport}</span>
                        {myReg && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            myReg.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            myReg.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-slate-700 text-slate-400'
                          }`}>
                            {myReg.status === 'approved' ? '✓ Одобрено' : myReg.status === 'pending' ? '⏳ На рассмотрении' : 'Отклонено'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-lg leading-tight">{comp.name}</h3>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{comp.description}</p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-600">◷</span>
                      <span>{competitionService.formatDate(comp.startDate)}{comp.startDate !== comp.endDate ? ` – ${competitionService.formatDate(comp.endDate)}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-600">◎</span>
                      <span className="truncate">{count} / {comp.maxParticipants} уч.</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 col-span-2">
                      <span className="text-slate-600">⌖</span>
                      <span className="truncate">{comp.location}</span>
                    </div>
                    {comp.status === 'upcoming' && (
                      <div className="flex items-center gap-2 col-span-2">
                        <span className="text-slate-600 text-sm">⏱</span>
                        <span className={`text-sm ${deadlinePassed ? 'text-red-400' : 'text-slate-400'}`}>
                          Регистрация до: {competitionService.formatDate(comp.registrationDeadline)}
                          {deadlinePassed && ' (истёк)'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Capacity bar */}
                  <div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((count / comp.maxParticipants) * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/competitions/${comp.id}`} className="flex-1 py-2 text-center text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors">
                      Подробнее
                    </Link>
                    {!canManage && (
                      myReg ? (
                        myReg.status !== 'withdrawn' && comp.status === 'upcoming' && !deadlinePassed ? (
                          <button onClick={() => handleWithdraw(comp.id)} className="flex-1 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors">
                            Отменить
                          </button>
                        ) : null
                      ) : (
                        comp.status === 'upcoming' && !deadlinePassed && count < comp.maxParticipants ? (
                          <Link to={`/competitions/${comp.id}`} className="flex-1 py-2 text-center text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl transition-colors">
                            Зарегистрироваться
                          </Link>
                        ) : null
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
