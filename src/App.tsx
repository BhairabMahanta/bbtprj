import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardLayout } from './components/DashboardLayout';
import { PersonalDashboard } from './pages/PersonalDashboard';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GetReferredPage } from './pages/GetReferredPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      
      {/* Protected routes - wrapped with ProtectedRoute */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PersonalDashboard />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="referrals" element={<ReferralsPage />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="get-referred" element={<GetReferredPage />} />
      </Route>
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
