import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiAuthService } from '../../services/apiAuthService';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const msg = await apiAuthService.forgotPassword(email);
      setMessage(msg);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Восстановление пароля</h2>
        <p className="text-slate-400 mb-8">
          Укажите email — мы отправим ссылку для сброса пароля. Ссылка действует 1 час.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="example@email.ru"
            />
          </div>

          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm">
              {message}
            </div>
          )}
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
            {loading ? 'Отправка...' : 'Отправить ссылку'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
            ← Вернуться ко входу
          </Link>
        </p>
      </div>
    </div>
  );
}
