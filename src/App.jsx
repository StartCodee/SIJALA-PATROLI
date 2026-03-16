import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { LanguageRuntimeTranslator } from '@/i18n/LanguageRuntimeTranslator';
import { buildReturnToPath } from '@/lib/authRedirect';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import VesselList from './pages/VesselList';
import VesselDetail from './pages/VesselDetail';
import PatrolList from './pages/PatrolList';
import PatrolDetail from './pages/PatrolDetail';
import IncidentList from './pages/IncidentList';
import IncidentCreate from './pages/IncidentCreate';
import IncidentDetail from './pages/IncidentDetail';
import Findings from './pages/Findings';
import FindingDetail from './pages/FindingDetail';
import MegafaunaObservationList from './pages/MegafaunaObservationList';
import MegafaunaObservationDetail from './pages/MegafaunaObservationDetail';
import HabitatMonitoringList from './pages/HabitatMonitoringList';
import HabitatMonitoringDetail from './pages/HabitatMonitoringDetail';
import CrewList from './pages/CrewList';
import CrewDetail from './pages/CrewDetail';
import CrewAssignments from './pages/CrewAssignments';
import GuardPostList from './pages/GuardPostList';
import GuardPostAreaDetail from './pages/GuardPostAreaDetail';
import SpeedboatList from './pages/SpeedboatList';
import UserManagementPage from './pages/UserManagementPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function FullscreenLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <FullscreenLoader />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: buildReturnToPath(location) }} />;
  }

  return children;
}

function GuestOnlyRoute({ children }) {
  const auth = useAuth();

  if (auth.loading) {
    return <FullscreenLoader />;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RoleRoute({ roles, children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <FullscreenLoader />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: buildReturnToPath(location) }} />;
  }

  if (!auth.hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <LanguageRuntimeTranslator />
              <Routes>
                <Route
                  path="/login"
                  element={(
                    <GuestOnlyRoute>
                      <LoginPage />
                    </GuestOnlyRoute>
                  )}
                />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                <Route
                  path="/"
                  element={(
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/monitoring"
                  element={(
                    <ProtectedRoute>
                      <LiveMonitoring />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/vessels"
                  element={(
                    <ProtectedRoute>
                      <VesselList />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/vessels/:id"
                  element={(
                    <ProtectedRoute>
                      <VesselDetail />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/patrols"
                  element={(
                    <ProtectedRoute>
                      <PatrolList />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/patrols/:id"
                  element={(
                    <ProtectedRoute>
                      <PatrolDetail />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/crew"
                  element={(
                    <ProtectedRoute>
                      <CrewList />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/crew/:id"
                  element={(
                    <ProtectedRoute>
                      <CrewDetail />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/crew-assignments"
                  element={(
                    <ProtectedRoute>
                      <CrewAssignments />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/guard-posts"
                  element={(
                    <ProtectedRoute>
                      <GuardPostList />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/guard-posts/:areaId"
                  element={(
                    <ProtectedRoute>
                      <GuardPostAreaDetail />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/speedboats"
                  element={(
                    <ProtectedRoute>
                      <SpeedboatList />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/incidents"
                  element={(
                    <ProtectedRoute>
                      <IncidentList />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/incidents/new"
                  element={(
                    <ProtectedRoute>
                      <IncidentCreate />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/incidents/:id"
                  element={(
                    <ProtectedRoute>
                      <IncidentDetail />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/findings"
                  element={(
                    <ProtectedRoute>
                      <Findings />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/findings/:id"
                  element={(
                    <ProtectedRoute>
                      <FindingDetail />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/monitoring-megafauna"
                  element={(
                    <ProtectedRoute>
                      <MegafaunaObservationList />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/monitoring-megafauna/:id"
                  element={(
                    <ProtectedRoute>
                      <MegafaunaObservationDetail />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/monitoring-habitat"
                  element={(
                    <ProtectedRoute>
                      <HabitatMonitoringList />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/monitoring-habitat/:id"
                  element={(
                    <ProtectedRoute>
                      <HabitatMonitoringDetail />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/users"
                  element={(
                    <RoleRoute roles={['superadmin', 'admin']}>
                      <UserManagementPage />
                    </RoleRoute>
                  )}
                />
                <Route
                  path="/profile"
                  element={(
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  )}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
