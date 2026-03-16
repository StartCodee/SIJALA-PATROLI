import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, FileWarning, MapPin, Route, Ship, User } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  apiClient,
  formatDateTime,
  reviewClassMap,
  reviewLabelMap,
} from '@/lib/apiClient';
import {
  formatCoordinate,
  normalizePatrolReport,
} from '@/lib/reportPresentation';
import { AttachmentList } from '@/components/reports/AttachmentList';
import { SignaturePreview } from '@/components/reports/SignaturePreview';

const PatrolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [selectedTeamRangeIndex, setSelectedTeamRangeIndex] = useState(0);

  const loadReport = async () => {
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
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const detail = useMemo(() => normalizePatrolReport(report), [report]);
  const { summary, patrolInfo, fuelAndRoute, closing, findings, routePoints, teamHistoryRanges } = detail;

  const routeMarkers = useMemo(() => {
    if (routePoints.length === 0) return [];

    const items = [
      {
        lat: routePoints[0].lat,
        lon: routePoints[0].lon,
        kind: 'start',
        label: 'Mulai Patroli',
        description: 'Titik keberangkatan patroli',
      },
    ];

    if (routePoints.length > 1) {
      const lastPoint = routePoints[routePoints.length - 1];
      items.push({
        lat: lastPoint.lat,
        lon: lastPoint.lon,
        kind: 'end',
        label: 'Selesai Patroli',
        description: 'Titik akhir patroli',
      });
    }

    return items;
  }, [routePoints]);

  const findingMarkers = useMemo(
    () =>
      findings
        .filter((finding) => finding.mapPoint)
        .map((finding) => ({
          lat: finding.mapPoint.lat,
          lon: finding.mapPoint.lon,
          kind: 'finding',
          label: finding.locationName,
          description: finding.hasViolation
            ? `Pelanggaran: ${finding.violationTypes.join(', ') || '-'}`
            : 'Tidak ada pelanggaran',
          color: finding.hasViolation ? '#ef4444' : '#22c55e',
        })),
    [findings],
  );

  const selectedPoint = routePoints[0] ?? findings.find((finding) => finding.mapPoint)?.mapPoint ?? null;
  const activeTeamRange = teamHistoryRanges[selectedTeamRangeIndex] || null;

  useEffect(() => {
    setSelectedTeamRangeIndex((previousIndex) => {
      if (teamHistoryRanges.length === 0) return 0;
      return previousIndex < teamHistoryRanges.length ? previousIndex : 0;
    });
  }, [teamHistoryRanges.length]);

  const submitReview = async (status) => {
    if (!report) return;

    const isReject = status === 'rejected';
    const note = isReject
      ? window.prompt('Alasan pengembalian laporan:', report.reviewNote || '') || ''
      : 'Data patroli sesuai.';

    if (isReject && !note.trim()) {
      toast({
        title: 'Catatan wajib diisi',
        description: 'Mohon isi alasan saat mengembalikan laporan.',
        variant: 'destructive',
      });
      return;
    }

    setReviewing(true);
    try {
      const updated = await apiClient.reviewReport(report.id, {
        status,
        reviewerName: 'Verifier Dashboard',
        reviewNote: note,
      });

      setReport(updated);
      toast({
        title: status === 'validated' ? 'Laporan diterima' : 'Laporan dikembalikan',
        description: updated.reportCode,
      });
    } catch (error) {
      toast({
        title: 'Gagal menyimpan review',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setReviewing(false);
    }
  };

  if (loading && !report) {
    return (
      <MainLayout title="Detail Patroli">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">Memuat detail laporan...</CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!report) {
    return (
      <MainLayout title="Patroli Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Data laporan patroli tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/patrols')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={report.reportCode} subtitle={detail.areaName || 'Laporan Patroli'}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/patrols')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Badge className={`border ${reviewClassMap[report.status]}`}>{reviewLabelMap[report.status]}</Badge>
        <Badge variant="outline">Dikirim: {formatDateTime(report.submittedAt)}</Badge>
        <Badge variant="outline">Pengirim: {report.submittedBy || '-'}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Route className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Patroli Jaga Laut</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    {detail.postName} · {patrolInfo.speedboatName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Temuan: {summary.findingCount ?? findings.length}</Badge>
                    <Badge variant="secondary">Pelanggaran: {summary.violationCount ?? 0}</Badge>
                    <Badge variant="outline">Titik Rute: {summary.routePointCount ?? routePoints.length}</Badge>
                    <Badge variant="outline">Perubahan Tim: {summary.teamChangeCount ?? 0}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <MapCard
            title="Rute dan Titik Temuan"
            selectedVessel={
              selectedPoint
                ? {
                    name: 'Posisi Laporan',
                    lat: selectedPoint.lat,
                    lon: selectedPoint.lon,
                  }
                : null
            }
            paths={routePoints.length > 1 ? [{ points: routePoints, color: '#2563eb', weight: 4 }] : []}
            markers={[...routeMarkers, ...findingMarkers]}
            showSelectedMarker={false}
          />

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Informasi Patroli
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailField label="Area" value={detail.areaName} />
              <DetailField label="Kode Area" value={detail.areaCode} />
              <DetailField label="Pos Jaga" value={detail.postName} />
              <DetailField label="Speedboat" value={formatWithOther(patrolInfo.speedboatName, patrolInfo.speedboatOther)} />
              <DetailField label="Patroli Ke" value={patrolInfo.patrolSequence ?? '-'} />
              <DetailField
                label="Waktu Berangkat"
                value={[patrolInfo.departureDate, patrolInfo.departureTime].filter(Boolean).join(' ') || '-'}
              />
              <div className="md:col-span-2 rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Peralatan</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {patrolInfo.equipment.length > 0 ? (
                    patrolInfo.equipment.map((item, index) => (
                      <Badge key={`equipment-${index}`} variant="secondary">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Belum ada peralatan.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Snapshot Tim Patroli ({teamHistoryRanges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamHistoryRanges.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada snapshot tim pada laporan ini.</p>
              ) : (
                <div className="space-y-4">
                  {teamHistoryRanges.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {teamHistoryRanges.map((range, index) => {
                        const active = index === selectedTeamRangeIndex;
                        return (
                          <button
                            key={`team-range-${index}`}
                            type="button"
                            onClick={() => setSelectedTeamRangeIndex(index)}
                            className={[
                              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                              active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground hover:text-foreground',
                            ].join(' ')}
                          >
                            {formatTeamPeriod(range.startDate, range.endDate)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {activeTeamRange ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          Periode: {formatTeamPeriod(activeTeamRange.startDate, activeTeamRange.endDate)}
                        </Badge>
                        <Badge className={teamSourceClassName(activeTeamRange.source)}>
                          {labelTeamSource(activeTeamRange.source)}
                        </Badge>
                      </div>

                      {(activeTeamRange.roles || []).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeTeamRange.roles.map((member, index) => (
                            <TeamMemberCard key={`team-role-${index}`} member={member} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Belum ada anggota tim inti pada periode ini.</p>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Anggota lainnya</p>
                        {(activeTeamRange.others || []).length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeTeamRange.others.map((member, index) => (
                              <TeamMemberCard key={`team-other-${index}`} member={member} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Tidak ada anggota tambahan.</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Swafoto Tim</p>
                        <AttachmentList
                          items={activeTeamRange.photoUrls || []}
                          emptyLabel="Tidak ada swafoto tim."
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                BBM dan Rute
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailField label="BBM Awal" value={`${fuelAndRoute.fuelStartLiters} Liter`} />
                <DetailField label="Lokasi Menginap" value={fuelAndRoute.overnightLocation} />
                <DetailField label="Catatan BBM" value={fuelAndRoute.fuelNote} fullWidth />
                <DetailField label="Rencana Rute" value={fuelAndRoute.routePlan} fullWidth />
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Daftar Titik Rute</p>
                {routePoints.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Tidak ada titik rute.</p>
                ) : (
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Latitude</TableHead>
                          <TableHead>Longitude</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {routePoints.map((point, index) => (
                          <TableRow key={`route-point-${index}`}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{point.lat.toFixed(6)}</TableCell>
                            <TableCell>{point.lon.toFixed(6)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-primary" />
                Temuan Lapangan ({findings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {findings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada temuan pada laporan ini.</p>
              ) : (
                <div className="space-y-4">
                  {findings.map((finding) => (
                    <div key={finding.id} className="rounded-xl border border-border p-4 space-y-3 bg-muted/20">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">Temuan #{finding.order}</Badge>
                        <Badge
                          className={
                            finding.hasViolation
                              ? 'border border-status-rejected/40 bg-status-rejected-bg text-status-rejected'
                              : 'border border-status-approved/40 bg-status-approved-bg text-status-approved'
                          }
                        >
                          {finding.hasViolation ? 'Ada Pelanggaran' : 'Tidak Ada Pelanggaran'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Lokasi: {finding.locationName}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FindingInfoItem label="GPS" value={finding.gpsNumber} />
                        <FindingInfoItem label="Koordinat Zona" value={finding.zoneCoordinate} />
                        <FindingInfoItem label="Zona Lokasi" value={finding.locationZone} />
                        <FindingInfoItem label="Koordinat Temuan" value={formatCoordinate(finding.mapPoint)} />
                        <FindingInfoItem label="Nama Kapal" value={finding.vesselName} />
                        <FindingInfoItem label="Nahkoda" value={finding.captainName} />
                        <FindingInfoItem label="Daya Mesin" value={finding.enginePower} />
                        <FindingInfoItem label="Jumlah Mesin" value={finding.engineCount} />
                        <FindingInfoItem label="Jumlah ABK" value={finding.crewCount} />
                        <FindingInfoItem label="Jumlah Penumpang" value={finding.passengerCount} />
                        <FindingInfoItem
                          label="Jenis Kapal"
                          value={formatWithOther(finding.shipKind, finding.shipKindOther)}
                        />
                        <FindingInfoItem
                          label="Kategori Kapal"
                          value={formatWithOther(finding.shipCategory, finding.shipCategoryOther)}
                        />
                        <FindingInfoItem label="Tipe Mesin" value={finding.engineType} />
                        <FindingInfoItem label="Asal Kapal" value={finding.shipOrigin} />
                        <FindingInfoItem
                          label="Pelanggaran"
                          value={
                            finding.hasViolation
                              ? finding.violationTypes.join(', ') || 'Ada (tanpa detail)'
                              : 'Tidak ada'
                          }
                          fullWidth
                        />
                        <FindingInfoItem label="Detail Pelanggaran" value={finding.violationDetail} fullWidth />
                        <FindingInfoItem
                          label="Alat Tangkap"
                          value={formatWithOther(finding.fishingTools.join(', ') || '-', finding.fishingToolsOther)}
                          fullWidth
                        />
                        <FindingInfoItem label="Tindakan" value={finding.actionTaken} fullWidth />
                        {finding.notes ? (
                          <FindingInfoItem label="Catatan Lapangan" value={finding.notes} fullWidth />
                        ) : null}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Lampiran Foto Temuan</p>
                        <AttachmentList items={finding.photoUrls} emptyLabel="Tidak ada foto temuan." />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Penutup Patroli
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailField label="BBM Tersisa" value={`${closing.fuelRemainingLiters} Liter`} />
              <DetailField label="Jarak Tempuh" value={`${closing.distanceKm} Km`} />
              <DetailField label="Wilayah Dipantau" value={closing.monitoredArea} fullWidth />
              <DetailField
                label="Waktu Kembali"
                value={[closing.returnDate, closing.returnTime].filter(Boolean).join(' ') || '-'}
                fullWidth
              />
              <div className="md:col-span-2 rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Tanda Tangan Penanggung Jawab
                </p>
                <div className="mt-2">
                  <SignaturePreview signature={closing.finalSignature} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Ringkasan Verifikasi
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
                <p className="text-muted-foreground mb-1">Catatan Verifikator</p>
                <p>{report.reviewNote || '-'}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={reviewing || report.status === 'validated'}
                  onClick={() => submitReview('validated')}
                >
                  Terima
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={reviewing || report.status === 'rejected'}
                  onClick={() => submitReview('rejected')}
                >
                  Kembalikan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Ringkasan Laporan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Total Temuan: <span className="text-foreground">{summary.findingCount ?? findings.length}</span>
              </p>
              <p>
                Temuan Pelanggaran: <span className="text-foreground">{summary.violationCount ?? 0}</span>
              </p>
              <p>
                Titik Rute: <span className="text-foreground">{summary.routePointCount ?? routePoints.length}</span>
              </p>
              <p>
                Riwayat Tim: <span className="text-foreground">{summary.teamHistoryCount ?? teamHistoryRanges.length}</span>
              </p>
              <p>
                BBM Awal: <span className="text-foreground">{summary.fuelStartLiters ?? fuelAndRoute.fuelStartLiters} L</span>
              </p>
              <p>
                BBM Sisa: <span className="text-foreground">{summary.fuelRemainingLiters ?? closing.fuelRemainingLiters} L</span>
              </p>
              <p>
                Jarak Tempuh: <span className="text-foreground">{summary.distanceKm ?? closing.distanceKm} Km</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Konteks Patroli</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Area: <span className="text-foreground">{detail.areaName}</span>
              </p>
              <p>
                Pos: <span className="text-foreground">{detail.postName}</span>
              </p>
              <p>
                Speedboat: <span className="text-foreground">{patrolInfo.speedboatName}</span>
              </p>
              <p>
                Wilayah Dipantau: <span className="text-foreground">{closing.monitoredArea}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

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

const DetailField = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? 'md:col-span-2 rounded-lg border border-border bg-card px-3 py-2' : 'rounded-lg border border-border bg-card px-3 py-2'}>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-medium text-foreground whitespace-pre-wrap">{`${value ?? '-'}` || '-'}</p>
  </div>
);

const FindingInfoItem = ({ label, value, fullWidth = false }) => (
  <DetailField label={label} value={value} fullWidth={fullWidth} />
);

const formatTeamDate = (value) => {
  const raw = `${value || ''}`.trim();
  if (!raw) return '-';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTeamPeriod = (startDate, endDate) => {
  const start = formatTeamDate(startDate);
  const end = formatTeamDate(endDate);
  if (start === '-' && end === '-') return '-';
  if (start === end) return start;
  return `${start} s/d ${end}`;
};

const labelTeamSource = (source) => {
  switch (`${source || ''}`.trim()) {
    case 'new_team':
      return 'Tim Baru';
    case 'same_team':
      return 'Tim Sama';
    case 'changed_team':
      return 'Tim Berubah';
    default:
      return 'Tidak diketahui';
  }
};

const teamSourceClassName = (source) => {
  switch (`${source || ''}`.trim()) {
    case 'new_team':
      return 'border border-sky-200 bg-sky-50 text-sky-700';
    case 'same_team':
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'changed_team':
      return 'border border-amber-200 bg-amber-50 text-amber-700';
    default:
      return 'border border-slate-200 bg-slate-50 text-slate-700';
  }
};

const formatWithOther = (value, otherValue) => {
  if (otherValue) {
    const normalizedValue = `${value || ''}`.trim();
    return normalizedValue && normalizedValue !== '-'
      ? `${normalizedValue} (${otherValue})`
      : otherValue;
  }
  return value || '-';
};

export default PatrolDetail;
