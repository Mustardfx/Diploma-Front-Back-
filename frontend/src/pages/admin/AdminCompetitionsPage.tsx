import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { competitionService } from '../../services/competitionService';
import type { Competition, CompetitionCategory } from '../../types';

const STATUS_OPTIONS: { value: Competition['status']; label: string }[] = [
  { value: 'upcoming', label: 'Предстоит' },
  { value: 'ongoing', label: 'Идёт сейчас' },
  { value: 'completed', label: 'Завершено' },
  { value: 'cancelled', label: 'Отменено' },
];

const STATUS_COLORS: Record<Competition['status'], string> = {
  upcoming:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ongoing:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-slate-600/30 text-slate-400 border-slate-600',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SPORTS_LIST = ['Борьба', 'Бокс', 'Плавание', 'Лёгкая атлетика', 'Футбол', 'Баскетбол', 'Волейбол', 'Дзюдо'];

const EMPTY_FORM = {
  name: '', sport: 'Борьба', description: '', location: '',
  startDate: '', endDate: '', registrationDeadline: '',
  maxParticipants: 32, status: 'upcoming' as Competition['status'],
};

function CompetitionForm({ initial, organizerId, onSave, onCancel }: {
  initial?: Partial<typeof EMPTY_FORM & { categories: CompetitionCategory[] }>;
  organizerId: string;
  onSave: (data: Omit<Competition, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [categories, setCategories] = useState<CompetitionCategory[]>(initial?.categories ?? [{ id: `cat_${Date.now()}`, name: '' }]);

  const set = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm(p => ({ ...p, [field]: val }));
  };

  const addCategory = () => setCategories(p => [...p, { id: `cat_${Date.now()}`, name: '' }]);
  const removeCategory = (id: string) => setCategories(p => p.filter(c => c.id !== id));
  const updateCategory = (id: string, field: keyof CompetitionCategory, val: string | number) =>
    setCategories(p => p.map(c => c.id === id ? { ...c, [field]: val } : c));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validCats = categories.filter(c => c.name.trim());
    onSave({ ...form, organizerId, categories: validCats });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Название *</label>
          <input value={form.name} onChange={set('name')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Открытый чемпионат по..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Вид спорта *</label>
          <select value={form.sport} onChange={set('sport')} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500">
            {SPORTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Статус</label>
          <select value={form.status} onChange={set('status')} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500">
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Дата начала *</label>
          <input type="date" value={form.startDate} onChange={set('startDate')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Дата окончания *</label>
          <input type="date" value={form.endDate} onChange={set('endDate')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Приём заявок до *</label>
          <input type="date" value={form.registrationDeadline} onChange={set('registrationDeadline')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Макс. участников *</label>
          <input type="number" min={2} value={form.maxParticipants} onChange={set('maxParticipants')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Место проведения *</label>
          <input value={form.location} onChange={set('location')} required className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Дворец спорта, пр. Абая 44" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Описание</label>
          <textarea value={form.description} onChange={set('description')} rows={3} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 resize-none" placeholder="Описание соревнования..." />
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-300">Категории</label>
          <button type="button" onClick={addCategory} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">+ Добавить</button>
        </div>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="grid grid-cols-4 gap-2 items-center">
              <input value={cat.name} onChange={e => updateCategory(cat.id, 'name', e.target.value)} placeholder="Название категории *" className="col-span-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500" />
              <input value={cat.weightClass ?? ''} onChange={e => updateCategory(cat.id, 'weightClass', e.target.value)} placeholder="Вес (необяз.)" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500" />
              <button type="button" onClick={() => removeCategory(cat.id)} disabled={categories.length === 1} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs hover:bg-red-500/20 disabled:opacity-30 transition-colors">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors">Отмена</button>
        <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors">Сохранить</button>
      </div>
    </form>
  );
}

export function AdminCompetitionsPage() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (!user) return null;
  const competitions = competitionService.getAll();

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = (data: Omit<Competition, 'id' | 'createdAt'>) => {
    competitionService.create(data);
    setModal(null);
    setTick(n => n + 1);
    notify('Соревнование создано!', 'success');
  };

  const handleEdit = (data: Omit<Competition, 'id' | 'createdAt'>) => {
    if (!editing) return;
    competitionService.update(editing.id, data);
    setModal(null);
    setEditing(null);
    setTick(n => n + 1);
    notify('Соревнование обновлено!', 'success');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить соревнование?')) return;
    competitionService.delete(id);
    setTick(n => n + 1);
    notify('Удалено', 'success');
  };

  return (
    <MainLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Управление соревнованиями</h1>
            <p className="text-slate-400 mt-1">Всего: {competitions.length}</p>
          </div>
          <button onClick={() => { setEditing(null); setModal('create'); }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors">
            + Создать
          </button>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        {competitions.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
            <div className="text-4xl mb-3">⚡</div>
            <p>Соревнований нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {competitions.map(comp => {
              const count = competitionService.getRegisteredCount(comp.id);
              return (
                <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold truncate">{comp.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[comp.status]}`}>
                        {STATUS_OPTIONS.find(s => s.value === comp.status)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{comp.sport}</span>
                      <span>◎ {count}/{comp.maxParticipants} чел.</span>
                      <span>◷ {competitionService.formatDate(comp.startDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/competitions/${comp.id}`} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                      Просмотр
                    </Link>
                    <button onClick={() => { setEditing(comp); setModal('edit'); }}
                      className="px-3 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors">
                      Изменить
                    </button>
                    <button onClick={() => handleDelete(comp.id)}
                      className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors">
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-white font-bold text-lg">
                  {modal === 'create' ? 'Создать соревнование' : 'Редактировать соревнование'}
                </h2>
                <button onClick={() => { setModal(null); setEditing(null); }} className="text-slate-500 hover:text-white text-xl">✕</button>
              </div>
              <div className="p-6">
                <CompetitionForm
                  initial={editing ? {
                    name: editing.name, sport: editing.sport, description: editing.description,
                    location: editing.location, startDate: editing.startDate, endDate: editing.endDate,
                    registrationDeadline: editing.registrationDeadline, maxParticipants: editing.maxParticipants,
                    status: editing.status, categories: editing.categories,
                  } : undefined}
                  organizerId={user.id}
                  onSave={modal === 'create' ? handleCreate : handleEdit}
                  onCancel={() => { setModal(null); setEditing(null); }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
