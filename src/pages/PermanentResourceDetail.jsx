import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Landmark, MapPin } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
const PermanentResourceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getPermanentResourceById, getPatrolById, mediaFiles } = useData();
    const resource = id ? getPermanentResourceById(id) : undefined;
    const patrol = resource ? getPatrolById(resource.patrolId) : undefined;
    const photo = resource ? mediaFiles.find((item) => item.id === resource.resourcePhotoId) : undefined;
    if (!resource) {
        return (<MainLayout title="Data Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Data monitoring permanent tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/monitoring-permanent')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>);
    }
    const formatDate = (date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatTime = (date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return (<MainLayout title="Detail Monitoring Permanent" subtitle={resource.resourceType}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/monitoring-permanent')}>
        <ArrowLeft className="h-4 w-4 mr-2"/>
        Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Landmark className="h-6 w-6 text-primary"/>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{resource.resourceType}</h2>
                  <p className="text-sm text-muted-foreground mb-3">{resource.function}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{resource.status}</Badge>
                    {patrol && <Badge variant="secondary">{patrol.code}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Tanggal: {formatDate(resource.surveyTime)} | Jam: {formatTime(resource.surveyTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <MapCard title="Lokasi Aset" selectedVessel={{
            name: resource.resourceType,
            lat: resource.location.lat,
            lon: resource.location.lon,
        }} markers={[
            {
                lat: resource.location.lat,
                lon: resource.location.lon,
                label: 'Aset',
                description: resource.status,
                color: '#0ea5e9',
            },
        ]} showControls={false}/>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary"/>
                Informasi Aset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fungsi</span>
                <span>{resource.function}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span>{resource.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah Unit</span>
                <span>{resource.unitCount}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Catatan</p>
                <p>{resource.notes ?? '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary"/>
                Informasi Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Koordinat</span>
                <span className="font-mono">
                  {resource.location.lat.toFixed(5)}, {resource.location.lon.toFixed(5)}
                </span>
              </div>
              {patrol && (<div className="flex justify-between">
                  <span className="text-muted-foreground">Patroli</span>
                  <span className="font-mono">{patrol.code}</span>
                </div>)}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary"/>
                Dokumentasi Aset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border overflow-hidden bg-muted">
                <img src={photo?.url ?? '/placeholder.svg'} alt={photo?.name ?? 'Dokumentasi aset'} className="w-full h-48 object-cover" loading="lazy"/>
              </div>
              <p className="text-xs text-muted-foreground">
                {photo?.name ?? 'Dokumentasi aset'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>);
};
export default PermanentResourceDetail;
