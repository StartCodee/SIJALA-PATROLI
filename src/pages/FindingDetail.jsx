import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, FileWarning, MapPin, Ship } from 'lucide-react';
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
import { mapPatrolReportFindings, parseFindingId } from '@/lib/patrolFindingUtils';

const FindingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const parsedId = useMemo(() => parseFindingId(id || ''), [id]);

  const [report, setReport] = useState(null);
  const [finding, setFinding] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!parsedId?.reportId) return;

    setLoading(true);
    try {
      const reportData = await apiClient.getReportById(parsedId.reportId);
      const findings = mapPatrolReportFindings(reportData);
      const selectedFinding = findings.find((item) => item.id === id) || null;

      setReport(reportData);
      setFinding(selectedFinding);
    } catch (error) {
      toast({
        title: 'Gagal memuat detail temuan',
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

  if (!parsedId) {
    return (
      <MainLayout title="Temuan Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">ID temuan tidak valid.</p>
            <Button className="mt-4" onClick={() => navigate('/findings')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (loading && !finding) {
    return (
      <MainLayout title="Detail Temuan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">Memuat detail temuan...</CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!finding || !report) {
    return (
      <MainLayout title="Temuan Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Data temuan tidak ditemukan pada laporan patroli.</p>
            <Button className="mt-4" onClick={() => navigate('/findings')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  const marker = finding.mapPoint
    ? [
        {
          lat: finding.mapPoint.lat,
          lon: finding.mapPoint.lon,
          label: finding.locationName,
          description: finding.hasViolation
            ? `Pelanggaran: ${finding.violationTypes.join(', ') || '-'}`
            : 'Tidak ada pelanggaran',
          color: finding.hasViolation ? '#ef4444' : '#22c55e',
        },
      ]
    : [];

  return (
    <MainLayout title="Detail Temuan" subtitle={finding.locationName}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/findings')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Badge className={`border ${reviewClassMap[finding.reportStatus]}`}>
          {reviewLabelMap[finding.reportStatus]}
        </Badge>
        <Badge variant="outline">Laporan: {finding.reportCode}</Badge>
        <Badge variant="outline">Waktu: {formatDateTime(finding.submittedAt)}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{finding.locationName}</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Area: {finding.areaName} | Pos: {finding.postName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">GPS: {finding.gpsNumber}</Badge>
                    <Badge variant="secondary">Zona: {finding.locationZone !== '-' ? finding.locationZone : finding.zoneCoordinate}</Badge>
                    <Badge className={finding.hasViolation ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}>
                      {finding.hasViolation ? 'Ada Pelanggaran' : 'Tidak Ada Pelanggaran'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {finding.mapPoint ? (
            <MapCard
              title="Lokasi Temuan"
              selectedVessel={{
                name: finding.locationName,
                lat: finding.mapPoint.lat,
                lon: finding.mapPoint.lon,
              }}
              markers={marker}
              showControls={false}
            />
          ) : (
            <Card className="shadow-card">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Koordinat lokasi temuan belum tersedia.
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Kapal dan Awak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Nama Kapal: {finding.vesselName}</p>
              <p>Nahkoda: {finding.captainName}</p>
              <p>Jenis Kapal: {formatWithOther(finding.shipKind, finding.shipKindOther)}</p>
              <p>Kategori Kapal: {formatWithOther(finding.shipCategory, finding.shipCategoryOther)}</p>
              <p>Asal Kapal: {finding.shipOrigin}</p>
              <p>Tipe Mesin: {finding.engineType}</p>
              <p>Daya Mesin: {finding.enginePower}</p>
              <p>Jumlah Mesin: {finding.engineCount}</p>
              <p>Jumlah ABK: {finding.crewCount}</p>
              <p>Jumlah Penumpang: {finding.passengerCount}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-primary" />
                Detail Pelanggaran dan Tindakan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Jenis Pelanggaran</p>
                <p>{finding.violationTypes.length > 0 ? finding.violationTypes.join(', ') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Detail Pelanggaran</p>
                <p>{finding.violationDetail}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Alat Tangkap</p>
                <p>{formatWithOther(finding.fishingTools.length > 0 ? finding.fishingTools.join(', ') : '-', finding.fishingToolsOther)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tindakan</p>
                <p>{finding.actionTaken}</p>
              </div>
              {finding.notes ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Catatan Lapangan</p>
                  <p>{finding.notes}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Lampiran Foto Temuan</CardTitle>
            </CardHeader>
            <CardContent>
              <AttachmentList items={finding.photoUrls} emptyLabel="Tidak ada foto temuan." />
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Informasi Laporan Patroli
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Kode Laporan</span>
                <span className="font-mono">{finding.reportCode}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Area</span>
                <span>{finding.areaName}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Pos</span>
                <span>{finding.postName}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Pengirim</span>
                <span>{finding.submittedBy}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Dikirim</span>
                <span>{formatDateTime(finding.submittedAt)}</span>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Catatan Verifikator</p>
                <p>{finding.reviewNote}</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/patrols/${finding.reportId}`)}>
                Buka Detail Patroli
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default FindingDetail;

const formatWithOther = (value, otherValue) => {
  const normalizedValue = `${value || ''}`.trim();
  const normalizedOther = `${otherValue || ''}`.trim();
  if (normalizedOther) {
    return normalizedValue && normalizedValue !== '-'
      ? `${normalizedValue} (${normalizedOther})`
      : normalizedOther;
  }
  return normalizedValue || '-';
};
