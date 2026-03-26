import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { sectionService, enrollmentService } from '../../services/sectionService';
import { authService } from '../../services/authService';

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function AdminSectionsPage() {
  const [search, setSearch] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);
  const [tick, setTick] = useState(0);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const sections = useMemo(() => sectionService.getAll(), [tick]);

  const filtered = useMemo(() => sections.filter(s => {
    if (onlyActive && !s.isActive) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.sport.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [sections, search, onlyActive]);

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggle = (id: string, current: boolean) => {
    sectionService.update(id, { isActive: !current });
    setTick(n => n + 1);
    notify(`Секция ${!current ? 'активирована' : 'деактивирована'}`, 'success');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить секцию?')) return;
    sectionService.delete(id);
    setTick(n => n + 1);
    notify('Секция удалена', 'success');
  };

  const totalEnrolled = sections.reduce((sum, s) => sum + sectionService.getEnrolledCount(s.id), 0);

  return (
    <MainLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Управление секциями</h1>
            <p className="text-slate-400 mt-1">Всего: {sections.length} · Записей: {totalEnrolled}</p>
          </div>
          <Link to="/coach/sections" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-sm transition-colors">
            + Создать секцию
          </Link>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Всего секций', value: sections.length, color: 'text-white' },
            { label: 'Активных', value: sections.filter(s => s.isActive).length, color: 'text-emerald-400' },
            { label: 'Всего участников', value: totalEnrolled, color: 'text-blue-400' },
          ].map(item => (
            <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</div>
              <div className="text-slate-500 text-sm">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию или виду спорта..."
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm" />
          <button onClick={() => setOnlyActive(p => !p)}
            className={`px-4 py-2.5 rounded-xl text-sm border transition-colors ${onlyActive ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}>
            Только активные
          </button>
        </div>

        {/* Sections table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <div className="col-span-3">Секция</div>
            <div className="col-span-2">Тренер</div>
            <div className="col-span-2">Расписание</div>
            <div className="col-span-2">Участники</div>
            <div className="col-span-1">Статус</div>
            <div className="col-span-2 text-right">Действия</div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Секции не найдены</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.map(section => {
                const coach = authService.getUserById(section.coachId);
                const enrolled = sectionService.getEnrolledCount(section.id);
                const pct = Math.round((enrolled / section.maxParticipants) * 100);

                return (
                  <div key={section.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-800/30 transition-colors">
                    <div className="col-span-3">
                      <div className="text-white font-medium text-sm">{section.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{section.sport}</div>
                    </div>
                    <div className="col-span-2 text-slate-400 text-sm">
                      {coach ? `${coach.lastName} ${coach.firstName[0]}.` : '—'}
                    </div>
                    <div className="col-span-2 text-slate-400 text-xs">
                      {section.schedule.map(s => DAY_NAMES[s.dayOfWeek]).join(', ')}
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{enrolled}/{section.maxParticipants}</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${section.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {section.isActive ? 'Акт.' : 'Неакт.'}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-1.5">
                      <Link to={`/sections/${section.id}`} className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                        ↗
                      </Link>
                      <button onClick={() => handleToggle(section.id, section.isActive)}
                        className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${section.isActive ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}>
                        {section.isActive ? '⏸' : '▶'}
                      </button>
                      <button onClick={() => handleDelete(section.id)}
                        className="px-2.5 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
