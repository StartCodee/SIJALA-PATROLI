import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Fish, MapPin, User } from 'lucide-react';
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
import {
  formatCoordinate,
  normalizeResourceUseReport,
} from '@/lib/reportPresentation';
import { AttachmentList } from '@/components/reports/AttachmentList';
import { SignaturePreview } from '@/components/reports/SignaturePreview';

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

  const detail = useMemo(() => normalizeResourceUseReport(report), [report]);
  const { fixedEntries, nonFixedEntries, megafaunaEntries, teamSnapshot, markers, summary } = detail;
  const selectedPoint = markers[0] || null;

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
                  <Fish className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Monitoring Pemanfaatan</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    {report.submittedBy || '-'} · {detail.postName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Tetap: {fixedEntries.length}</Badge>
                    <Badge variant="outline">Tidak Tetap: {nonFixedEntries.length}</Badge>
                    <Badge variant="secondary">Megafauna: {megafaunaEntries.length}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedPoint ? (
            <MapCard
              title="Lokasi Laporan RUM"
              selectedVessel={{
                name: selectedPoint.label,
                lat: selectedPoint.lat,
                lon: selectedPoint.lon,
              }}
              markers={markers}
              showControls={false}
              showSelectedMarker={false}
            >
              {markers.length > 0 && (
                <div className="absolute top-4 left-4 z-[1000] rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-card backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span>🪸</span>
                      <span>Tetap</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <span>🎣</span>
                      <span>Tidak Tetap</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <span>🐋</span>
                      <span>Megafauna</span>
                    </span>
                  </div>
                </div>
              )}
            </MapCard>
          ) : (
            <Card className="shadow-card">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Belum ada titik koordinat yang bisa ditampilkan pada peta.
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Sumber Daya Tetap ({fixedEntries.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fixedEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada entri sumber daya tetap.</p>
              ) : (
                fixedEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Entri #{entry.order}</Badge>
                      <Badge variant={entry.inUse ? 'outline' : 'destructive'}>
                        {entry.inUse ? 'Sedang Digunakan' : 'Tidak Digunakan'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DetailField label="GPS" value={entry.gpsNumber} />
                      <DetailField label="Jenis" value={formatWithOther(entry.type, entry.typeOther)} />
                      <DetailField label="Nama Obyek" value={entry.objectName} />
                      <DetailField label="Jumlah Unit" value={entry.unitCount} />
                      <DetailField label="Fungsi/Kegunaan" value={entry.functionUse} fullWidth />
                      <DetailField label="Koordinat" value={formatCoordinate(entry.location)} fullWidth />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Foto Sumber Daya Tetap</p>
                      <AttachmentList items={entry.photoUrls} emptyLabel="Tidak ada foto sumber daya tetap." />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Sumber Daya Tidak Tetap ({nonFixedEntries.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nonFixedEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada entri sumber daya tidak tetap.</p>
              ) : (
                nonFixedEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Entri #{entry.order}</Badge>
                      <Badge variant="outline">{entry.userType}</Badge>
                      <Badge variant={entry.hasCatch ? 'secondary' : 'outline'}>
                        {entry.hasCatch ? 'Ada Hasil Tangkapan' : 'Tanpa Tangkapan'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DetailField label="GPS" value={entry.gpsNumber} />
                      <DetailField label="Pemanfaat" value={entry.userType} />
                      <DetailField label="Aktivitas" value={formatWithOther(entry.activity, entry.activityOther)} />
                      <DetailField label="Asal" value={entry.origin} />
                      <DetailField label="Wawancara" value={entry.interviewed ? 'Ya' : 'Tidak'} />
                      <DetailField label="Koordinat" value={formatCoordinate(entry.location)} />
                      <DetailField label="Catatan Wawancara" value={entry.interviewNote} fullWidth />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Foto Wawancara</p>
                        <AttachmentList
                          items={entry.interviewPhotoUrls}
                          emptyLabel="Tidak ada foto wawancara."
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Foto Umum</p>
                        <AttachmentList items={entry.photoUrls} emptyLabel="Tidak ada foto umum." />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">Hasil Tangkapan</p>
                      {entry.catches.length > 0 ? (
                        entry.catches.map((catchItem) => (
                          <div key={`${entry.id}-${catchItem.id}`} className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <DetailField label="Hasil Tangkapan" value={catchItem.catchName} />
                              <DetailField label="Jumlah (Ekor)" value={catchItem.count} />
                              <DetailField label="Panjang (Cm)" value={catchItem.lengthCm} />
                              <DetailField label="Berat Basah (Kg)" value={catchItem.wetWeightKg} />
                              <DetailField label="Berat Kering (Kg)" value={catchItem.dryWeightKg} />
                              <DetailField label="Lama Kerja (Jam)" value={catchItem.workDurationHours} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Foto Hasil Tangkapan</p>
                              <AttachmentList
                                items={catchItem.photoUrls}
                                emptyLabel="Tidak ada foto hasil tangkapan."
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Tidak ada detail hasil tangkapan.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Pemantauan Megafauna ({megafaunaEntries.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {megafaunaEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada entri megafauna.</p>
              ) : (
                megafaunaEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Entri #{entry.order}</Badge>
                      <Badge variant="outline">{entry.species}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DetailField label="GPS" value={entry.gpsNumber} />
                      <DetailField label="Nama Tempat" value={entry.placeName} />
                      <DetailField label="Spesies" value={formatWithOther(entry.species, entry.speciesOther || entry.speciesName)} />
                      <DetailField label="Jumlah" value={entry.count} />
                      <DetailField label="Koordinat" value={formatCoordinate(entry.location)} fullWidth />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Foto Megafauna</p>
                      <AttachmentList items={entry.photoUrls} emptyLabel="Tidak ada foto megafauna." />
                    </div>
                  </div>
                ))
              )}
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

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Ringkasan RUM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Sumber Daya Tetap: <span className="text-foreground">{summary.fixedEntryCount ?? fixedEntries.length}</span>
              </p>
              <p>
                Sumber Daya Tidak Tetap: <span className="text-foreground">{summary.nonFixedEntryCount ?? nonFixedEntries.length}</span>
              </p>
              <p>
                Data Tangkapan: <span className="text-foreground">{summary.nonFixedCatchCount ?? 0}</span>
              </p>
              <p>
                Megafauna: <span className="text-foreground">{summary.megafaunaEntryCount ?? megafaunaEntries.length}</span>
              </p>
              <p>
                Spesies Unik: <span className="text-foreground">{summary.megafaunaUniqueSpeciesCount ?? 0}</span>
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

export default MegafaunaObservationDetail;
