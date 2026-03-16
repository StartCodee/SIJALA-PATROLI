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
import { normalizeHabitatReport } from '@/lib/reportPresentation';
import { SignaturePreview } from '@/components/reports/SignaturePreview';
import { AttachmentList } from '@/components/reports/AttachmentList';

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

  const detail = useMemo(() => normalizeHabitatReport(report), [report]);
  const { visitorData, habitatEntries, teamSnapshot, markers, summary } = detail;
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
        <Badge variant="outline">Area: {detail.areaName}</Badge>
        <Badge variant="outline">Pos: {detail.postName}</Badge>
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
                    Operator: {visitorData.operatorName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Entri Habitat: {habitatEntries.length}</Badge>
                    <Badge variant="secondary">Wisatawan: {visitorData.touristCount}</Badge>
                    <Badge variant="outline">Temuan Manta: {visitorData.mantaSightingsCount}</Badge>
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
                Lokasi monitoring belum memiliki titik peta yang dikenali.
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary" />
                Entri Habitat ({habitatEntries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {habitatEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada detail habitat pada laporan ini.</p>
              ) : (
                habitatEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Entri #{entry.order}</Badge>
                      <Badge variant="outline">{entry.location}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DetailField label="Lokasi" value={entry.location} />
                      <DetailField label="Tanggal" value={entry.date} />
                      <DetailField label="Waktu" value={entry.time} />
                      <DetailField
                        label="Jumlah Personel"
                        value={entry.personnel.length > 0 ? `${entry.personnel.length} orang` : '-'}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Personel Lapangan</p>
                      {entry.personnel.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {entry.personnel.map((person) => (
                            <div key={`${entry.id}-person-${person.slot}`} className="rounded-lg border border-border p-3 text-sm">
                              <p>
                                <span className="text-muted-foreground">Slot:</span> {person.label}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Nama:</span> {person.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Tidak ada personel yang tercatat.</p>
                      )}
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailField label="Nama Operator" value={visitorData.operatorName} />
              <DetailField label="Jumlah Wisatawan" value={visitorData.touristCount} />
              <DetailField label="Jumlah Guide" value={visitorData.guideCount} />
              <DetailField label="Total Orang" value={visitorData.totalPeople} />
              <DetailField label="Temuan Manta" value={visitorData.mantaSightingsCount} />
              <DetailField label="Ada Pelanggaran" value={visitorData.hasViolation ? 'Ya' : 'Tidak'} />
              <DetailField
                label="Jenis Pelanggaran"
                value={visitorData.violationTypes.length > 0 ? visitorData.violationTypes.join(', ') : '-'}
                fullWidth
              />
              <DetailField label="Kerusakan" value={visitorData.damageDescription} fullWidth />
              <DetailField label="Tindakan" value={visitorData.actionTaken} fullWidth />
              <DetailField label="Solusi" value={visitorData.solution} fullWidth />
              <div className="md:col-span-2 rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Dokumentasi / Foto TJL</p>
                <div className="mt-2">
                  <AttachmentList items={visitorData.tjlPhotoUrls} emptyLabel="Tidak ada foto TJL." />
                </div>
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
            <CardContent className="space-y-4">
              {(teamSnapshot.roles || []).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamSnapshot.roles.map((member, index) => (
                    <TeamMemberCard key={`team-role-${index}`} member={member} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada snapshot tim inti pada laporan ini.</p>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Anggota lainnya</p>
                {(teamSnapshot.others || []).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teamSnapshot.others.map((member, index) => (
                      <TeamMemberCard key={`team-other-${index}`} member={member} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada anggota tambahan.</p>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Swafoto Tim</p>
                <AttachmentList items={teamSnapshot.photoUrls} emptyLabel="Tidak ada swafoto tim." />
              </div>
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
                Entri Habitat: <span className="text-foreground">{summary.habitatCount ?? habitatEntries.length}</span>
              </p>
              <p>
                Wisatawan: <span className="text-foreground">{summary.totalPeople ?? visitorData.totalPeople}</span>
              </p>
              <p>
                Guide: <span className="text-foreground">{summary.guideCount ?? visitorData.guideCount}</span>
              </p>
              <p>
                Temuan Manta: <span className="text-foreground">{summary.mantaSightingsCount ?? visitorData.mantaSightingsCount}</span>
              </p>
              <p>
                Pelanggaran: <span className="text-foreground">{visitorData.hasViolation ? 'Ada' : 'Tidak ada'}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

const DetailField = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? 'md:col-span-2 rounded-lg border border-border bg-card px-3 py-2' : 'rounded-lg border border-border bg-card px-3 py-2'}>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-medium text-foreground whitespace-pre-wrap">{`${value ?? '-'}` || '-'}</p>
  </div>
);

const TeamMemberCard = ({ member }) => (
  <div className="rounded-lg border border-border p-3 text-sm">
    <p>
      <span className="text-muted-foreground">Peran:</span> {member.role || '-'}
    </p>
    <p>
      <span className="text-muted-foreground">Nama:</span> {member.name || '-'}
    </p>
    <div className="mt-2">
      <p className="text-xs text-muted-foreground mb-1">Tanda tangan</p>
      <SignaturePreview signature={member.signature} />
    </div>
  </div>
);

export default HabitatMonitoringDetail;
