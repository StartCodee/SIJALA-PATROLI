import { useParams, useNavigate } from 'react-router-dom';
import { Ship, ArrowLeft, Navigation, Clock, Users, Anchor, MapPin } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import {
  getConnectionStatus,
  formatRelativeTime,
  filterTrackPointsByTime,
  TimeRange,
} from '@/data/mockData';
import { useState } from 'react';

const VesselDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVesselById, trackPoints, getPatrolsByVesselId, getIncidentsByVesselId, patrols } = useData();
  const [trackTimeRange, setTrackTimeRange] = useState<TimeRange>('1h');

  const vessel = id ? getVesselById(id) : undefined;
  const vesselPatrols = id ? getPatrolsByVesselId(id) : [];
  const vesselIncidents = id ? getIncidentsByVesselId(id) : [];

  if (!vessel) {
    return (
      <MainLayout title="Kapal Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Kapal dengan ID tersebut tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/vessels')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  const connectionStatus = getConnectionStatus(vessel.lastPosition.timestamp);
  const currentPatrol = vessel.patrolId ? patrols.find(p => p.id === vessel.patrolId) : null;
  const vesselTrackPoints = id ? filterTrackPointsByTime(trackPoints, id, trackTimeRange) : [];

  return (
    <MainLayout
      title={vessel.name}
      subtitle={`Call Sign: ${vessel.callSign}`}
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate('/vessels')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Ship className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={vessel.status} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kecepatan</p>
              <p className="font-semibold">{vessel.lastPosition.speed} knot</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Koneksi</p>
              <StatusBadge status={connectionStatus} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kru</p>
              <p className="font-semibold">{vessel.crew} orang</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="track">Track</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vessel Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-primary" />
                  Informasi Kapal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama</p>
                    <p className="font-medium">{vessel.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Call Sign</p>
                    <p className="font-medium font-mono">{vessel.callSign}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipe</p>
                    <p className="font-medium">{vessel.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kapten</p>
                    <p className="font-medium">{vessel.captain}</p>
                  </div>
                </div>
                {currentPatrol && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Patroli Saat Ini</p>
                    <div
                      className="p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => navigate(`/patrols/${currentPatrol.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{currentPatrol.code}</span>
                        <StatusBadge status={currentPatrol.status} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{currentPatrol.areaName}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Position */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Posisi Terakhir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="font-medium font-mono">{vessel.lastPosition.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="font-medium font-mono">{vessel.lastPosition.lon.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Heading</p>
                    <p className="font-medium">{vessel.lastPosition.heading}°</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Update</p>
                    <p className="font-medium">{formatRelativeTime(vessel.lastPosition.timestamp)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Track Tab */}
        <TabsContent value="track" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MapCard
                title="Rute Perjalanan"
                selectedVessel={{
                  name: vessel.name,
                  lat: vessel.lastPosition.lat,
                  lon: vessel.lastPosition.lon,
                }}
                className="h-[400px]"
              />
            </div>
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Track Points</CardTitle>
                <div className="flex gap-2 mt-2">
                  {(['1h', '6h', 'today'] as TimeRange[]).map((range) => (
                    <Button
                      key={range}
                      variant={trackTimeRange === range ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrackTimeRange(range)}
                    >
                      {range === '1h' ? '1 Jam' : range === '6h' ? '6 Jam' : 'Hari Ini'}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {vesselTrackPoints.length} titik tercatat
                </p>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2">
                    {vesselTrackPoints.slice(-10).reverse().map((point, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 rounded bg-muted/50 font-mono"
                      >
                        <span className="text-muted-foreground">
                          {point.timestamp.toLocaleTimeString('id-ID')}
                        </span>
                        <br />
                        {point.lat.toFixed(6)}, {point.lon.toFixed(6)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patrol History */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Riwayat Patroli</CardTitle>
              </CardHeader>
              <CardContent>
                {vesselPatrols.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada riwayat patroli
                  </p>
                ) : (
                  <div className="space-y-3">
                    {vesselPatrols.map((patrol) => (
                      <div
                        key={patrol.id}
                        className="p-3 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/patrols/${patrol.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{patrol.code}</span>
                          <StatusBadge status={patrol.status} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{patrol.areaName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{patrol.date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Incident History */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Riwayat Kejadian</CardTitle>
              </CardHeader>
              <CardContent>
                {vesselIncidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada riwayat kejadian
                  </p>
                ) : (
                  <div className="space-y-3">
                    {vesselIncidents.slice(0, 5).map((incident) => (
                      <div
                        key={incident.id}
                        className="p-3 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/incidents/${incident.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate flex-1 mr-2">
                            {incident.title}
                          </span>
                          <StatusBadge status={incident.status} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {incident.category} • {formatRelativeTime(incident.time)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default VesselDetail;
