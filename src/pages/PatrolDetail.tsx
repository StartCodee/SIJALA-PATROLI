import { useParams, useNavigate } from 'react-router-dom';
import { Route, ArrowLeft, Ship, MapPin, Calendar, Target, Clock, FileWarning } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { formatRelativeTime } from '@/data/mockData';

const PatrolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatrolById, getVesselById, getIncidentsByPatrolId } = useData();

  const patrol = id ? getPatrolById(id) : undefined;
  const vessel = patrol ? getVesselById(patrol.vesselId) : undefined;
  const incidents = id ? getIncidentsByPatrolId(id) : [];

  if (!patrol) {
    return (
      <MainLayout title="Patroli Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Patroli dengan ID tersebut tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/patrols')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MainLayout
      title={patrol.code}
      subtitle={patrol.areaName}
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate('/patrols')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      {/* Status */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Route className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{patrol.code}</h2>
          <StatusBadge status={patrol.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <MapCard
            title="Area Patroli"
            selectedVessel={vessel ? {
              name: vessel.name,
              lat: vessel.lastPosition.lat,
              lon: vessel.lastPosition.lon,
            } : null}
            className="h-[400px]"
          />
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Patrol Info */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Detail Patroli
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Area</p>
                  <p className="font-medium">{patrol.areaName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{patrol.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Waktu Mulai</p>
                  <p className="font-medium">{formatDateTime(patrol.startTime)}</p>
                </div>
              </div>
              {patrol.endTime && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Waktu Selesai</p>
                    <p className="font-medium">{formatDateTime(patrol.endTime)}</p>
                  </div>
                </div>
              )}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Objektif</p>
                <p className="text-sm">{patrol.objective}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vessel Info */}
          {vessel && (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  Kapal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => navigate(`/vessels/${vessel.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{vessel.name}</span>
                    <StatusBadge status={vessel.status} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vessel.callSign} • {vessel.captain}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Incidents */}
      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            Kejadian Terkait ({incidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada kejadian tercatat pada patroli ini
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-2">{incident.title}</h4>
                    <StatusBadge status={incident.status} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {incident.category}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(incident.time)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default PatrolDetail;
