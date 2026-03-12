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

  const payload = report?.payload || {};
  const summary = report?.summary || {};

  const patrolInfo = payload.patrolInfo || {};
  const attendance = Array.isArray(payload.attendance) ? payload.attendance : [];
  const teamSnapshot = payload.teamSnapshot && typeof payload.teamSnapshot === 'object' ? payload.teamSnapshot : {};
  const teamRoles = Array.isArray(teamSnapshot.roles) ? teamSnapshot.roles : [];
  const teamOthers = normalizeTeamOthers(teamSnapshot.others);
  const teamPhotos = Array.isArray(teamSnapshot.photoUrls) ? teamSnapshot.photoUrls : [];
  const teamHistoryRaw = Array.isArray(payload.teamHistory) ? payload.teamHistory : [];
  const fuelAndRoute = payload.fuelAndRoute || {};
  const findings = Array.isArray(payload.findings) ? payload.findings : [];
  const closing = payload.closing || {};

  const routePoints = useMemo(() => {
    const points = Array.isArray(fuelAndRoute?.routePoints) ? fuelAndRoute.routePoints : [];
    return points
      .filter((point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lon))
      .map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }));
  }, [fuelAndRoute]);

  const findingMarkers = findings
    .filter((finding) => Number.isFinite(finding?.mapPoint?.lat) && Number.isFinite(finding?.mapPoint?.lon))
    .map((finding) => ({
      lat: Number(finding.mapPoint.lat),
      lon: Number(finding.mapPoint.lon),
      kind: 'finding',
      label: finding.locationName || 'Temuan',
      description: finding.hasViolation
        ? `Pelanggaran: ${(finding.violationTypes || []).join(', ') || '-'}`
        : 'Tidak ada pelanggaran',
      color: finding.hasViolation ? '#ef4444' : '#22c55e',
    }));

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
      const last = routePoints[routePoints.length - 1];
      items.push({
        lat: last.lat,
        lon: last.lon,
        kind: 'end',
        label: 'Selesai Patroli',
        description: 'Titik akhir rute patroli',
      });
    }
    return items;
  }, [routePoints]);

  const markers = [...routeMarkers, ...findingMarkers];

  const selectedPoint = routePoints[0] || findingMarkers[0] || null;

  const teamSignatureFallback = useMemo(() => {
    const map = new Map();
    const toKey = (role, name) => `${`${role || ''}`.trim().toLowerCase()}|${`${name || ''}`.trim().toLowerCase()}`;
    const add = (role, name, signature) => {
      const key = toKey(role, name);
      if (!key || key === '|') return;
      if (!signature || typeof signature !== 'object') return;
      if (!map.has(key)) {
        map.set(key, signature);
      }
    };

    for (const row of teamRoles) {
      add(row?.role, row?.name, row?.signature);
    }
    for (const row of attendance) {
      add(row?.role, row?.memberName, row?.signature);
    }
    return map;
  }, [attendance, teamRoles]);

  const resolveTeamSignature = (entry) => {
    if (entry?.signature && typeof entry.signature === 'object') {
      return entry.signature;
    }
    const key = `${`${entry?.role || ''}`.trim().toLowerCase()}|${`${entry?.name || ''}`.trim().toLowerCase()}`;
    if (!key || key === '|') return null;
    return teamSignatureFallback.get(key) || null;
  };

  const teamHistoryEntries = useMemo(() => {
    const rows = teamHistoryRaw
      .map((entry) => ({
        date: `${entry?.date || ''}`.trim(),
        source: `${entry?.source || ''}`.trim() || 'unknown',
        roles: Array.isArray(entry?.roles) ? entry.roles : [],
        others: normalizeTeamOthers(entry?.others),
        photoUrls: Array.isArray(entry?.photoUrls) ? entry.photoUrls : [],
      }))
      .filter((entry) => entry.roles.length > 0 || entry.others.length > 0 || entry.photoUrls.length > 0)
      .sort((a, b) => `${a.date}`.localeCompare(`${b.date}`));

    if (rows.length > 0) return rows;
    if (teamRoles.length > 0 || teamOthers.length > 0 || teamPhotos.length > 0) {
      return [
        {
          date: `${teamSnapshot.date || patrolInfo.departureDate || ''}`.trim(),
          source: `${teamSnapshot.source || 'new_team'}`.trim() || 'new_team',
          roles: teamRoles,
          others: teamOthers,
          photoUrls: teamPhotos,
        },
      ];
    }

    const legacyRoles = attendance
      .filter((entry) => `${entry?.memberName || ''}`.trim().length > 0 && `${entry?.role || ''}`.trim().length > 0 && `${entry?.role || ''}`.trim().toLowerCase() !== 'lainnya')
      .map((entry) => ({
        role: `${entry?.role || ''}`.trim(),
        name: `${entry?.memberName || ''}`.trim(),
        signature: entry?.signature,
      }));
    const legacyOthers = attendance
      .filter((entry) => `${entry?.role || ''}`.trim().toLowerCase() === 'lainnya')
      .map((entry) => ({
        name: `${entry?.memberName || ''}`.trim(),
        role: `${entry?.role || ''}`.trim() || 'Lainnya',
        signature: entry?.signature,
      }))
      .filter((entry) => entry.name);
    if (legacyRoles.length === 0 && legacyOthers.length === 0) return [];

    return [
      {
        date: `${patrolInfo.departureDate || report?.submittedAt || ''}`.trim(),
        source: 'new_team',
        roles: legacyRoles,
        others: legacyOthers,
        photoUrls: [],
      },
    ];
  }, [
    attendance,
    patrolInfo.departureDate,
    report?.submittedAt,
    teamHistoryRaw,
    teamPhotos,
    teamOthers,
    teamRoles,
    teamSnapshot.date,
    teamSnapshot.source,
  ]);

  const teamHistoryRanges = useMemo(() => {
    if (teamHistoryEntries.length === 0) return [];
    const toKey = (entry) => {
      const roles = (Array.isArray(entry.roles) ? entry.roles : [])
        .map((row) => ({
          role: `${row?.role || ''}`.trim().toLowerCase(),
          name: `${row?.name || ''}`.trim().toLowerCase(),
        }))
        .filter((row) => row.role && row.name)
        .sort((a, b) => `${a.role}:${a.name}`.localeCompare(`${b.role}:${b.name}`));
      const others = (Array.isArray(entry.others) ? entry.others : [])
        .map((row) => ({
          role: `${row?.role || 'Lainnya'}`.trim().toLowerCase(),
          name: `${row?.name || ''}`.trim().toLowerCase(),
        }))
        .filter((row) => row.name)
        .map((row) => `${row.role}:${row.name}`)
        .sort((a, b) => a.localeCompare(b));
      return JSON.stringify({ roles, others });
    };

    const ranges = [];
    for (const entry of teamHistoryEntries) {
      const key = toKey(entry);
      const last = ranges[ranges.length - 1];
      if (!last || last.key !== key) {
        ranges.push({
          key,
          startDate: entry.date,
          endDate: entry.date,
          source: entry.source,
          roles: entry.roles,
          others: entry.others,
          photoUrls: Array.isArray(entry.photoUrls) ? [...entry.photoUrls] : [],
        });
      } else {
        last.endDate = entry.date || last.endDate;
        last.photoUrls = [
          ...new Set([
            ...(Array.isArray(last.photoUrls) ? last.photoUrls : []),
            ...(Array.isArray(entry.photoUrls) ? entry.photoUrls : []),
          ]),
        ];
      }
    }
    return ranges;
  }, [teamHistoryEntries]);

  useEffect(() => {
    setSelectedTeamRangeIndex((prev) => {
      if (teamHistoryRanges.length === 0) return 0;
      return prev < teamHistoryRanges.length ? prev : 0;
    });
  }, [teamHistoryRanges.length]);

  const activeTeamRange = teamHistoryRanges[selectedTeamRangeIndex] || null;

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
    <MainLayout title={report.reportCode} subtitle={report.areaName || 'Laporan Patroli'}>
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
            markers={markers}
            showSelectedMarker={false}
          />

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Informasi Patroli
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Area: {payload?.area?.name || report.areaName || '-'}</p>
              <p>Kode Area: {payload?.area?.code || '-'}</p>
              <p>Pos: {payload?.post?.name || report.postName || '-'}</p>
              <p>Speedboat: {patrolInfo.speedboatName || '-'}</p>
              <p>Patroli Ke: {patrolInfo.patrolSequence ?? '-'}</p>
              <p>
                Berangkat: {patrolInfo.departureDate || '-'} {patrolInfo.departureTime || ''}
              </p>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Peralatan</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(patrolInfo.equipment) && patrolInfo.equipment.length > 0 ? (
                    patrolInfo.equipment.map((item, index) => (
                      <Badge key={`equipment-${index}`} variant="secondary">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Daftar Hadir Tim ({teamHistoryRanges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamHistoryRanges.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada data daftar hadir tim.</p>
              ) : (
                <div className="space-y-3">
                  {teamHistoryRanges.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {teamHistoryRanges.map((range, index) => {
                        const active = index === selectedTeamRangeIndex;
                        return (
                          <button
                            key={`team-range-tab-${index}`}
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

                      {(Array.isArray(activeTeamRange.roles) ? activeTeamRange.roles : []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada anggota tim pada periode ini.</p>
                      ) : (
                        <div className="space-y-2">
                          {(Array.isArray(activeTeamRange.roles) ? activeTeamRange.roles : []).map((entry, index) => (
                            <div key={`team-role-active-${index}`} className="rounded-lg border border-border p-3 text-sm">
                              <p>
                                <span className="text-muted-foreground">Peran:</span> {entry?.role || '-'}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Nama:</span> {entry?.name || '-'}
                              </p>
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-1">Tanda tangan</p>
                                <SignaturePreview signature={resolveTeamSignature(entry)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground mb-1">Anggota lainnya</p>
                        {normalizeTeamOthers(activeTeamRange.others).length === 0 ? (
                          <p className="text-sm text-muted-foreground">-</p>
                        ) : (
                          normalizeTeamOthers(activeTeamRange.others).map((entry, index) => (
                            <div key={`team-other-active-${index}`} className="rounded-lg border border-border p-3 text-sm">
                              <p>
                                <span className="text-muted-foreground">Peran:</span> {entry.role || 'Lainnya'}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Nama:</span> {entry.name || '-'}
                              </p>
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-1">Tanda tangan</p>
                                <SignaturePreview signature={entry.signature || resolveTeamSignature(entry)} />
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Swafoto Tim</p>
                        <AttachmentList
                          items={(Array.isArray(activeTeamRange.photoUrls) ? activeTeamRange.photoUrls : []).length > 0 ? activeTeamRange.photoUrls : teamPhotos}
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
            <CardContent className="space-y-3 text-sm">
              <p>BBM Awal: {fuelAndRoute.fuelStartLiters ?? 0} Liter</p>
              <p>Catatan BBM: {fuelAndRoute.fuelNote || '-'}</p>
              <p>Lokasi Menginap: {fuelAndRoute.overnightLocation || '-'}</p>
              <p>Rencana Rute: {fuelAndRoute.routePlan || '-'}</p>
              <p>Jumlah Titik Rute: {routePoints.length}</p>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Daftar Titik Rute</p>
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
                  {findings.map((finding, index) => (
                    <div key={`finding-${index}`} className="rounded-xl border border-border p-4 space-y-3 bg-muted/20">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">Temuan #{index + 1}</Badge>
                        <Badge
                          className={
                            finding.hasViolation
                              ? 'border border-status-rejected/40 bg-status-rejected-bg text-status-rejected'
                              : 'border border-status-approved/40 bg-status-approved-bg text-status-approved'
                          }
                        >
                          {finding.hasViolation ? 'Ada Pelanggaran' : 'Tidak Ada Pelanggaran'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Lokasi: {finding.locationName || '-'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <FindingInfoItem label="GPS" value={finding.gpsNumber} />
                        <FindingInfoItem label="Koordinat Zona" value={finding.zoneCoordinate} />
                        <FindingInfoItem label="Zona Lokasi" value={finding.locationZone} />
                        <FindingInfoItem
                          label="Koordinat Temuan"
                          value={
                            Number.isFinite(finding?.mapPoint?.lat) && Number.isFinite(finding?.mapPoint?.lon)
                              ? `${Number(finding.mapPoint.lat).toFixed(6)}, ${Number(finding.mapPoint.lon).toFixed(6)}`
                              : '-'
                          }
                        />
                        <FindingInfoItem label="Nama Kapal" value={finding.vesselName} />
                        <FindingInfoItem label="Nahkoda" value={finding.captainName} />
                        <FindingInfoItem label="Daya Mesin" value={finding.enginePower} />
                        <FindingInfoItem label="Jumlah Mesin" value={finding.engineCount ?? 0} />
                        <FindingInfoItem label="Jumlah ABK" value={finding.crewCount ?? 0} />
                        <FindingInfoItem label="Jumlah Penumpang" value={finding.passengerCount ?? 0} />
                        <FindingInfoItem label="Jenis Kapal" value={finding.shipKind} />
                        <FindingInfoItem label="Kategori Kapal" value={finding.shipCategory} />
                        <FindingInfoItem label="Tipe Mesin" value={finding.engineType} />
                        <FindingInfoItem label="Asal Kapal" value={finding.shipOrigin} />
                        <FindingInfoItem
                          label="Pelanggaran"
                          value={
                            finding.hasViolation
                              ? (finding.violationTypes || []).join(', ') || 'Ada (tanpa detail)'
                              : 'Tidak ada'
                          }
                          fullWidth
                        />
                        <FindingInfoItem
                          label="Detail Pelanggaran"
                          value={finding.violationDetail}
                          fullWidth
                        />
                        <FindingInfoItem
                          label="Alat Tangkap"
                          value={(finding.fishingTools || []).join(', ') || '-'}
                          fullWidth
                        />
                        <FindingInfoItem label="Tindakan" value={finding.actionTaken} fullWidth />
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Lampiran Foto Temuan</p>
                        <AttachmentList items={finding.photoUrls || []} emptyLabel="Tidak ada foto temuan." />
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
            <CardContent className="space-y-3 text-sm">
              <p>BBM Tersisa: {closing.fuelRemainingLiters ?? 0} Liter</p>
              <p>Jarak Tempuh: {closing.distanceKm ?? 0} Km</p>
              <p>Wilayah Dipantau: {closing.monitoredArea || '-'}</p>
              <p>
                Waktu Kembali: {closing.returnDate || '-'} {closing.returnTime || ''}
              </p>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Tanda tangan penanggung jawab</p>
                <SignaturePreview signature={closing.finalSignature} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Payload Form Lengkap (Raw)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[380px] overflow-auto rounded-md bg-muted p-3 text-xs">
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
              <CardTitle className="text-base font-semibold">Ringkasan Otomatis</CardTitle>
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
                BBM Awal: <span className="text-foreground">{summary.fuelStartLiters ?? fuelAndRoute.fuelStartLiters ?? 0} L</span>
              </p>
              <p>
                BBM Sisa: <span className="text-foreground">{summary.fuelRemainingLiters ?? closing.fuelRemainingLiters ?? 0} L</span>
              </p>
              <p>
                Jarak Tempuh: <span className="text-foreground">{summary.distanceKm ?? closing.distanceKm ?? 0} Km</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

const normalizeTeamOthers = (raw) => {
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
};

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

export default PatrolDetail;

const FindingInfoItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? 'md:col-span-2 rounded-lg border border-border bg-card px-3 py-2' : 'rounded-lg border border-border bg-card px-3 py-2'}>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-medium text-foreground">{`${value ?? '-'}` || '-'}</p>
  </div>
);
