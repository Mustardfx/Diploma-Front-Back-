import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-2xl mb-6">
        СП
      </div>
      <h1 className="text-5xl font-black text-white mb-4">СпортПортал</h1>
      <p className="text-slate-400 text-lg mb-10 max-w-md">
        Платформа для записи на спортивные секции и соревнования
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors">
          Войти
        </Link>
        <Link to="/register" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-700">
          Регистрация
        </Link>
      </div>
    </div>
  );
}
