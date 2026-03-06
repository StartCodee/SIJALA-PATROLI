import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileWarning, Filter, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { apiClient, formatDateTime } from '@/lib/apiClient';
import { mapPatrolReportsToIncidents } from '@/lib/patrolFindingUtils';

const IncidentList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getReports({ type: 'PATROL_JAGA_LAUT' });
      const mapped = mapPatrolReportsToIncidents(response.items || []);
      setIncidents(mapped);
    } catch (error) {
      toast({
        title: 'Gagal memuat laporan kejadian',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryOptions = useMemo(() => {
    const values = new Set(incidents.map((item) => item.category));
    return Array.from(values).filter(Boolean);
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return incidents.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.locationName.toLowerCase().includes(query) ||
        item.reportCode.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
    });
  }, [incidents, searchQuery, statusFilter, severityFilter, categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, severityFilter, categoryFilter]);

  const pagedIncidents = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filteredIncidents.slice(from, from + pageSize);
  }, [filteredIncidents, page, pageSize]);

  const getSeverityBadge = (severity) => {
    if (severity === 'high') {
      return <Badge variant="destructive" className="text-xs">Tinggi</Badge>;
    }
    if (severity === 'medium') {
      return (
        <Badge variant="secondary" className="text-xs bg-warning/15 text-warning border-warning/30">
          Sedang
        </Badge>
      );
    }
    return <Badge variant="secondary" className="text-xs">Rendah</Badge>;
  };

  return (
    <MainLayout title="Laporan Kejadian" subtitle="Data kejadian otomatis dari temuan pelanggaran di patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-primary" />
              Semua Laporan Kejadian ({incidents.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari kategori, lokasi, kode laporan..."
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

              <Button variant="outline" size="sm" onClick={loadIncidents} disabled={loading}>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      <option value="open">Terbuka</option>
                      <option value="investigating">Investigasi</option>
                      <option value="closed">Selesai</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Prioritas</label>
                    <select
                      value={severityFilter}
                      onChange={(event) => setSeverityFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      <option value="high">Tinggi</option>
                      <option value="medium">Sedang</option>
                      <option value="low">Rendah</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Kategori</label>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setStatusFilter('all');
                        setSeverityFilter('all');
                        setCategoryFilter('all');
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
                  <TableHead className="font-semibold">Judul</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Prioritas</TableHead>
                  <TableHead className="font-semibold">Patroli</TableHead>
                  <TableHead className="font-semibold">Lokasi</TableHead>
                  <TableHead className="font-semibold">Waktu</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedIncidents.map((incident) => (
                  <TableRow
                    key={incident.incidentId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/incidents/${incident.incidentId}`)}
                  >
                    <TableCell className="font-medium max-w-[260px] truncate">{incident.title}</TableCell>
                    <TableCell className="text-sm">{incident.category}</TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} size="sm" />
                    </TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell className="text-sm font-mono">{incident.reportCode}</TableCell>
                    <TableCell className="text-sm">{incident.locationName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(incident.time)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/incidents/${incident.incidentId}`);
                        }}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredIncidents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                      Tidak ada laporan kejadian yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePaginationBar
            totalItems={filteredIncidents.length}
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

export default IncidentList;
