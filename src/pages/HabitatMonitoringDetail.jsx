import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, TreePine } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
const validationLabels = {
    pending: 'Menunggu',
    valid: 'Valid',
    invalid: 'Tidak Valid',
};
const HabitatMonitoringDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getMonitoringHabitatById, conservationAreas, habitatVisits, habitatVisitViolationItems, violationTypes, mediaFiles, } = useData();
    const habitat = id ? getMonitoringHabitatById(id) : undefined;
    if (!habitat) {
        return (<MainLayout title="Data Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Monitoring habitat tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/monitoring-habitat')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>);
    }
    const area = conservationAreas.find((item) => item.id === habitat.conservationAreaId);
    const visits = habitatVisits.filter((visit) => visit.monitoringId === habitat.id);
    const formatDate = (date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatTime = (date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const getValidationBadge = (status) => {
        const className = status === 'valid'
            ? 'border-status-approved/30 bg-status-approved-bg text-status-approved'
            : status === 'invalid'
                ? 'border-status-rejected/30 bg-status-rejected-bg text-status-rejected'
                : 'border-status-pending/30 bg-status-pending-bg text-status-pending';
        return (<Badge variant="outline" className={className}>
        {validationLabels[status]}
      </Badge>);
    };
    return (<MainLayout title="Detail Monitoring Habitat" subtitle={habitat.monitoringCode}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/monitoring-habitat')}>
        <ArrowLeft className="h-4 w-4 mr-2"/>
        Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TreePine className="h-6 w-6 text-primary"/>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{habitat.siteName}</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    {area?.name ?? '-'} | {habitat.monitoringCode}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getValidationBadge(habitat.habitatValidation)}
                    <Badge variant="secondary">{habitat.collectedBy}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Tanggal: {formatDate(habitat.monitoringTime)} | Jam: {formatTime(habitat.monitoringTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <MapCard title="Lokasi Monitoring" selectedVessel={{
            name: habitat.siteName,
            lat: habitat.location.lat,
            lon: habitat.location.lon,
        }} markers={[
            {
                lat: habitat.location.lat,
                lon: habitat.location.lon,
                label: habitat.siteName,
                description: area?.name ?? 'Monitoring Habitat',
                color: '#3b82f6',
            },
        ]} showControls={false}/>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary"/>
                Kunjungan Habitat ({visits.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visits.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada kunjungan habitat yang tercatat.
                </p>) : (visits.map((visit) => {
            const visitViolations = habitatVisitViolationItems
                .filter((item) => item.habitatVisitId === visit.id)
                .map((item) => ({
                ...item,
                detail: violationTypes.find((type) => type.id === item.violationTypeId),
            }))
                .filter((item) => item.detail);
            const documentation = mediaFiles.find((item) => item.id === visit.documentationId);
            return (<div key={visit.id} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{visit.operatorName}</p>
                          <p className="text-xs text-muted-foreground">
                            Pengunjung {visit.visitorCount} | Guide {visit.guideCount} | Total {visit.totalPeople}
                          </p>
                        </div>
                        <Badge variant="outline">
                          Manta terlihat: {visit.mantaSightingsCount}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Lokasi Manta</p>
                          <p>{visit.mantaLocation}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Kerusakan</p>
                          <p>{visit.damageDescription}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tindak Lanjut</p>
                          <p>{visit.actionTaken}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Solusi</p>
                          <p>{visit.solution}</p>
                        </div>
                      </div>

                      {visitViolations.length > 0 && (<div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Pelanggaran Terkait</p>
                          <div className="flex flex-wrap gap-2">
                            {visitViolations.map((item) => (<Badge key={item.id} variant="outline">
                                {item.detail?.name}
                              </Badge>))}
                          </div>
                        </div>)}

                      <div className="rounded-lg border border-border overflow-hidden bg-muted">
                        <img src={documentation?.url ?? '/placeholder.svg'} alt={documentation?.name ?? 'Dokumentasi kunjungan'} className="w-full h-40 object-cover" loading="lazy"/>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {documentation?.name ?? 'Dokumentasi kunjungan'}
                      </p>
                    </div>);
        }))}
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
                  {habitat.location.lat.toFixed(5)}, {habitat.location.lon.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area</span>
                <span>{area?.name ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Site</span>
                <span>{habitat.siteName}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary"/>
                Informasi Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Observer 1</span>
                <span>{habitat.observer1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Observer 2</span>
                <span>{habitat.observer2 ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Observer 3</span>
                <span>{habitat.observer3 ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengumpul</span>
                <span>{habitat.collectedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validasi</span>
                <span>{validationLabels[habitat.habitatValidation]}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Catatan Kartu</p>
                <p>{habitat.cardQuestion}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>);
};
export default HabitatMonitoringDetail;
