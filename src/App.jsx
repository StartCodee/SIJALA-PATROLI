import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
// Pages
import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import VesselList from "./pages/VesselList";
import VesselDetail from "./pages/VesselDetail";
import PatrolList from "./pages/PatrolList";
import PatrolDetail from "./pages/PatrolDetail";
import IncidentList from "./pages/IncidentList";
import IncidentCreate from "./pages/IncidentCreate";
import IncidentDetail from "./pages/IncidentDetail";
import Findings from "./pages/Findings";
import FindingDetail from "./pages/FindingDetail";
import NonPermanentResourceList from "./pages/NonPermanentResourceList";
import NonPermanentResourceDetail from "./pages/NonPermanentResourceDetail";
import PermanentResourceList from "./pages/PermanentResourceList";
import PermanentResourceDetail from "./pages/PermanentResourceDetail";
import MegafaunaObservationList from "./pages/MegafaunaObservationList";
import MegafaunaObservationDetail from "./pages/MegafaunaObservationDetail";
import HabitatMonitoringList from "./pages/HabitatMonitoringList";
import HabitatMonitoringDetail from "./pages/HabitatMonitoringDetail";
import CrewList from "./pages/CrewList";
import CrewDetail from "./pages/CrewDetail";
import CrewAssignments from "./pages/CrewAssignments";
import GuardPostList from "./pages/GuardPostList";
import UserManagementPage from "./pages/UserManagementPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/monitoring" element={<LiveMonitoring />}/>
            <Route path="/vessels" element={<VesselList />}/>
            <Route path="/vessels/:id" element={<VesselDetail />}/>
            <Route path="/patrols" element={<PatrolList />}/>
            <Route path="/patrols/:id" element={<PatrolDetail />}/>
            <Route path="/crew" element={<CrewList />}/>
            <Route path="/crew/:id" element={<CrewDetail />}/>
            <Route path="/crew-assignments" element={<CrewAssignments />}/>
            <Route path="/guard-posts" element={<GuardPostList />}/>
            <Route path="/incidents" element={<IncidentList />}/>
            <Route path="/incidents/new" element={<IncidentCreate />}/>
            <Route path="/incidents/:id" element={<IncidentDetail />}/>
            <Route path="/findings" element={<Findings />}/>
            <Route path="/findings/:id" element={<FindingDetail />}/>
            <Route path="/monitoring-non-permanent" element={<NonPermanentResourceList />}/>
            <Route path="/monitoring-non-permanent/:id" element={<NonPermanentResourceDetail />}/>
            <Route path="/monitoring-permanent" element={<PermanentResourceList />}/>
            <Route path="/monitoring-permanent/:id" element={<PermanentResourceDetail />}/>
            <Route path="/monitoring-megafauna" element={<MegafaunaObservationList />}/>
            <Route path="/monitoring-megafauna/:id" element={<MegafaunaObservationDetail />}/>
            <Route path="/monitoring-habitat" element={<HabitatMonitoringList />}/>
            <Route path="/monitoring-habitat/:id" element={<HabitatMonitoringDetail />}/>
            <Route path="/users" element={<UserManagementPage />}/>
            <Route path="/profile" element={<ProfilePage />}/>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>);
export default App;
