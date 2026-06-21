import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Home from '@/pages/Home';
import Onboarding from '@/pages/Onboarding';
import Members from '@/pages/Members';
import ReferredUsers from '@/pages/ReferredUsers';
import Attendance from '@/pages/Attendance';
import Leads from '@/pages/Leads';
import Payments from '@/pages/Payments';
import Plans from '@/pages/Plans';
import Campaigns from '@/pages/Campaigns';
import Challenges from '@/pages/Challenges';
import Staff from '@/pages/Staff';
import Classes from '@/pages/Classes';
import EquipmentPage from '@/pages/EquipmentPage';
import Reviews from '@/pages/Reviews';
import Referrals from '@/pages/Referrals';
import Reports from '@/pages/Reports';
import GymProfile from '@/pages/GymProfile';
import SettingsPage from '@/pages/SettingsPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#242424', borderTopColor: '#D4FF00' }}></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/referred-users" element={<ReferredUsers />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/gym-profile" element={<GymProfile />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App