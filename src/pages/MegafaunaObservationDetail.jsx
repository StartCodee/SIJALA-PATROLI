import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Fish, MapPin } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  apiClient,
  formatDateTime,
  reviewClassMap,
  reviewLabelMap,
} from '@/lib/apiClient';
import { AttachmentList } from '@/components/reports/AttachmentList';

const MegafaunaObservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await apiClient.getReportById(id);
      setReport(data);
    } catch (error) {
      toast({
        title: 'Gagal memuat detail laporan',
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

  const payload = report?.payload || {};
  const fixed = payload.fixedResource || {};
  const nonFixed = payload.nonFixedResource || {};
  const megafauna = payload.megafauna || {};

  const mapMarkers = useMemo(() => {
    const markers = [];

    if (Number.isFinite(fixed?.location?.lat) && Number.isFinite(fixed?.location?.lon)) {
      markers.push({
        lat: Number(fixed.location.lat),
        lon: Number(fixed.location.lon),
        label: 'Sumber Daya Tetap',
        description: fixed.type || '-',
        color: '#22c55e',
      });
    }

    if (Number.isFinite(megafauna?.location?.lat) && Number.isFinite(megafauna?.location?.lon)) {
      markers.push({
        lat: Number(megafauna.location.lat),
        lon: Number(megafauna.location.lon),
        label: 'Megafauna',
        description: megafauna.species || '-',
        color: '#3b82f6',
      });
    }

    return markers;
  }, [fixed, megafauna]);

  const selectedPoint = mapMarkers[0] || null;

  if (loading && !report) {
    return (
      <MainLayout title="Detail Monitoring Pemanfaatan (RUM)">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">Memuat detail laporan...</CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!report || report.type !== 'RESOURCE_USE_MONITORING') {
    return (
      <MainLayout title="Data Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Laporan Monitoring Pemanfaatan (RUM) tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/monitoring-megafauna')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detail Monitoring Pemanfaatan (RUM)" subtitle={report.reportCode}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate('/monitoring-megafauna')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Badge className={`border ${reviewClassMap[report.status]}`}>{reviewLabelMap[report.status]}</Badge>
        <Badge variant="outline">Area: {report.areaName || '-'}</Badge>
        <Badge variant="outline">Pos: {report.postName || '-'}</Badge>
        <Badge variant="outline">Dikirim: {formatDateTime(report.submittedAt)}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Fish className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{megafauna.species || 'Megafauna'}</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Jumlah: {megafauna.count ?? 0} | Lokasi: {megafauna.placeName || '-'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Submitted By: {report.submittedBy || '-'}</Badge>
                    <Badge variant="secondary">Status: {reviewLabelMap[report.status]}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <MapCard
            title="Lokasi Laporan RUM"
            selectedVessel={
              selectedPoint
                ? {
                    name: selectedPoint.label,
                    lat: selectedPoint.lat,
                    lon: selectedPoint.lon,
                  }
                : null
            }
            markers={mapMarkers}
            showControls={false}
          />

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Sumber Daya Tetap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>GPS: {fixed.gpsNumber || '-'}</p>
              <p>Jenis: {fixed.type || '-'}</p>
              <p>Fungsi/Kegunaan: {fixed.functionUse || '-'}</p>
              <p>Status Digunakan: {fixed.inUse ? 'Ya' : 'Tidak'}</p>
              <p>Jumlah Unit: {fixed.unitCount ?? 0}</p>
              <p>
                Koordinat: {Number.isFinite(fixed?.location?.lat) && Number.isFinite(fixed?.location?.lon)
                  ? `${Number(fixed.location.lat).toFixed(6)}, ${Number(fixed.location.lon).toFixed(6)}`
                  : '-'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Sumber Daya Tidak Tetap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>GPS: {nonFixed.gpsNumber || '-'}</p>
              <p>Pemanfaat: {nonFixed.userType || '-'}</p>
              <p>Aktivitas: {nonFixed.activity || '-'}</p>
              <p>Wawancara: {nonFixed.interviewed ? 'Ya' : 'Tidak'}</p>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Foto Wawancara</p>
                <AttachmentList items={nonFixed.photoUrls || []} emptyLabel="Tidak ada foto wawancara." />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Pemantauan Megafauna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>GPS: {megafauna.gpsNumber || '-'}</p>
              <p>Nama Tempat: {megafauna.placeName || '-'}</p>
              <p>Spesies: {megafauna.species || '-'}</p>
              <p>Jumlah: {megafauna.count ?? 0}</p>
              <p>
                Koordinat: {Number.isFinite(megafauna?.location?.lat) && Number.isFinite(megafauna?.location?.lon)
                  ? `${Number(megafauna.location.lat).toFixed(6)}, ${Number(megafauna.location.lon).toFixed(6)}`
                  : '-'}
              </p>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Foto Megafauna</p>
                <AttachmentList items={megafauna.photoUrls || []} emptyLabel="Tidak ada foto megafauna." />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Payload Form Lengkap (Raw)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[320px] overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Informasi Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <span>{reviewLabelMap[report.status]}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Verifier</span>
                <span>{report.reviewerName || '-'}</span>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Catatan</p>
                <p>{report.reviewNote || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MegafaunaObservationDetail;
