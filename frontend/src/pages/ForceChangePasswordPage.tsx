import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiAuthService } from '../services/apiAuthService';

/**
 * Экран обязательной смены пароля. Показывается поверх приложения,
 * когда у пользователя выставлен флаг mustChangePassword (после сброса
 * пароля по email). Блокирует доступ к приложению до смены пароля.
 */
export function ForceChangePasswordPage() {
  const { updateProfile, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Новый пароль минимум 6 символов');
      return;
    }
    if (newPassword !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      await apiAuthService.changePassword(currentPassword, newPassword);
      updateProfile({ mustChangePassword: false });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Смена пароля обязательна</h2>
        <p className="text-slate-400 mb-8">
          Ваш пароль был сброшен. Перед использованием приложения задайте новый постоянный пароль.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Текущий пароль</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Повторите новый пароль</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-colors"
          >
            {loading ? 'Сохранение...' : 'Сменить пароль'}
          </button>
        </form>

        <button
          onClick={logout}
          className="w-full text-center text-slate-400 hover:text-slate-300 text-sm mt-6"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
