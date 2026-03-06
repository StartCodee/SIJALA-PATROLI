import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TablePaginationBar } from '@/components/table/TablePaginationBar';
import { useToast } from '@/hooks/use-toast';
import {
  apiClient,
  formatDateTime,
  reviewClassMap,
  reviewLabelMap,
} from '@/lib/apiClient';
import { mapPatrolReportsToFindings } from '@/lib/patrolFindingUtils';

const Findings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [violationFilter, setViolationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadFindings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getReports({ type: 'PATROL_JAGA_LAUT' });
      const mapped = mapPatrolReportsToFindings(response.items || []);
      setFindings(mapped);
    } catch (error) {
      toast({
        title: 'Gagal memuat data temuan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zoneOptions = useMemo(() => {
    const values = new Set(findings.map((item) => item.locationZone || item.zoneCoordinate || item.areaName));
    return Array.from(values).filter(Boolean);
  }, [findings]);

  const filteredFindings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return findings.filter((item) => {
      const matchesReview = reviewFilter === 'all' || item.reportStatus === reviewFilter;
      const matchesZone =
        zoneFilter === 'all' ||
        (item.locationZone || item.zoneCoordinate || item.areaName) === zoneFilter;
      const matchesViolation =
        violationFilter === 'all' ||
        (violationFilter === 'with' ? item.hasViolation : !item.hasViolation);

      const matchesSearch =
        query.length === 0 ||
        item.reportCode.toLowerCase().includes(query) ||
        item.locationName.toLowerCase().includes(query) ||
        item.gpsNumber.toLowerCase().includes(query) ||
        item.vesselName.toLowerCase().includes(query) ||
        item.submittedBy.toLowerCase().includes(query) ||
        item.areaName.toLowerCase().includes(query);

      return matchesReview && matchesZone && matchesViolation && matchesSearch;
    });
  }, [findings, reviewFilter, zoneFilter, violationFilter, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, reviewFilter, zoneFilter, violationFilter]);

  const pagedFindings = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filteredFindings.slice(from, from + pageSize);
  }, [filteredFindings, page, pageSize]);

  return (
    <MainLayout title="Temuan" subtitle="Data temuan otomatis dari form patroli mobile">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Daftar Temuan ({findings.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari lokasi, GPS, kapal, kode laporan..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-9 bg-card"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((prev) => !prev)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
                {showFilters ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>

              <Button variant="outline" size="sm" onClick={loadFindings} disabled={loading}>
                {loading ? 'Memuat...' : 'Muat Ulang'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showFilters && (
            <Card className="mb-4 card-ocean animate-fade-in">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Status Review Patroli
                    </label>
                    <select
                      value={reviewFilter}
                      onChange={(event) => setReviewFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      <option value="pending">Menunggu</option>
                      <option value="validated">Diterima</option>
                      <option value="rejected">Dikembalikan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zona / Area</label>
                    <select
                      value={zoneFilter}
                      onChange={(event) => setZoneFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      {zoneOptions.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pelanggaran</label>
                    <select
                      value={violationFilter}
                      onChange={(event) => setViolationFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      <option value="with">Ada Pelanggaran</option>
                      <option value="without">Tanpa Pelanggaran</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setReviewFilter('all');
                        setZoneFilter('all');
                        setViolationFilter('all');
                        setSearchQuery('');
                      }}
                    >
                      Atur Ulang Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Waktu</TableHead>
                  <TableHead className="font-semibold">Laporan</TableHead>
                  <TableHead className="font-semibold">Lokasi</TableHead>
                  <TableHead className="font-semibold">Kapal</TableHead>
                  <TableHead className="font-semibold">Pelanggaran</TableHead>
                  <TableHead className="font-semibold">Foto</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedFindings.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    <TableCell>
                      <p className="text-sm">{formatDateTime(item.submittedAt)}</p>
                      <Badge className={`mt-2 border ${reviewClassMap[item.reportStatus]}`}>
                        {reviewLabelMap[item.reportStatus]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm font-semibold font-mono">{item.reportCode}</p>
                      <p className="text-xs text-muted-foreground">{item.areaName}</p>
                      <p className="text-xs text-muted-foreground">{item.postName}</p>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm font-medium">{item.locationName}</p>
                      <p className="text-xs text-muted-foreground">GPS: {item.gpsNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        Zona: {item.locationZone !== '-' ? item.locationZone : item.zoneCoordinate}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm">{item.vesselName}</p>
                      <p className="text-xs text-muted-foreground">Nahkoda: {item.captainName}</p>
                    </TableCell>

                    <TableCell>
                      {item.hasViolation ? (
                        <div className="space-y-1">
                          <Badge variant="destructive" className="text-[10px]">
                            Ada
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {item.violationTypes.length > 0
                              ? item.violationTypes.join(', ')
                              : item.violationDetail}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Tidak ada
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-sm">{item.photoUrls.length} lampiran</TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70"
                        onClick={() => navigate(`/findings/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredFindings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                      Tidak ada data temuan yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePaginationBar
            totalItems={filteredFindings.length}
            page={page}
            pageSize={pageSize}
            onPageChange={(nextPage) => setPage(nextPage)}
            onPageSizeChange={(nextSize) => {
              setPageSize(nextSize);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Findings;
