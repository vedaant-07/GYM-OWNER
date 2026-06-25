import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/lib/ThemeContext';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import DashboardLayout from '@/components/layout/DashboardLayout';
import LandingPage from '@/pages/LandingPage';
import Home from '@/pages/Home';
import Onboarding from '@/pages/Onboarding';
import Members from '@/pages/Members';
import ReferredUsers from '@/pages/ReferredUsers';
import Exercises from '@/pages/Exercises';
import WorkoutPlans from '@/pages/WorkoutPlans';
import AssignedWorkouts from '@/pages/AssignedWorkouts';
import DietPlans from '@/pages/DietPlans';
import AssignedDiets from '@/pages/AssignedDiets';
import Attendance from '@/pages/Attendance';
import Leads from '@/pages/Leads';
import Payments from '@/pages/Payments';
import Plans from '@/pages/Plans';
import Campaigns from '@/pages/Campaigns';
import WhatsAppNotifications from '@/pages/WhatsAppNotifications';
import EmailNotifications from '@/pages/EmailNotifications';
import Automations from '@/pages/Automations';
import Notifications from '@/pages/Notifications';
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
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
          <span className="whitespace-nowrap text-[clamp(4rem,16vw,13rem)] font-black uppercase tracking-[0.18em] text-foreground/5">
            SE7EN FIT
          </span>
        </div>
        <div className="relative z-10 w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'hsl(var(--border))', borderTopColor: '#20c55d' }}></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/referred-users" element={<ReferredUsers />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/workout-plans" element={<WorkoutPlans />} />
          <Route path="/assigned-workouts" element={<AssignedWorkouts />} />
          <Route path="/diet-plans" element={<DietPlans />} />
          <Route path="/assigned-diets" element={<AssignedDiets />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/whatsapp" element={<WhatsAppNotifications />} />
          <Route path="/email-notifications" element={<EmailNotifications />} />
          <Route path="/automations" element={<Automations />} />
          <Route path="/notifications" element={<Notifications />} />
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
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;