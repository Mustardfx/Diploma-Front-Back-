import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { sectionService, enrollmentService, attendanceService } from '../../services/sectionService';
import { authService } from '../../services/authService';

const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export function SectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [tick, setTick] = useState(0);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const section = id ? sectionService.getById(id) : null;
  if (!section) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">◈</div>
          <p>Секция не найдена</p>
          <Link to="/sections" className="mt-4 inline-block text-emerald-400 hover:text-emerald-300">← Назад к секциям</Link>
        </div>
      </MainLayout>
    );
  }

  const coach = authService.getUserById(section.coachId);
  const enrollments = enrollmentService.getSectionEnrollments(section.id);
  const enrolledCount = enrollments.length;
  const full = enrolledCount >= section.maxParticipants;
  const isEnrolled = user ? enrollmentService.isEnrolled(user.id, section.id) : false;
  const canManage = hasRole('coach', 'admin');

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEnroll = () => {
    if (!user) return;
    try {
      enrollmentService.enroll(user.id, section.id);
      setTick(n => n + 1);
      notify('Вы записаны на секцию!', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  const handleCancel = () => {
    if (!user) return;
    try {
      enrollmentService.cancel(user.id, section.id);
      setTick(n => n + 1);
      notify('Запись отменена', 'success');
    } catch (e) { notify((e as Error).message, 'error'); }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/sections" className="hover:text-white transition-colors">Секции</Link>
          <span>/</span>
          <span className="text-slate-300">{section.name}</span>
        </div>

        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {notification.msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">{section.sport}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${section.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {section.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white">{section.name}</h1>
                </div>
                {section.price && (
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-400">{section.price.toLocaleString()} ₸</div>
                    <div className="text-slate-500 text-xs">в месяц</div>
                  </div>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">{section.description}</p>
            </div>

            {/* Schedule */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Расписание</h2>
              <div className="space-y-2">
                {section.schedule.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-slate-800 rounded-xl">
                    <span className="text-white font-medium">{DAY_NAMES[s.dayOfWeek]}</span>
                    <span className="text-emerald-400 font-mono">{s.timeStart} — {s.timeEnd}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants (for coach/admin) */}
            {canManage && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-bold mb-4">Участники ({enrolledCount})</h2>
                {enrollments.length === 0 ? (
                  <p className="text-slate-500 text-sm">Нет записанных участников</p>
                ) : (
                  <div className="space-y-2">
                    {enrollments.map(enrollment => {
                      const u = authService.getUserById(enrollment.userId);
                      const stats = attendanceService.getUserStats(enrollment.userId, section.id);
                      if (!u) return null;
                      return (
                        <div key={enrollment.id} className="flex items-center justify-between py-2.5 px-4 bg-slate-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{u.lastName} {u.firstName}</div>
                              <div className="text-slate-500 text-xs">{u.email}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${stats.percent >= 75 ? 'text-emerald-400' : stats.percent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {stats.percent}%
                            </div>
                            <div className="text-slate-500 text-xs">{stats.present}/{stats.total} занятий</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Capacity card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">Места</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Записано</span>
                <span className={`font-bold ${full ? 'text-red-400' : 'text-white'}`}>{enrolledCount} / {section.maxParticipants}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full ${full ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min((enrolledCount / section.maxParticipants) * 100, 100)}%` }}
                />
              </div>

              {!canManage && section.isActive && (
                isEnrolled ? (
                  <button onClick={handleCancel} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors font-medium">
                    Отменить запись
                  </button>
                ) : (
                  <button onClick={handleEnroll} disabled={full} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-colors">
                    {full ? 'Мест нет' : 'Записаться'}
                  </button>
                )
              )}
              {canManage && (
                <Link to="/coach/attendance" className="block w-full py-3 text-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-colors font-medium text-sm">
                  Отметить посещаемость
                </Link>
              )}
            </div>

            {/* Coach card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">Тренер</h3>
              {coach ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {coach.firstName[0]}{coach.lastName[0]}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{coach.lastName} {coach.firstName}</div>
                    {coach.patronymic && <div className="text-slate-400 text-xs">{coach.patronymic}</div>}
                    {coach.phone && <div className="text-slate-500 text-xs mt-1">{coach.phone}</div>}
                  </div>
                </div>
              ) : <p className="text-slate-500 text-sm">Не указан</p>}
            </div>

            {/* Location */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">Местоположение</h3>
              <p className="text-slate-300 text-sm">{section.location}</p>
            </div>

            {/* Age */}
            {(section.ageMin || section.ageMax) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2">Возраст</h3>
                <p className="text-slate-300 text-sm">{section.ageMin ?? 0} — {section.ageMax ?? '∞'} лет</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
