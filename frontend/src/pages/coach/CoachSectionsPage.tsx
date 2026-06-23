import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { apiSectionService } from '../../services/apiSectionService';
import type { Section, ScheduleItem } from '../../types';

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const SPORTS_LIST = ['Борьба', 'Бокс', 'Плавание', 'Лёгкая атлетика', 'Футбол', 'Баскетбол', 'Волейбол', 'Дзюдо', 'Самбо', 'Карате'];

const EMPTY_FORM = {
  name: '',
  sport: 'Борьба',
  description: '',
  location: '',
  maxParticipants: 20,
  price: 0,
  ageMin: 0,
  ageMax: 0,
  isActive: true,
  schedule: [] as ScheduleItem[],
};

type SectionFormData = typeof EMPTY_FORM;

function SectionForm({ initial, saving, onSave, onCancel }: {
  initial?: Partial<SectionFormData>;
  saving: boolean;
  onSave: (data: SectionFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });

  const set = (field: keyof SectionFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked :
      (e.target.type === 'number' ? Number(e.target.value) : e.target.value);
    setForm(p => ({ ...p, [field]: val }));
  };

  const toggleDay = (day: number) => {
    setForm(p => {
      const exists = p.schedule.find(s => s.dayOfWeek === day);
      if (exists) return { ...p, schedule: p.schedule.filter(s => s.dayOfWeek !== day) };
      return { ...p, schedule: [...p.schedule, { dayOfWeek: day, timeStart: '09:00', timeEnd: '11:00' }].sort((a, b) => a.dayOfWeek - b.dayOfWeek) };
    });
  };

  const updateTime = (day: number, field: 'timeStart' | 'timeEnd', val: string) => {
    setForm(p => ({ ...p, schedule: p.schedule.map(s => s.dayOfWeek === day ? { ...s, [field]: val } : s) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Название *</label>
          <input value={form.name} onChange={set('name')} required className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm" placeholder="Вольная борьба" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Вид спорта *</label>
          <select value={form.sport} onChange={set('sport')} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm">
            {SPORTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Макс. участников *</label>
          <input type="number" min={1} max={100} value={form.maxParticipants} onChange={set('maxParticipants')} required className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Адрес / место занятий *</label>
          <input value={form.location} onChange={set('location')} required className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm" placeholder="Спортзал №1, ул. Абая 12" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Описание</label>
          <textarea value={form.description} onChange={set('description')} rows={3} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm resize-none" placeholder="Краткое описание секции..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Цена (₸/мес)</label>
          <input type="number" min={0} value={form.price} onChange={set('price')} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Возраст от</label>
            <input type="number" min={0} value={form.ageMin} onChange={set('ageMin')} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Возраст до</label>
            <input type="number" min={0} value={form.ageMax} onChange={set('ageMax')} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm" />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Расписание</label>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {DAY_NAMES.map((d, i) => (
            <button key={i} type="button" onClick={() => toggleDay(i)}
              className={`py-2 text-xs rounded-lg font-medium transition-colors ${form.schedule.find(s => s.dayOfWeek === i) ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >{d}</button>
          ))}
        </div>
        {form.schedule.length > 0 && (
          <div className="space-y-2">
            {form.schedule.map(s => (
              <div key={s.dayOfWeek} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-2.5">
                <span className="text-slate-300 text-sm w-6">{DAY_NAMES[s.dayOfWeek]}</span>
                <input type="time" value={s.timeStart} onChange={e => updateTime(s.dayOfWeek, 'timeStart', e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm" />
                <span className="text-slate-500 text-sm">—</span>
                <input type="time" value={s.timeEnd} onChange={e => updateTime(s.dayOfWeek, 'timeEnd', e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-emerald-500" />
        <label htmlFor="isActive" className="text-slate-300 text-sm">Секция активна (открыта для записи)</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm">Отмена</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-colors text-sm">{saving ? 'Сохранение…' : 'Сохранить'}</button>
      </div>
    </form>
  );
}

export function CoachSectionsPage() {
  const { user } = useAuth();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Section | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Админ управляет всеми секциями, тренер — только своими.
      setSections(await (user?.role === 'admin' ? apiSectionService.getAll() : apiSectionService.getMine()));
    } catch (e) {
      setNotification({ msg: (e as Error).message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { void load(); }, [load]);

  if (!user) return null;

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (data: SectionFormData) => {
    setSaving(true);
    try {
      await apiSectionService.create(data);
      setModal(null);
      await load();
      notify('Секция создана!', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (data: SectionFormData) => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiSectionService.update(editing.id, data);
      setModal(null);
      setEditing(null);
      await load();
      notify('Секция обновлена!', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить секцию? Это действие нельзя отменить.')) return;
    try {
      await apiSectionService.delete(id);
      await load();
      notify('Секция удалена', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  const handleToggleActive = async (section: Section) => {
    try {
      await apiSectionService.update(section.id, { isActive: !section.isActive });
      await load();
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Мои секции</h1>
            <p className="text-slate-400 mt-1">Управление секциями</p>
          </div>
          <button onClick={() => { setEditing(null); setModal('create'); }}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm">
            + Создать секцию
          </button>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500">Загрузка…</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-5xl mb-4">◈</div>
            <p className="text-slate-400 mb-4">У вас пока нет секций</p>
            <button onClick={() => setModal('create')} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm">
              Создать первую секцию
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map(section => {
              const count = section.enrolledCount ?? 0;
              return (
                <div key={section.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">{section.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${section.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {section.isActive ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{section.sport}</span>
                      <span>◎ {count}/{section.maxParticipants} участников</span>
                      <span>⌖ {section.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggleActive(section)} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                      {section.isActive ? 'Деактивировать' : 'Активировать'}
                    </button>
                    <button onClick={() => { setEditing(section); setModal('edit'); }}
                      className="px-3 py-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors">
                      Редактировать
                    </button>
                    <button onClick={() => handleDelete(section.id)}
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
                  {modal === 'create' ? 'Создать секцию' : 'Редактировать секцию'}
                </h2>
                <button onClick={() => { setModal(null); setEditing(null); }} className="text-slate-500 hover:text-white text-xl">✕</button>
              </div>
              <div className="p-6">
                <SectionForm
                  initial={editing ? {
                    name: editing.name, sport: editing.sport, description: editing.description,
                    location: editing.location, maxParticipants: editing.maxParticipants,
                    price: editing.price ?? 0, ageMin: editing.ageMin ?? 0, ageMax: editing.ageMax ?? 0,
                    isActive: editing.isActive, schedule: editing.schedule,
                  } : undefined}
                  saving={saving}
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
