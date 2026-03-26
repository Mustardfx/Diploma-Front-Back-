import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { sectionService, enrollmentService } from '../../services/sectionService';
import { authService } from '../../services/authService';
import type { Section } from '../../types';

const SPORTS = ['Все', 'Борьба', 'Бокс', 'Плавание', 'Лёгкая атлетика'];
const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const SPORT_COLORS: Record<string, string> = {
  'Борьба': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Бокс': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Плавание': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Лёгкая атлетика': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

function SectionCard({ section, enrolled, onEnroll, onCancel, canManage }: {
  section: Section;
  enrolled: boolean;
  onEnroll: (id: string) => void;
  onCancel: (id: string) => void;
  canManage: boolean;
}) {
  const count = sectionService.getEnrolledCount(section.id);
  const full = count >= section.maxParticipants;
  const coach = authService.getUserById(section.coachId);
  const sportColor = SPORT_COLORS[section.sport] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <div className={`bg-slate-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:border-slate-600 ${!section.isActive ? 'opacity-60' : 'border-slate-800'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${sportColor}`}>{section.sport}</span>
            {!section.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Неактивна</span>}
            {enrolled && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ Записан</span>}
          </div>
          <h3 className="text-white font-bold text-lg leading-tight">{section.name}</h3>
        </div>
        {section.price && (
          <div className="text-emerald-400 font-bold text-sm whitespace-nowrap">{section.price.toLocaleString()} ₸/мес</div>
        )}
      </div>

      <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{section.description}</p>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-600 w-4 text-center">◎</span>
          <span>{coach ? `${coach.lastName} ${coach.firstName[0]}.` : '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-600 w-4 text-center">⌖</span>
          <span className="truncate">{section.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-600 w-4 text-center">◷</span>
          <span>{section.schedule.map(s => `${DAY_NAMES[s.dayOfWeek]} ${s.timeStart}`).join(', ')}</span>
        </div>
        {(section.ageMin || section.ageMax) && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-slate-600 w-4 text-center">◌</span>
            <span>Возраст: {section.ageMin ?? 0}–{section.ageMax ?? '∞'} лет</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Участников</span>
          <span className={full ? 'text-red-400' : 'text-slate-300'}>{count} / {section.maxParticipants}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${full ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min((count / section.maxParticipants) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-auto pt-1">
        <Link to={`/sections/${section.id}`} className="flex-1 py-2 text-center text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors">
          Подробнее
        </Link>
        {!canManage && section.isActive && (
          enrolled ? (
            <button onClick={() => onCancel(section.id)} className="flex-1 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors">
              Отменить
            </button>
          ) : (
            <button onClick={() => onEnroll(section.id)} disabled={full} className="flex-1 py-2 text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl transition-colors">
              {full ? 'Мест нет' : 'Записаться'}
            </button>
          )
        )}
        {canManage && (
          <Link to="/coach/sections" className="flex-1 py-2 text-center text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-colors">
            Управлять
          </Link>
        )}
      </div>
    </div>
  );
}

export function SectionsPage() {
  const { user, hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('Все');
  const [onlyActive, setOnlyActive] = useState(true);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [tick, setTick] = useState(0);

  const sections = useMemo(() => sectionService.getAll(), [tick]);
  const canManage = hasRole('coach', 'admin');

  const filtered = useMemo(() => sections.filter(s => {
    if (onlyActive && !s.isActive) return false;
    if (sport !== 'Все' && s.sport !== sport) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [sections, sport, search, onlyActive]);

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEnroll = (sectionId: string) => {
    if (!user) return;
    try {
      enrollmentService.enroll(user.id, sectionId);
      setTick(n => n + 1);
      notify('Вы успешно записаны на секцию!', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  const handleCancel = (sectionId: string) => {
    if (!user) return;
    try {
      enrollmentService.cancel(user.id, sectionId);
      setTick(n => n + 1);
      notify('Запись отменена', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Секции</h1>
            <p className="text-slate-400 mt-1">Найдено: {filtered.length}</p>
          </div>
          {canManage && (
            <Link to="/coach/sections" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors text-sm">
              + Управление
            </Link>
          )}
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="flex-1 min-w-48 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {SPORTS.map(s => (
              <button key={s} onClick={() => setSport(s)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sport === s ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setOnlyActive(p => !p)} className={`px-4 py-2.5 rounded-xl text-sm transition-colors border ${onlyActive ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
            Только активные
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">◈</div>
            <p>Секции не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(section => (
              <SectionCard
                key={section.id}
                section={section}
                enrolled={user ? enrollmentService.isEnrolled(user.id, section.id) : false}
                onEnroll={handleEnroll}
                onCancel={handleCancel}
                canManage={canManage}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
