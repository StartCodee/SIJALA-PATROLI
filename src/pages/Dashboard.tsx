import { Ship, Route, FileWarning, AlertTriangle, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/shared/KPICard';
import { MapCard } from '@/components/map/MapCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { getConnectionStatus, formatRelativeTime } from '@/data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { vessels, patrols, incidents } = useData();

  // Calculate KPIs
  const activeVessels = vessels.filter(v => v.status === 'aktif').length;
  const activePatrols = patrols.filter(p => p.status === 'active').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIncidents = incidents.filter(i => i.time >= today).length;
  
  const offlineVessels = vessels.filter(v => {
    const status = getConnectionStatus(v.lastPosition.timestamp);
    return status === 'offline';
  }).length;

  // Recent activities (latest 5 incidents)
  const recentActivities = incidents.slice(0, 5);

  return (
    <MainLayout title="Dashboard" subtitle="Ringkasan aktivitas patroli hari ini">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Kapal Aktif"
          value={activeVessels}
          icon={Ship}
          variant="primary"
        />
        <KPICard
          title="Patroli Aktif"
          value={activePatrols}
          icon={Route}
          variant="success"
        />
        <KPICard
          title="Laporan Hari Ini"
          value={todayIncidents}
          icon={FileWarning}
          variant="warning"
        />
        <KPICard
          title="Tidak Update >5min"
          value={offlineVessels}
          icon={AlertTriangle}
          variant={offlineVessels > 0 ? 'destructive' : 'default'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview */}
        <div className="lg:col-span-2">
          <MapCard
            title="Peta Overview"
            showControls={false}
            className="h-full"
          >
            <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-card">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success animate-pulse" />
                <span className="text-sm font-medium">{activeVessels} kapal aktif</span>
              </div>
            </div>
          </MapCard>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Aktivitas Terkini
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/incidents')}
                className="text-xs"
              >
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="divide-y divide-border">
                {recentActivities.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {incident.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {incident.category}
                        </p>
                      </div>
                      <StatusBadge status={incident.status} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatRelativeTime(incident.time)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Active Patrols */}
      <Card className="mt-6 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Patroli Aktif
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patrols')}
              className="text-xs"
            >
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {patrols
              .filter(p => p.status === 'active')
              .map((patrol) => {
                const vessel = vessels.find(v => v.id === patrol.vesselId);
                return (
                  <div
                    key={patrol.id}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/patrols/${patrol.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Route className="h-5 w-5 text-primary" />
                      </div>
                      <StatusBadge status={patrol.status} size="sm" />
                    </div>
                    <h4 className="font-semibold text-foreground">{patrol.code}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{patrol.areaName}</p>
                    {vessel && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {vessel.name}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;
