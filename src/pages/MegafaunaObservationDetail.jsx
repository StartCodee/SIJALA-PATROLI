import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Fish, MapPin } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
const MegafaunaObservationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getMegafaunaObservationById, getPatrolById, mediaFiles } = useData();
    const observation = id ? getMegafaunaObservationById(id) : undefined;
    const patrol = observation ? getPatrolById(observation.patrolId) : undefined;
    const photo = observation ? mediaFiles.find((item) => item.id === observation.photoId) : undefined;
    if (!observation) {
        return (<MainLayout title="Data Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Observasi megafauna tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/monitoring-megafauna')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>);
    }
    const formatDate = (date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatTime = (date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return (<MainLayout title="Detail Observasi Megafauna" subtitle={observation.speciesName}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/monitoring-megafauna')}>
        <ArrowLeft className="h-4 w-4 mr-2"/>
        Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Fish className="h-6 w-6 text-primary"/>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{observation.speciesName}</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Jumlah: {observation.count} | {observation.behavior}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{observation.areaName}</Badge>
                    <Badge variant="secondary">{observation.stationName}</Badge>
                    {patrol && <Badge variant="outline">{patrol.code}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Tanggal: {formatDate(observation.observationTime)} | Jam: {formatTime(observation.observationTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <MapCard title="Lokasi Observasi" selectedVessel={{
            name: observation.locationName,
            lat: observation.location.lat,
            lon: observation.location.lon,
        }} markers={[
            {
                lat: observation.location.lat,
                lon: observation.location.lon,
                label: observation.speciesName,
                description: observation.locationName,
                color: '#22c55e',
            },
        ]} showControls={false}/>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Fish className="h-5 w-5 text-primary"/>
                Informasi Observasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lokasi</span>
                <span>{observation.locationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area</span>
                <span>{observation.areaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stasiun</span>
                <span>{observation.stationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perilaku</span>
                <span>{observation.behavior}</span>
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
                  {observation.location.lat.toFixed(5)}, {observation.location.lon.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah</span>
                <span>{observation.count}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Fish className="h-5 w-5 text-primary"/>
                Dokumentasi Observasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border overflow-hidden bg-muted">
                <img src={photo?.url ?? '/placeholder.svg'} alt={photo?.name ?? 'Dokumentasi observasi'} className="w-full h-48 object-cover" loading="lazy"/>
              </div>
              <p className="text-xs text-muted-foreground">
                {photo?.name ?? 'Dokumentasi observasi'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>);
};
export default MegafaunaObservationDetail;
