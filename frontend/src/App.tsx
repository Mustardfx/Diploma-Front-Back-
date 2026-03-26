import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public pages
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { LandingPage } from './pages/public/LandingPage';

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

// Judge pages
import { JudgePanelPage } from './pages/judge/JudgePanelPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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
            <ProtectedRoute roles={['admin']}>
              <AdminCompetitionsPage />
            </ProtectedRoute>
          } />

          {/* Редирект для неизвестных маршрутов */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
