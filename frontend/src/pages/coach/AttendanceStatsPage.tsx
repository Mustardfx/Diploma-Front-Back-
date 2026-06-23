import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { apiSectionService, apiAttendanceService } from '../../services/apiSectionService';
import type { Section, AttendanceOverview } from '../../types';

const PRESETS = [
  { months: 1, label: 'Месяц' },
  { months: 3, label: '3 месяца' },
  { months: 6, label: 'Полгода' },
  { months: 12, label: 'Год' },
];

const computeRange = (months: number) => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
};

const monthLabel = (m: string) => {
  const [y, mo] = m.split('-');
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('ru-RU', { month: 'short' });
};

const pctColor = (p: number, total: number) =>
  total === 0 ? 'text-slate-500' : p >= 75 ? 'text-emerald-400' : p >= 50 ? 'text-yellow-400' : 'text-red-400';

const barColor = (p: number) =>
  p >= 75 ? 'bg-emerald-500' : p >= 50 ? 'bg-yellow-500' : 'bg-red-500';

const today = () => new Date().toISOString().slice(0, 10);

export function AttendanceStatsPage() {
  const { user } = useAuth();
  const [from, setFrom] = useState(() => computeRange(3).from);
  const [to, setTo] = useState(today);
  const [activePreset, setActivePreset] = useState<number | null>(3);
  const [sectionId, setSectionId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [data, setData] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const invalidRange = !!from && !!to && from > to;

  const applyPreset = (m: number) => {
    const r = computeRange(m);
    setFrom(r.from);
    setTo(r.to);
    setActivePreset(m);
  };

  // Список секций для фильтра: админ — все, тренер — свои
  useEffect(() => {
    const loader = isAdmin ? apiSectionService.getAll() : apiSectionService.getMine();
    loader.then(setSections).catch(() => setSections([]));
  }, [isAdmin]);

  useEffect(() => {
    if (!from || !to || from > to) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError('');
    apiAttendanceService
      .getOverview({ from, to, sectionId: sectionId || undefined })
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [from, to, sectionId]);

  if (!user) return null;

  const maxPercent = Math.max(100, ...(data?.byMonth.map(m => m.percent) ?? [0]));

  return (
    <MainLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Статистика посещаемости</h1>
          <p className="mt-1 text-slate-400">
            {isAdmin ? 'По всем секциям портала' : 'По вашим секциям'} · за выбранный период
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Быстрые пресеты */}
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map(p => (
                <button key={p.months} onClick={() => applyPreset(p.months)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activePreset === p.months ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            {/* Фильтр по секции */}
            <select value={sectionId} onChange={e => setSectionId(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 text-sm">
              <option value="">Все секции</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Произвольный диапазон дат */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-400">Период:</span>
            <input type="date" value={from} max={to || today()}
              onChange={e => { setFrom(e.target.value); setActivePreset(null); }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500" />
            <span className="text-slate-500">—</span>
            <input type="date" value={to} min={from} max={today()}
              onChange={e => { setTo(e.target.value); setActivePreset(null); }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500" />
            {invalidRange && <span className="text-red-400 text-xs ml-1">Дата начала позже даты конца</span>}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm border bg-red-500/10 border-red-500/30 text-red-400">{error}</div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="text-4xl mb-3">⏳</div>
            <p>Загрузка статистики…</p>
          </div>
        ) : !data || data.total === 0 ? (
          <div className="py-20 text-center border bg-slate-900 border-slate-800 rounded-2xl text-slate-500">
            <div className="text-4xl mb-3">📊</div>
            <p>За этот период нет отметок посещаемости</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                <div className={`text-4xl font-black mb-1 ${pctColor(data.percent, data.total)}`}>{data.percent}%</div>
                <div className="text-sm text-slate-400">Средняя посещаемость</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                <div className="text-4xl font-black mb-1 text-white">{data.total}</div>
                <div className="text-sm text-slate-400">Всего отметок</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                <div className="text-4xl font-black mb-1 text-emerald-400">{data.present}</div>
                <div className="text-sm text-slate-400">Присутствий</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                <div className="text-4xl font-black mb-1 text-red-400">{data.absent}</div>
                <div className="text-sm text-slate-400">Пропусков</div>
              </div>
            </div>

            {/* Monthly bar chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="font-bold text-white mb-6">Посещаемость по месяцам</h2>
              <div className="flex items-end justify-between gap-2 h-52">
                {data.byMonth.map(m => (
                  <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full gap-2 min-w-0">
                    <span className={`text-xs font-bold ${pctColor(m.percent, m.total)}`}>{m.percent}%</span>
                    <div className="w-full flex items-end justify-center h-full">
                      <div
                        className={`w-full max-w-[2.5rem] rounded-t-lg ${barColor(m.percent)} transition-all`}
                        style={{ height: `${(m.percent / maxPercent) * 100}%`, minHeight: m.total > 0 ? '4px' : '0' }}
                        title={`${m.present}/${m.total} присутствий`}
                      />
                    </div>
                    <span className="text-xs text-slate-500 capitalize truncate w-full text-center">{monthLabel(m.month)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
