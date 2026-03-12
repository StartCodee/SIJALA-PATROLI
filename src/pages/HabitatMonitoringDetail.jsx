import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, TreePine, User } from 'lucide-react';
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
import { SignaturePreview } from '@/components/reports/SignaturePreview';
import { AttachmentList } from '@/components/reports/AttachmentList';

const DEFAULT_LOCATION_POINT = { lat: -0.5508, lon: 130.5737 };

const locationMap = {
  'manta sandy': { lat: -0.5639, lon: 130.6636 },
  'manta ridge': { lat: -0.5704, lon: 130.6542 },
  'pos dayan/batanta': { lat: -0.4436, lon: 130.5656 },
  'pos andau/fam': { lat: -0.2679, lon: 130.0627 },
  membarayup: { lat: -0.7239, lon: 130.5962 },
  'irwor inbekya': { lat: -0.6118, lon: 130.7055 },
  // Backward compatibility with older datasets
  'arborek jetty': { lat: -0.5448, lon: 130.5316 },
  'blue magic': { lat: -0.5017, lon: 130.6614 },
  'cape kri': { lat: -0.5632, lon: 130.6008 },
};

function normalizeLocationKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeTeamOthers(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const isObject = item && typeof item === 'object' && !Array.isArray(item);
    const name = `${isObject ? item.name : item || ''}`.trim();
    if (!name) continue;
    const role = `${isObject ? item.role || 'Lainnya' : 'Lainnya'}`.trim() || 'Lainnya';
    const key = `${role.toLowerCase()}|${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      name,
      role,
      signature: isObject ? item.signature : null,
    });
  }
  return out;
}

const HabitatMonitoringDetail = () => {
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
        title: 'Gagal memuat detail monitoring',
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

  const payload = report?.payload && typeof report.payload === 'object' ? report.payload : {};
  const habitatEntries = Array.isArray(payload.habitatEntries) ? payload.habitatEntries : [];
  const visitorData =
    payload.visitorData && typeof payload.visitorData === 'object' ? payload.visitorData : {};
  const teamSnapshot = payload.teamSnapshot && typeof payload.teamSnapshot === 'object' ? payload.teamSnapshot : {};
  const teamRoles = Array.isArray(teamSnapshot.roles) ? teamSnapshot.roles : [];
  const teamOthers = normalizeTeamOthers(teamSnapshot.others);
  const teamPhotos = Array.isArray(teamSnapshot.photoUrls) ? teamSnapshot.photoUrls : [];
  const habitatPhotos = Array.isArray(visitorData.tjlPhotoUrls) ? visitorData.tjlPhotoUrls : [];

  const markers = useMemo(() => {
    const entries = Array.isArray(report?.payload?.habitatEntries)
      ? report.payload.habitatEntries
      : [];

    return entries
      .map((entry) => {
        const point = locationMap[normalizeLocationKey(entry.location)] || DEFAULT_LOCATION_POINT;
        return {
          lat: point.lat,
          lon: point.lon,
          label: entry.location || 'Lokasi monitoring',
          description: `${entry.officer1 || '-'} / ${entry.time || '-'}`,
          color: '#2563eb',
        };
      })
      .filter(Boolean);
  }, [report]);

  const selectedPoint = markers[0] || null;

  if (loading && !report) {
    return (
      <MainLayout title="Detail Monitoring Habitat">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">Memuat detail laporan...</CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!report || report.type !== 'OTHER_MONITORING') {
    return (
      <MainLayout title="Data Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Laporan monitoring habitat tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/monitoring-habitat')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detail Monitoring Habitat" subtitle={report.reportCode}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate('/monitoring-habitat')}
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
                  <TreePine className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Monitoring Habitat</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Operator: {visitorData.operatorName || '-'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Jumlah Entri Habitat: {habitatEntries.length}</Badge>
                    <Badge variant="secondary">Temuan Manta: {visitorData.mantaSightingsCount ?? 0}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedPoint ? (
            <MapCard
              title="Lokasi Monitoring"
              selectedVessel={{
                name: selectedPoint.label,
                lat: selectedPoint.lat,
                lon: selectedPoint.lon,
              }}
              markers={markers}
              showControls={false}
            />
          ) : (
            <Card className="shadow-card">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Lokasi monitoring tidak memiliki koordinat peta.
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary" />
                Informasi Habitat ({habitatEntries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {habitatEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada detail habitat pada laporan ini.</p>
              ) : (
                habitatEntries.map((entry, index) => (
                  <div key={`${entry.location || 'entry'}-${index}`} className="rounded-lg border border-border p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p>Lokasi: {entry.location || '-'}</p>
                      <p>Tanggal: {entry.date || '-'}</p>
                      <p>Waktu: {entry.time || '-'}</p>
                      <p>Petugas 1: {entry.officer1 || '-'}</p>
                      <p>Petugas 2: {entry.officer2 || '-'}</p>
                      <p>Petugas 3: {entry.officer3 || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Tanda tangan petugas</p>
                      <SignaturePreview signature={entry.signature} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Data Monitoring dan Pelanggaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Nama Operator: {visitorData.operatorName || '-'}</p>
              <p>Jumlah Wisatawan: {visitorData.touristCount ?? 0}</p>
              <p>Jumlah Guide: {visitorData.guideCount ?? 0}</p>
              <p>Total Orang: {visitorData.totalPeople ?? 0}</p>
              <p>Jumlah Temuan Manta: {visitorData.mantaSightingsCount ?? 0}</p>
              <p>Ada Pelanggaran: {visitorData.hasViolation ? 'Ya' : 'Tidak'}</p>
              <p>
                Jenis Pelanggaran:{' '}
                {Array.isArray(visitorData.violationTypes) && visitorData.violationTypes.length > 0
                  ? visitorData.violationTypes.join(', ')
                  : '-'}
              </p>
              <p>Kerusakan: {visitorData.damageDescription || '-'}</p>
              <p>Tindakan: {visitorData.actionTaken || '-'}</p>
              <p>Solusi: {visitorData.solution || '-'}</p>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Dokumentasi / Foto TJL</p>
                <AttachmentList items={habitatPhotos} emptyLabel="Tidak ada foto TJL." />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Snapshot Tim Lapangan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada snapshot tim pada laporan ini.</p>
              ) : (
                <div className="space-y-2">
                  {teamRoles.map((entry, index) => (
                    <div key={`team-role-${index}`} className="rounded-lg border border-border p-3 text-sm">
                      <p>
                        <span className="text-muted-foreground">Peran:</span> {entry.role || '-'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Nama:</span> {entry.name || '-'}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Tanda tangan</p>
                        <SignaturePreview signature={entry.signature} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-1">Anggota lainnya</p>
                {teamOthers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">-</p>
                ) : (
                  teamOthers.map((entry, index) => (
                    <div key={`team-other-${index}`} className="rounded-lg border border-border p-3 text-sm">
                      <p>
                        <span className="text-muted-foreground">Peran:</span> {entry.role || 'Lainnya'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Nama:</span> {entry.name || '-'}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Tanda tangan</p>
                        <SignaturePreview signature={entry.signature} />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Swafoto Tim</p>
                <AttachmentList items={teamPhotos} emptyLabel="Tidak ada swafoto tim." />
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
              <CardTitle className="text-base font-semibold">Informasi Review</CardTitle>
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

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Ringkasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Habitat Entry: <span className="text-foreground">{habitatEntries.length}</span>
              </p>
              <p>
                Wisatawan: <span className="text-foreground">{visitorData.touristCount ?? 0}</span>
              </p>
              <p>
                Guide: <span className="text-foreground">{visitorData.guideCount ?? 0}</span>
              </p>
              <p>
                Total Orang: <span className="text-foreground">{visitorData.totalPeople ?? 0}</span>
              </p>
              <p>
                Temuan Manta: <span className="text-foreground">{visitorData.mantaSightingsCount ?? 0}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default HabitatMonitoringDetail;
