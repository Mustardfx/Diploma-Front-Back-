import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Главная', path: '/dashboard', icon: '⊞' },
  { label: 'Секции', path: '/sections', icon: '◈' },
  { label: 'Соревнования', path: '/competitions', icon: '⚡' },
  { label: 'Мои секции', path: '/coach/sections', icon: '◉', roles: ['coach', 'admin'] },
  { label: 'Посещаемость', path: '/coach/attendance', icon: '✓', roles: ['coach', 'admin'] },
  { label: 'Судейство', path: '/judge/panel', icon: '⊖', roles: ['judge', 'admin'] },
  { label: 'Пользователи', path: '/admin/users', icon: '◎', roles: ['admin'] },
  { label: 'Управление', path: '/admin', icon: '◆', roles: ['admin'] },
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  coach: 'Тренер',
  athlete: 'Спортсмен',
  judge: 'Судья',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  coach: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  athlete: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  judge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.some(role => hasRole(role))
  );

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-60' : 'w-16'} 
        transition-all duration-300 flex-shrink-0
        bg-slate-900 border-r border-slate-800 flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm flex-shrink-0">
            СП
          </div>
          {sidebarOpen && (
            <span className="ml-3 font-bold text-white text-sm tracking-wide">
              СпортПортал
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {visibleNav.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                  ${active
                    ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-slate-800">
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-all">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className={`text-xs px-1.5 py-0.5 rounded border mt-0.5 inline-block ${user ? ROLE_COLORS[user.role] : ''}`}>
                  {user ? ROLE_LABELS[user.role] : ''}
                </div>
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={`
              mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg
              text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm
            `}
          >
            <span className="text-base flex-shrink-0 w-5 text-center">⏻</span>
            {sidebarOpen && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ☰
          </button>
          <div className="flex-1" />
          <span className="text-slate-500 text-sm">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
