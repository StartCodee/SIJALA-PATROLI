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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monitoring" element={<LiveMonitoring />} />
            <Route path="/vessels" element={<VesselList />} />
            <Route path="/vessels/:id" element={<VesselDetail />} />
            <Route path="/patrols" element={<PatrolList />} />
            <Route path="/patrols/:id" element={<PatrolDetail />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/incidents/new" element={<IncidentCreate />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
