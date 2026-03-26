import { useState, useMemo } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { sectionService, enrollmentService, attendanceService } from '../../services/sectionService';
import { authService } from '../../services/authService';
import type { AttendanceRecord } from '../../types';

export function AttendancePage() {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, { present: boolean; note: string }>>({});
  const [saved, setSaved] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (!user) return null;

  const sections = sectionService.getByCoach(user.id).filter(s => s.isActive);
  const enrollments = selectedSection ? enrollmentService.getSectionEnrollments(selectedSection) : [];

  const participants = useMemo(() => {
    if (!selectedSection) return [];
    const existing = attendanceService.getForSection(selectedSection, selectedDate);
    return enrollments.map(e => {
      const u = authService.getUserById(e.userId);
      const existingRecord = existing.find(a => a.userId === e.userId);
      return { enrollment: e, user: u, existingRecord };
    }).filter(p => p.user !== null);
  }, [selectedSection, selectedDate, enrollments]);

  // Initialize marks when section/date changes
  const initMarks = () => {
    const newMarks: Record<string, { present: boolean; note: string }> = {};
    participants.forEach(p => {
      newMarks[p.enrollment.userId] = {
        present: p.existingRecord?.present ?? true,
        note: p.existingRecord?.note ?? '',
      };
    });
    return newMarks;
  };

  const currentMarks = Object.keys(marks).length > 0 ? marks : initMarks();

  const handleMark = (userId: string, field: 'present' | 'note', val: boolean | string) => {
    setSaved(false);
    setMarks(p => ({ ...{ ...initMarks(), ...p }, [userId]: { ...currentMarks[userId], [field]: val } }));
  };

  const handleSave = () => {
    const records: Omit<AttendanceRecord, 'id'>[] = participants.map(p => ({
      enrollmentId: p.enrollment.id,
      sectionId: selectedSection,
      userId: p.enrollment.userId,
      date: selectedDate,
      present: currentMarks[p.enrollment.userId]?.present ?? true,
      note: currentMarks[p.enrollment.userId]?.note ?? '',
    }));
    attendanceService.markAttendance(records);
    setSaved(true);
    setNotification({ msg: 'Посещаемость сохранена!', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const presentCount = participants.filter(p => currentMarks[p.enrollment.userId]?.present !== false).length;

  return (
    <MainLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Посещаемость</h1>
          <p className="text-slate-400 mt-1">Отметьте присутствие участников</p>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        {/* Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Секция</label>
              <select
                value={selectedSection}
                onChange={e => { setSelectedSection(e.target.value); setMarks({}); setSaved(false); }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="">Выберите секцию</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Дата</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setMarks({}); setSaved(false); }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Attendance list */}
        {!selectedSection ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
            <div className="text-4xl mb-3">✓</div>
            <p>Выберите секцию для отметки посещаемости</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
            <p>В этой секции нет записанных участников</p>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-emerald-400 font-bold">Присутствует: {presentCount}</span>
                <span className="text-red-400 font-bold">Отсутствует: {participants.length - presentCount}</span>
                <span className="text-slate-500">Всего: {participants.length}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const all: Record<string, { present: boolean; note: string }> = {};
                    participants.forEach(p => { all[p.enrollment.userId] = { present: true, note: currentMarks[p.enrollment.userId]?.note ?? '' }; });
                    setMarks(all); setSaved(false);
                  }}
                  className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg"
                >
                  Все присутствуют
                </button>
                <button
                  onClick={() => {
                    const all: Record<string, { present: boolean; note: string }> = {};
                    participants.forEach(p => { all[p.enrollment.userId] = { present: false, note: currentMarks[p.enrollment.userId]?.note ?? '' }; });
                    setMarks(all); setSaved(false);
                  }}
                  className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg"
                >
                  Все отсутствуют
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {participants.map(p => {
                if (!p.user) return null;
                const mark = currentMarks[p.enrollment.userId] ?? { present: true, note: '' };
                const stats = attendanceService.getUserStats(p.enrollment.userId, selectedSection);

                return (
                  <div key={p.enrollment.userId} className={`bg-slate-900 border rounded-2xl p-4 transition-all ${mark.present ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${mark.present ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.user.firstName[0]}{p.user.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm">{p.user.lastName} {p.user.firstName} {p.user.patronymic}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-xs font-bold ${stats.percent >= 75 ? 'text-emerald-400' : stats.percent >= 50 ? 'text-yellow-400' : stats.total > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                            {stats.total > 0 ? `${stats.percent}% посещаемость` : 'Нет данных'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMark(p.enrollment.userId, 'present', true)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mark.present ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          ✓ Присутствует
                        </button>
                        <button
                          onClick={() => handleMark(p.enrollment.userId, 'present', false)}
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
                          onChange={e => handleMark(p.enrollment.userId, 'note', e.target.value)}
                          placeholder="Причина отсутствия (необязательно)"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors"
            >
              {saved ? '✓ Сохранено' : 'Сохранить посещаемость'}
            </button>
          </>
        )}
      </div>
    </MainLayout>
  );
}
