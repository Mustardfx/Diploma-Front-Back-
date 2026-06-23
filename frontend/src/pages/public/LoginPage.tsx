import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600/20 to-slate-900 items-center justify-center p-12 border-r border-slate-800">
        <div className="max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-2xl mb-8">
            СП
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            СпортПортал
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Платформа для управления спортивными секциями и соревнованиями.
            Записывайтесь, тренируйтесь, побеждайте.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: 'Секций', value: '24+' },
              { label: 'Спортсменов', value: '1200+' },
              { label: 'Соревнований', value: '48+' },
              { label: 'Тренеров', value: '32+' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-2xl font-black text-emerald-400">{stat.value}</div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Вход в систему</h2>
          <p className="text-slate-400 mb-8">Введите данные вашего аккаунта</p>

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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-right text-sm mt-3">
            <Link to="/forgot-password" className="text-slate-400 hover:text-emerald-300">
              Забыли пароль?
            </Link>
          </p>

          <p className="text-center text-slate-400 text-sm mt-6">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
