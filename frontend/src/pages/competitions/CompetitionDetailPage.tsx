import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { apiUserService } from '../../services/apiUserService';
import { apiCompetitionService, apiCompRegistrationService, apiCompResultService } from '../../services/apiCompetitionService';
import type { AuthUser, Competition, CompetitionRegistration, CompetitionResult } from '../../types';

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

const STATUS_CONFIG = {
  upcoming:  { label: 'Предстоит',   color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  ongoing:   { label: 'Идёт сейчас', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  completed: { label: 'Завершено',   color: 'text-slate-400',   bg: 'bg-slate-700/30 border-slate-600' },
  cancelled: { label: 'Отменено',    color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
};

const REG_STATUS = {
  pending:   { label: 'На рассмотрении', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  approved:  { label: 'Одобрено',        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  rejected:  { label: 'Отклонено',       color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  withdrawn: { label: 'Отменено',        color: 'text-slate-400 bg-slate-700/30 border-slate-600' },
};

export function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [allRegs, setAllRegs] = useState<CompetitionRegistration[]>([]);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!id) { setCompetition(null); setLoading(false); return; }
    const compId = id;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [comp, regs, res, allUsers] = await Promise.all([
          apiCompetitionService.getById(compId),
          apiCompRegistrationService.getByCompetition(compId),
          apiCompResultService.getByCompetition(compId),
          apiUserService.getAll().catch(() => [] as AuthUser[]),
        ]);
        if (!cancelled) {
          setCompetition(comp);
          setAllRegs(regs);
          setResults(res);
          setUsers(allUsers);
        }
      } catch {
        if (!cancelled) setCompetition(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, tick]);

  if (!competition && !loading) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">⚡</div>
          <p>Соревнование не найдено</p>
          <Link to="/competitions" className="mt-4 inline-block text-emerald-400 hover:text-emerald-300">← Назад</Link>
        </div>
      </MainLayout>
    );
  }

  if (!competition && loading) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-slate-500">
          <div className="text-4xl mb-3">⏳</div>
          <p>Загрузка…</p>
        </div>
      </MainLayout>
    );
  }

  if (!competition) return null;

  const count = allRegs.filter(r => r.status !== 'rejected' && r.status !== 'withdrawn').length;
  const deadlinePassed = new Date(competition.registrationDeadline) < new Date();
  const myReg = user ? allRegs.find(r => r.userId === user.id && r.status !== 'withdrawn') ?? null : null;
  const canManage = hasRole('admin', 'coach');
  const isJudge = hasRole('judge');

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegister = async () => {
    if (!user || !selectedCategory) { notify('Выберите категорию', 'error'); return; }
    try {
      await apiCompRegistrationService.register(competition.id, selectedCategory);
      setSelectedCategory('');
      setTick(n => n + 1);
      notify('Заявка подана! Ожидайте подтверждения.', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  const handleWithdraw = async () => {
    if (!myReg) return;
    try {
      await apiCompRegistrationService.withdraw(myReg.id);
      setTick(n => n + 1);
      notify('Регистрация отменена', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  const handleSetStatus = async (regId: string, status: CompetitionRegistration['status']) => {
    try {
      await apiCompRegistrationService.updateStatus(regId, status);
      setTick(n => n + 1);
      notify(status === 'approved' ? 'Заявка одобрена' : 'Заявка отклонена', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  const canRegister = !myReg && competition.status === 'upcoming' && !deadlinePassed && count < competition.maxParticipants;

  return (
    <MainLayout>
      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/competitions" className="hover:text-white transition-colors">Соревнования</Link>
          <span>/</span>
          <span className="text-slate-300 truncate">{competition.name}</span>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_CONFIG[competition.status].bg} ${STATUS_CONFIG[competition.status].color}`}>{STATUS_CONFIG[competition.status].label}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">{competition.sport}</span>
                  </div>
                  <h1 className="text-2xl font-black text-white leading-tight">{competition.name}</h1>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">{competition.description}</p>
            </div>

            {/* Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Информация</h2>
              <div className="space-y-3">
                {[
                  { icon: '◷', label: 'Дата проведения', value: `${formatDate(competition.startDate)}${competition.startDate !== competition.endDate ? ` — ${formatDate(competition.endDate)}` : ''}` },
                  { icon: '⌖', label: 'Место проведения', value: competition.location },
                  { icon: '⏱', label: 'Приём заявок до', value: formatDate(competition.registrationDeadline) },
                  { icon: '◎', label: 'Участников', value: `${count} / ${competition.maxParticipants}` },
                ].map(item => (
                  <div key={item.label} className="flex gap-4 py-2.5 border-b border-slate-800 last:border-0">
                    <span className="text-slate-500 w-5 text-center flex-shrink-0">{item.icon}</span>
                    <span className="text-slate-400 w-36 flex-shrink-0 text-sm">{item.label}</span>
                    <span className="text-white text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Категории</h2>
              <div className="space-y-2">
                {competition.categories.map(cat => {
                  const catCount = allRegs.filter(r => r.categoryId === cat.id && r.status !== 'withdrawn').length;
                  return (
                    <div key={cat.id} className="flex items-center justify-between py-2.5 px-4 bg-slate-800 rounded-xl">
                      <div>
                        <div className="text-white text-sm font-medium">{cat.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {[cat.ageMin && `от ${cat.ageMin} лет`, cat.ageMax && `до ${cat.ageMax} лет`, cat.weightClass].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm">{catCount} чел.</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results (completed) */}
            {competition.status === 'completed' && results.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-bold mb-4">Результаты</h2>
                <div className="space-y-2">
                  {results
                    .sort((a, b) => (a.place ?? 99) - (b.place ?? 99))
                    .map(result => {
                      const u = users.find(u => u.id === result.userId);
                      const cat = competition.categories.find(c => c.id === result.categoryId);
                      return (
                        <div key={result.id} className="flex items-center gap-4 py-2.5 px-4 bg-slate-800 rounded-xl">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            result.place === 1 ? 'bg-yellow-500 text-slate-950' :
                            result.place === 2 ? 'bg-slate-400 text-slate-950' :
                            result.place === 3 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {result.place ?? '—'}
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{u ? `${u.lastName} ${u.firstName}` : '—'}</div>
                            <div className="text-slate-500 text-xs">{cat?.name}</div>
                          </div>
                          {result.score !== undefined && (
                            <div className="text-amber-400 font-bold text-sm">{result.score} очков</div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Participants list (for organizer/admin) */}
            {(canManage || isJudge) && allRegs.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-bold mb-4">Заявки ({allRegs.length})</h2>
                <div className="space-y-2">
                  {allRegs.map(reg => {
                    const u = users.find(u => u.id === reg.userId);
                    const cat = competition.categories.find(c => c.id === reg.categoryId);
                    const regCfg = REG_STATUS[reg.status];
                    return (
                      <div key={reg.id} className="flex items-center gap-3 py-2.5 px-4 bg-slate-800 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                          {u?.firstName[0]}{u?.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">{u ? `${u.lastName} ${u.firstName}` : '—'}</div>
                          <div className="text-slate-500 text-xs">{cat?.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${regCfg.color}`}>{regCfg.label}</span>
                          {canManage && reg.status === 'pending' && (
                            <>
                              <button onClick={() => handleSetStatus(reg.id, 'approved')}
                                className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">
                                ✓
                              </button>
                              <button onClick={() => handleSetStatus(reg.id, 'rejected')}
                                className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* My registration status */}
            {myReg && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">Моя заявка</h3>
                <div className={`text-sm px-3 py-1.5 rounded-lg border mb-3 ${REG_STATUS[myReg.status].color}`}>
                  {REG_STATUS[myReg.status].label}
                </div>
                <div className="text-slate-400 text-xs mb-3">
                  Категория: {competition.categories.find(c => c.id === myReg.categoryId)?.name}
                </div>
                {myReg.status !== 'withdrawn' && competition.status === 'upcoming' && !deadlinePassed && (
                  <button onClick={handleWithdraw} className="w-full py-2.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors">
                    Отозвать заявку
                  </button>
                )}
              </div>
            )}

            {/* Registration form */}
            {canRegister && !canManage && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">Регистрация</h3>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-400 mb-2">Выберите категорию</label>
                  <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500">
                    <option value="">— Категория —</option>
                    {competition.categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleRegister} disabled={!selectedCategory}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-colors text-sm">
                  Подать заявку
                </button>
                <p className="text-slate-500 text-xs mt-2 text-center">Заявка требует подтверждения организатора</p>
              </div>
            )}

            {/* Capacity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">Места</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Зарегистрировано</span>
                <span className="text-white font-bold">{count} / {competition.maxParticipants}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((count / competition.maxParticipants) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Deadline */}
            {competition.status === 'upcoming' && (
              <div className={`rounded-2xl p-5 border ${deadlinePassed ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900 border-slate-800'}`}>
                <h3 className="text-white font-bold mb-1 text-sm">Регистрация до</h3>
                <p className={`font-bold ${deadlinePassed ? 'text-red-400' : 'text-amber-400'}`}>
                  {formatDate(competition.registrationDeadline)}
                </p>
                {deadlinePassed && <p className="text-red-400 text-xs mt-1">Приём заявок завершён</p>}
              </div>
            )}

            {/* Judge link */}
            {(isJudge || canManage) && competition.status !== 'cancelled' && (
              <Link to="/judge/panel" className="block w-full py-3 text-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-2xl transition-colors text-sm font-medium">
                Судейская панель
              </Link>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
