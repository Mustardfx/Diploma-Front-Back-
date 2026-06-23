import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import {
  apiSectionService,
  apiEnrollmentService,
  apiAttendanceService,
} from '../../services/apiSectionService';
import { apiLessonPointsService } from '../../services/apiCompetitionService';
import type { Section, Enrollment, AttendanceRecord } from '../../types';

type Stats = { total: number; present: number; percent: number };

export function AttendancePage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [participants, setParticipants] = useState<Enrollment[]>([]);
  const [statsByUser, setStatsByUser] = useState<Record<string, Stats>>({});
  const [marks, setMarks] = useState<Record<string, { present: boolean; note: string }>>({});
  const [recordByUser, setRecordByUser] = useState<Record<string, AttendanceRecord>>({});
  const [points, setPoints] = useState<Record<string, string>>({});

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Список секций: админ видит все, тренер — только свои
  useEffect(() => {
    const loader = user?.role === 'admin' ? apiSectionService.getAll() : apiSectionService.getMine();
    loader
      .then(secs => setSections(secs.filter(s => s.isActive)))
      .catch(e => notify((e as Error).message, 'error'));
  }, [user?.role]);

  // Загрузка участников + отметок + статистики при смене секции/даты
  const loadSectionData = useCallback(async () => {
    if (!selectedSection) {
      setParticipants([]);
      setMarks({});
      setStatsByUser({});
      return;
    }
    setLoadingData(true);
    setSaved(false);
    try {
      const [enrollments, existing, lessonPoints] = await Promise.all([
        apiEnrollmentService.getBySection(selectedSection),
        apiAttendanceService.getForSection(selectedSection, selectedDate),
        apiLessonPointsService.getBySection(selectedSection).catch(() => []),
      ]);
      setParticipants(enrollments);

      // Инициализация отметок из уже сохранённых записей на эту дату
      const initial: Record<string, { present: boolean; note: string }> = {};
      const recMap: Record<string, AttendanceRecord> = {};
      enrollments.forEach(e => {
        const rec = existing.find(a => a.userId === e.userId);
        initial[e.userId] = { present: rec?.present ?? true, note: rec?.note ?? '' };
        if (rec) recMap[e.userId] = rec;
      });
      setMarks(initial);
      setRecordByUser(recMap);

      // Инициализация баллов из уже сохранённых за эту дату
      const initialPoints: Record<string, string> = {};
      enrollments.forEach(e => {
        const pt = lessonPoints.find(p => p.userId === e.userId && p.lessonDate === selectedDate);
        initialPoints[e.userId] = pt?.score != null ? String(pt.score) : '';
      });
      setPoints(initialPoints);

      // Статистика посещаемости по каждому участнику
      const statsPairs = await Promise.all(
        enrollments.map(async e => {
          try {
            const s = await apiAttendanceService.getUserStats(e.userId, selectedSection);
            return [e.userId, s] as const;
          } catch {
            return [e.userId, { total: 0, present: 0, percent: 0 }] as const;
          }
        }),
      );
      setStatsByUser(Object.fromEntries(statsPairs));
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setLoadingData(false);
    }
  }, [selectedSection, selectedDate]);

  useEffect(() => { void loadSectionData(); }, [loadSectionData]);

  const setMark = (userId: string, field: 'present' | 'note', val: boolean | string) => {
    setSaved(false);
    setMarks(p => ({ ...p, [userId]: { ...(p[userId] ?? { present: true, note: '' }), [field]: val } }));
  };

  const setAll = (present: boolean) => {
    setSaved(false);
    setMarks(prev => {
      const next: Record<string, { present: boolean; note: string }> = {};
      participants.forEach(e => { next[e.userId] = { present, note: prev[e.userId]?.note ?? '' }; });
      return next;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Посещаемость по всем участникам
      const records: Omit<AttendanceRecord, 'id'>[] = participants.map(e => ({
        enrollmentId: e.id,
        sectionId: selectedSection,
        userId: e.userId,
        date: selectedDate,
        present: marks[e.userId]?.present ?? true,
        note: marks[e.userId]?.note ?? '',
      }));
      await apiAttendanceService.mark(records);

      // 2. Баллы за урок — только тем, кому проставили валидное число
      const pointsToSave = participants
        .map(e => ({ userId: e.userId, raw: points[e.userId] }))
        .filter(p => p.raw !== undefined && p.raw !== '' && !Number.isNaN(Number(p.raw)));

      if (pointsToSave.length > 0) {
        await Promise.all(
          pointsToSave.map(p =>
            apiLessonPointsService.save({
              sectionId: selectedSection,
              userId: p.userId,
              lessonDate: selectedDate,
              score: Number(p.raw),
            }),
          ),
        );
      }

      setSaved(true);
      notify('Сохранено!', 'success');
      await loadSectionData();
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const presentCount = participants.filter(e => marks[e.userId]?.present !== false).length;

  return (
    <MainLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Посещаемость</h1>
          <p className="mt-1 text-slate-400">Отметьте присутствие участников</p>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        {/* Controls */}
        <div className="p-5 mb-6 border bg-slate-900 border-slate-800 rounded-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">Секция</label>
              <select
                value={selectedSection}
                onChange={e => { setSelectedSection(e.target.value); }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="">Выберите секцию</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">Дата</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Attendance list */}
        {!selectedSection ? (
          <div className="py-20 text-center border bg-slate-900 border-slate-800 rounded-2xl text-slate-500">
            <div className="mb-3 text-4xl">✓</div>
            <p>Выберите секцию для отметки посещаемости</p>
          </div>
        ) : loadingData ? (
          <div className="py-20 text-center border bg-slate-900 border-slate-800 rounded-2xl text-slate-500">
            <p>Загрузка участников…</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="py-20 text-center border bg-slate-900 border-slate-800 rounded-2xl text-slate-500">
            <p>В этой секции нет записанных участников</p>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-emerald-400">Присутствует: {presentCount}</span>
                <span className="font-bold text-red-400">Отсутствует: {participants.length - presentCount}</span>
                <span className="text-slate-500">Всего: {participants.length}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAll(true)} className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                  Все присутствуют
                </button>
                <button onClick={() => setAll(false)} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                  Все отсутствуют
                </button>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              {participants.map(e => {
                const u = e.user;
                const mark = marks[e.userId] ?? { present: true, note: '' };
                const stats = statsByUser[e.userId] ?? { total: 0, present: 0, percent: 0 };

                return (
                  <div key={e.id} className={`bg-slate-900 border rounded-2xl p-4 transition-all ${mark.present ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${mark.present ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u?.firstName?.[0] ?? '?'}{u?.lastName?.[0] ?? ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{u ? `${u.lastName} ${u.firstName} ${u.patronymic ?? ''}` : e.userId}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-xs font-bold ${stats.percent >= 75 ? 'text-emerald-400' : stats.percent >= 50 ? 'text-yellow-400' : stats.total > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                            {stats.total > 0 ? `${stats.percent}% посещаемость` : 'Нет данных'}
                          </span>
                          {recordByUser[e.userId]?.checkedInAt && (
                            <span className="text-xs text-slate-500">
                              отмечен {new Date(recordByUser[e.userId].checkedInAt!).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMark(e.userId, 'present', true)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mark.present ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          ✓ Присутствует
                        </button>
                        <button
                          onClick={() => setMark(e.userId, 'present', false)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${!mark.present ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          ✕ Отсутствует
                        </button>
                      </div>
                    </div>
                    {!mark.present && (
                      <div className="mt-3 ml-14">
                        <input
                          value={mark.note}
                          onChange={ev => setMark(e.userId, 'note', ev.target.value)}
                          placeholder="Причина отсутствия (необязательно)"
                          className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-slate-800 border-slate-700 placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    )}

                    {/* Баллы за урок */}
                    <div className="flex items-center gap-2 mt-3 ml-14">
                      <span className="text-xs text-slate-400">Баллы за урок:</span>
                      <input
                        type="number"
                        value={points[e.userId] ?? ''}
                        onChange={ev => setPoints(p => ({ ...p, [e.userId]: ev.target.value }))}
                        placeholder="0"
                        className="w-24 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full py-3 font-bold transition-colors bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl"
            >
              {saving ? 'Сохранение…' : saved ? '✓ Сохранено' : 'Сохранить посещаемость и баллы'}
            </button>
          </>
        )}
      </div>
    </MainLayout>
  );
}
