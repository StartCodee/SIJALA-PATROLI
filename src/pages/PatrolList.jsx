import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, Route, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const PatrolList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getReports({
        type: 'PATROL_JAGA_LAUT',
      });
      setReports(response.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return reports.filter((item) => {
      const matchesStatus = reviewFilter === 'all' || item.status === reviewFilter;
      const matchesSearch =
        query.length === 0 ||
        item.reportCode?.toLowerCase().includes(query) ||
        item.areaName?.toLowerCase().includes(query) ||
        item.postName?.toLowerCase().includes(query) ||
        item.submittedBy?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [reports, reviewFilter, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, reviewFilter]);

  const pagedReports = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filteredReports.slice(from, from + pageSize);
  }, [filteredReports, page, pageSize]);

  const submitReview = async (item, status) => {
    const isReject = status === 'rejected';
    const note = isReject
      ? window.prompt('Alasan pengembalian laporan:', item.reviewNote || '') || ''
      : 'Data laporan patroli sesuai.';

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
        description: `Kode ${item.reportCode}`,
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
    if (!deleteTarget) return;
    try {
      await apiClient.deleteReport(deleteTarget.id);
      setReports((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast({
        title: 'Laporan dihapus',
        description: `Kode ${deleteTarget.reportCode}`,
      });
    } catch (error) {
      toast({
        title: 'Gagal menghapus laporan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <MainLayout title="Daftar Patroli" subtitle="Laporan patroli jaga laut dari mobile">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Laporan Patroli ({reports.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari kode, area, pengirim..."
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

              <Button variant="outline" size="sm" onClick={loadReports} disabled={loading}>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Status Review
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

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setReviewFilter('all');
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
                  <TableHead className="font-semibold">Laporan</TableHead>
                  <TableHead className="font-semibold">Area / Pos</TableHead>
                  <TableHead className="font-semibold">Operasional</TableHead>
                  <TableHead className="font-semibold">Temuan</TableHead>
                  <TableHead className="font-semibold">Review</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedReports.map((item) => {
                  const summary = item.summary || {};
                  const isSubmitting = submittingId === item.id;

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-semibold font-mono">{item.reportCode}</p>
                          <p className="text-xs text-muted-foreground">
                            Dikirim: {formatDateTime(item.submittedAt)}
                          </p>
                          <p className="text-xs text-muted-foreground">Oleh: {item.submittedBy}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{item.areaName || '-'}</p>
                          <p className="text-xs text-muted-foreground">{item.postName || '-'}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Speedboat: <span className="text-foreground">{summary.speedboatName || '-'}</span>
                          </p>
                          <p>
                            Berangkat:{' '}
                            <span className="text-foreground">
                              {summary.departureDate || '-'} {summary.departureTime || ''}
                            </span>
                          </p>
                          <p>
                            Pulang:{' '}
                            <span className="text-foreground">
                              {summary.returnDate || '-'} {summary.returnTime || ''}
                            </span>
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Total: <span className="text-foreground">{summary.findingCount ?? 0}</span>
                          </p>
                          <p>
                            Pelanggaran:{' '}
                            <span className="text-foreground">{summary.violationCount ?? 0}</span>
                          </p>
                          <p>
                            BBM:{' '}
                            <span className="text-foreground">
                              {(summary.fuelStartLiters ?? 0).toLocaleString('id-ID')}L
                            </span>
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground space-y-2">
                          <Badge className={`border ${reviewClassMap[item.status]}`}>
                            {reviewLabelMap[item.status]}
                          </Badge>
                          <p>{item.reviewerName || '-'}</p>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70"
                            onClick={() => navigate(`/patrols/${item.id}`)}
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
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      {loading ? 'Memuat data...' : 'Belum ada laporan patroli.'}
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
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan Patroli</AlertDialogTitle>
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

export default PatrolList;
