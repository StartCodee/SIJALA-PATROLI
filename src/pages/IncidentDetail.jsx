import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  FileWarning,
  MapPin,
  Route,
  Ship,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiClient, formatDateTime, reviewLabelMap } from '@/lib/apiClient';
import { AttachmentList } from '@/components/reports/AttachmentList';
import { mapPatrolReportsToIncidents, parseFindingId } from '@/lib/patrolFindingUtils';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const parsedId = useMemo(() => parseFindingId(id || ''), [id]);

  const [report, setReport] = useState(null);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!parsedId?.reportId) return;

    setLoading(true);
    try {
      const reportData = await apiClient.getReportById(parsedId.reportId);
      const incidents = mapPatrolReportsToIncidents([reportData]);
      const selectedIncident = incidents.find((item) => item.incidentId === id) || null;

      setReport(reportData);
      setIncident(selectedIncident);
    } catch (error) {
      toast({
        title: 'Gagal memuat detail kejadian',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getSeverityBadge = (severity) => {
    if (severity === 'high') return <Badge variant="destructive">Prioritas Tinggi</Badge>;
    if (severity === 'medium') {
      return <Badge className="bg-warning/15 text-warning border-warning/30">Prioritas Sedang</Badge>;
    }
    return <Badge variant="secondary">Prioritas Rendah</Badge>;
  };

  if (!parsedId) {
    return (
      <MainLayout title="Laporan Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">ID kejadian tidak valid.</p>
            <Button className="mt-4" onClick={() => navigate('/incidents')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (loading && !incident) {
    return (
      <MainLayout title="Detail Laporan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">Memuat detail kejadian...</CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!incident || !report) {
    return (
      <MainLayout title="Laporan Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Data kejadian tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/incidents')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detail Laporan Kejadian" subtitle={incident.category}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/incidents')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    incident.severity === 'high'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {incident.severity === 'high' ? (
                    <AlertTriangle className="h-6 w-6" />
                  ) : (
                    <FileWarning className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{incident.title}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={incident.status} />
                    {getSeverityBadge(incident.severity)}
                    <Badge variant="outline">{incident.category}</Badge>
                    <Badge variant="secondary">Patroli: {incident.reportCode}</Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">Deskripsi Kejadian</h3>
                  <p className="text-muted-foreground leading-relaxed">{incident.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Tindakan di Lapangan</h3>
                  <p className="text-muted-foreground leading-relaxed">{incident.actionTaken}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {incident.mapPoint ? (
            <MapCard
              title="Lokasi Kejadian"
              selectedVessel={{
                name: incident.locationName,
                lat: incident.mapPoint.lat,
                lon: incident.mapPoint.lon,
              }}
              markers={[
                {
                  lat: incident.mapPoint.lat,
                  lon: incident.mapPoint.lon,
                  label: incident.locationName,
                  description: incident.category,
                  color: '#ef4444',
                },
              ]}
              showControls={false}
            />
          ) : (
            <Card className="shadow-card">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Koordinat kejadian tidak tersedia.
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Data Kapal Terkait
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Nama Kapal: {incident.vesselName}</p>
              <p>Nahkoda: {incident.captainName}</p>
              <p>Jenis Kapal: {incident.shipKind}</p>
              <p>Kategori Kapal: {incident.shipCategory}</p>
              <p>Asal Kapal: {incident.shipOrigin}</p>
              <p>Daya Mesin: {incident.enginePower}</p>
              <p>Jumlah Mesin: {incident.engineCount}</p>
              <p>Jumlah ABK: {incident.crewCount}</p>
              <p>Jumlah Penumpang: {incident.passengerCount}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Lampiran Bukti Kejadian</CardTitle>
            </CardHeader>
            <CardContent>
              <AttachmentList items={incident.photoUrls} emptyLabel="Tidak ada lampiran kejadian." />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Waktu Kejadian</p>
                  <p className="font-medium text-sm">{formatDateTime(incident.time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Lokasi</p>
                  <p className="font-medium text-sm">{incident.locationName}</p>
                  {incident.mapPoint && (
                    <p className="text-xs font-mono text-muted-foreground">
                      {incident.mapPoint.lat.toFixed(6)}, {incident.mapPoint.lon.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Patroli Terkait
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Kode</span>
                <span className="font-mono">{incident.reportCode}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Area</span>
                <span>{incident.areaName}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Pos</span>
                <span>{incident.postName}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Status Verifikasi</span>
                <span>{reviewLabelMap[incident.reportStatus]}</span>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Catatan Verifikator</p>
                <p>{report.reviewNote || '-'}</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/patrols/${incident.reportId}`)}>
                Buka Detail Patroli
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default IncidentDetail;
