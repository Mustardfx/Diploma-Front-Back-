import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CosmicBackground } from './components/CosmicBackground';

// Public pages
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { LandingPage } from './pages/public/LandingPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { ForceChangePasswordPage } from './pages/ForceChangePasswordPage';

// Shared pages (доступны всем авторизованным)
import { DashboardPage } from './pages/DashboardPage';
import { SectionsPage } from './pages/sections/SectionsPage';
import { SectionDetailPage } from './pages/sections/SectionDetailPage';
import { CompetitionsPage } from './pages/competitions/CompetitionsPage';
import { CompetitionDetailPage } from './pages/competitions/CompetitionDetailPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSectionsPage } from './pages/admin/AdminSectionsPage';
import { AdminCompetitionsPage } from './pages/admin/AdminCompetitionsPage';

// Coach pages
import { CoachSectionsPage } from './pages/coach/CoachSectionsPage';
import { AttendancePage } from './pages/coach/AttendancePage';
import { AttendanceStatsPage } from './pages/coach/AttendanceStatsPage';

// Judge pages
import { JudgePanelPage } from './pages/judge/JudgePanelPage';

// Гейт обязательной смены пароля: если у залогиненного пользователя
// выставлен mustChangePassword — перекрываем всё приложение формой смены.
function AppRoutes() {
  const { user } = useAuth();

  if (user?.mustChangePassword) {
    return <ForceChangePasswordPage />;
  }

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Общие маршруты (все авторизованные) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/sections" element={
            <ProtectedRoute>
              <SectionsPage />
            </ProtectedRoute>
          } />
          <Route path="/sections/:id" element={
            <ProtectedRoute>
              <SectionDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/competitions" element={
            <ProtectedRoute>
              <CompetitionsPage />
            </ProtectedRoute>
          } />
          <Route path="/competitions/:id" element={
            <ProtectedRoute>
              <CompetitionDetailPage />
            </ProtectedRoute>
          } />

          {/* Маршруты тренера */}
          <Route path="/coach/sections" element={
            <ProtectedRoute roles={['coach', 'admin']}>
              <CoachSectionsPage />
            </ProtectedRoute>
          } />
          <Route path="/coach/attendance" element={
            <ProtectedRoute roles={['coach', 'admin']}>
              <AttendancePage />
            </ProtectedRoute>
          } />
          <Route path="/coach/attendance-stats" element={
            <ProtectedRoute roles={['coach', 'admin']}>
              <AttendanceStatsPage />
            </ProtectedRoute>
          } />

          {/* Маршруты судьи */}
          <Route path="/judge/panel" element={
            <ProtectedRoute roles={['judge', 'admin']}>
              <JudgePanelPage />
            </ProtectedRoute>
          } />

          {/* Маршруты администратора */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/sections" element={
            <ProtectedRoute roles={['admin']}>
              <AdminSectionsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/competitions" element={
            <ProtectedRoute roles={['coach', 'admin']}>
              <AdminCompetitionsPage />
            </ProtectedRoute>
          } />

      {/* Редирект для неизвестных маршрутов */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ThemeBackground() {
  const { theme } = useTheme();
  return theme === 'cosmic' ? <CosmicBackground /> : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeBackground />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
