import { useParams, useNavigate } from 'react-router-dom';
import { FileWarning, ArrowLeft, Ship, Route, MapPin, Calendar, AlertTriangle, } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useData } from '@/context/DataContext';
import { formatRelativeTime } from '@/data/mockData';
const IncidentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getIncidentById, getVesselById, getPatrolById } = useData();
    const incident = id ? getIncidentById(id) : undefined;
    const vessel = incident?.vesselId ? getVesselById(incident.vesselId) : undefined;
    const patrol = incident?.patrolId ? getPatrolById(incident.patrolId) : undefined;
    if (!incident) {
        return (<MainLayout title="Laporan Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Laporan dengan ID tersebut tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/incidents')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>);
    }
    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'high':
                return <Badge variant="destructive">Prioritas Tinggi</Badge>;
            case 'medium':
                return <Badge className="bg-warning/15 text-warning border-warning/30">Prioritas Sedang</Badge>;
            case 'low':
                return <Badge variant="secondary">Prioritas Rendah</Badge>;
            default:
                return null;
        }
    };
    const formatDateTime = (date) => {
        return date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    return (<MainLayout title="Detail Laporan" subtitle={incident.category}>
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/incidents')}>
        <ArrowLeft className="h-4 w-4 mr-2"/>
        Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${incident.severity === 'high'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary'}`}>
                  {incident.severity === 'high' ? (<AlertTriangle className="h-6 w-6"/>) : (<FileWarning className="h-6 w-6"/>)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{incident.title}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={incident.status}/>
                    {getSeverityBadge(incident.severity)}
                    <Badge variant="outline">{incident.category}</Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6"/>

              <div>
                <h3 className="font-semibold mb-2">Deskripsi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {incident.description || 'Tidak ada deskripsi tambahan.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          {incident.location && (<MapCard title="Lokasi Kejadian" selectedVessel={{
                name: 'Lokasi Kejadian',
                lat: incident.location.lat,
                lon: incident.location.lon,
            }} className="h-[300px] min-h-0" showControls={false}/>)}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5"/>
                <div>
                  <p className="text-xs text-muted-foreground">Waktu Kejadian</p>
                  <p className="font-medium text-sm">{formatDateTime(incident.time)}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(incident.time)}</p>
                </div>
              </div>

              {incident.location && (<div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5"/>
                  <div>
                    <p className="text-xs text-muted-foreground">Koordinat</p>
                    <p className="font-medium text-sm font-mono">
                      {incident.location.lat.toFixed(6)}, {incident.location.lon.toFixed(6)}
                    </p>
                  </div>
                </div>)}
            </CardContent>
          </Card>

          {/* Related Vessel */}
          {vessel && (<Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary"/>
                  Kapal Terkait
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate(`/vessels/${vessel.id}`)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{vessel.name}</span>
                    <StatusBadge status={vessel.status} size="sm"/>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vessel.callSign}
                  </p>
                </div>
              </CardContent>
            </Card>)}

          {/* Related Patrol */}
          {patrol && (<Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Route className="h-5 w-5 text-primary"/>
                  Patroli Terkait
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate(`/patrols/${patrol.id}`)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium font-mono">{patrol.code}</span>
                    <StatusBadge status={patrol.status} size="sm"/>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {patrol.areaName}
                  </p>
                </div>
              </CardContent>
            </Card>)}

          {/* Actions */}
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-2">
              <Button className="w-full" variant="outline" disabled>
                Edit Laporan
              </Button>
              <Button className="w-full" variant="outline" disabled>
                Tutup Laporan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>);
};
export default IncidentDetail;
