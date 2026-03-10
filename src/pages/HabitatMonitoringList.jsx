import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, Search, TreePine } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TablePaginationBar } from '@/components/table/TablePaginationBar';
import { useToast } from '@/hooks/use-toast';
import { apiClient, reviewClassMap, reviewLabelMap } from '@/lib/apiClient';

const HabitatMonitoringList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getReports({
        type: 'OTHER_MONITORING',
      });
      setReports(response.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat monitoring habitat',
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
  }, []);

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return reports.filter((item) => {
      const summary = item.summary || {};

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        item.reportCode?.toLowerCase().includes(query) ||
        item.areaName?.toLowerCase().includes(query) ||
        String(summary.operatorName || '').toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [reports, searchQuery, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const pagedReports = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filteredReports.slice(from, from + pageSize);
  }, [filteredReports, page, pageSize]);

  const submitReview = async (item, status) => {
    const isReject = status === 'rejected';
    const note = isReject
      ? window.prompt('Alasan pengembalian laporan:', item.reviewNote || '') || ''
      : 'Laporan monitoring habitat sudah sesuai.';

    if (isReject && !note.trim()) {
      toast({
        title: 'Catatan wajib diisi',
        description: 'Mohon isi alasan saat mengembalikan laporan.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingId(item.id);
    try {
      const updated = await apiClient.reviewReport(item.id, {
        status,
        reviewerName: 'Verifier Dashboard',
        reviewNote: note,
      });
      setReports((prev) => prev.map((report) => (report.id === updated.id ? updated : report)));
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
      setSubmittingId('');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget)
      return;
    try {
      await apiClient.deleteReport(deleteTarget.id);
      setReports((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast({
        title: 'Laporan dihapus',
        description: deleteTarget.reportCode,
      });
    }
    catch (error) {
      toast({
        title: 'Gagal menghapus laporan',
        description: error.message,
        variant: 'destructive',
      });
    }
    finally {
      setDeleteTarget(null);
    }
  };

  return (
    <MainLayout title="Monitoring Habitat" subtitle="Laporan monitoring habitat dari mobile">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TreePine className="h-5 w-5 text-primary" />
              Monitoring Habitat ({reports.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari kode, area, operator..."
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
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                {loading ? 'Memuat...' : 'Muat Ulang'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showFilters && (
            <Card className="mb-4 card-ocean animate-fade-in">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status Review</label>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      <option value="pending">Menunggu</option>
                      <option value="validated">Diterima</option>
                      <option value="rejected">Dikembalikan</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setStatusFilter('all');
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
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Laporan</TableHead>
                  <TableHead className="font-semibold">Area / Pos</TableHead>
                  <TableHead className="font-semibold">Informasi Habitat</TableHead>
                  <TableHead className="font-semibold">Pengunjung</TableHead>
                  <TableHead className="font-semibold">Pelanggaran</TableHead>
                  <TableHead className="font-semibold">Review</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedReports.map((item) => {
                  const summary = item.summary || {};
                  const isSubmitting = submittingId === item.id;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-semibold font-mono text-sm">{item.reportCode}</p>
                        <p className="text-xs text-muted-foreground">{item.submittedBy}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{item.areaName || '-'}</p>
                        <p className="text-xs text-muted-foreground">{item.postName || '-'}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <p>Entry: {summary.habitatCount ?? 0}</p>
                        <p>Operator: {summary.operatorName || '-'}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <p>Wisatawan: {summary.touristCount ?? 0}</p>
                        <p>Guide: {summary.guideCount ?? 0}</p>
                        <p>Total: {summary.totalPeople ?? 0}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <p>Manta: {summary.mantaSightingsCount ?? 0}</p>
                        <p>{summary.hasViolation ? 'Ada pelanggaran' : 'Tidak ada pelanggaran'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${reviewClassMap[item.status]}`}>
                          {reviewLabelMap[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70"
                            onClick={() => navigate(`/monitoring-habitat/${item.id}`)}
                          >
                            Detail
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="border border-status-approved/30 bg-status-approved-bg text-status-approved hover:bg-status-approved-bg/70"
                            onClick={() => submitReview(item, 'validated')}
                            disabled={isSubmitting}
                          >
                            Terima
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70"
                            onClick={() => submitReview(item, 'rejected')}
                            disabled={isSubmitting}
                          >
                            Kembalikan
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70"
                            onClick={() => setDeleteTarget(item)}
                            disabled={isSubmitting}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      {loading ? 'Memuat data...' : 'Belum ada laporan monitoring habitat.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePaginationBar
            totalItems={filteredReports.length}
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

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open)
            setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan Monitoring Habitat</AlertDialogTitle>
            <AlertDialogDescription>
              Laporan {deleteTarget?.reportCode} akan dihapus permanen. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default HabitatMonitoringList;
