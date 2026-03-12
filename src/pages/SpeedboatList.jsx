import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Plus, Search, Ship } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusChip } from '@/components/StatusChip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { apiClient, formatDateTime } from '@/lib/apiClient';

const statusLabels = {
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
};

const statusVariant = (status) => (status === 'aktif' ? 'approved' : 'rejected');

const initialForm = {
  name: '',
  status: 'aktif',
};

const SpeedboatList = () => {
  const { toast } = useToast();

  const [speedboats, setSpeedboats] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingSpeedboat, setEditingSpeedboat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const loadSpeedboats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSpeedboats();
      setSpeedboats(response.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat data speedboat',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpeedboats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSpeedboats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return speedboats.filter((speedboat) => {
      const matchesSearch =
        query.length === 0 || speedboat.name.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' || speedboat.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, speedboats, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const pagedSpeedboats = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filteredSpeedboats.slice(from, from + pageSize);
  }, [filteredSpeedboats, page, pageSize]);

  const resetForm = () => {
    setDialogMode('create');
    setEditingSpeedboat(null);
    setFormData(initialForm);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setDialogMode('edit');
    setEditingSpeedboat(item);
    setFormData({
      name: item.name || '',
      status: item.status || 'aktif',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: formData.name.trim(),
      status: formData.status,
    };

    if (!payload.name) {
      toast({
        title: 'Nama speedboat wajib diisi',
        description: 'Isi nama speedboat terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (dialogMode === 'create') {
        await apiClient.createSpeedboat(payload);
      } else if (editingSpeedboat) {
        await apiClient.updateSpeedboat(editingSpeedboat.id, payload);
      }

      await loadSpeedboats();
      toast({
        title: 'Berhasil',
        description:
          dialogMode === 'create'
            ? 'Speedboat berhasil ditambahkan.'
            : 'Speedboat berhasil diperbarui.',
      });
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Gagal menyimpan speedboat',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await apiClient.deleteSpeedboat(deleteTarget.id);
      await loadSpeedboats();
      toast({
        title: 'Berhasil',
        description: 'Speedboat berhasil dihapus.',
      });
    } catch (error) {
      toast({
        title: 'Gagal menghapus speedboat',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <MainLayout
      title="Management Speedboat"
      subtitle="Kelola master data speedboat yang dipakai di form patroli mobile"
    >
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Speedboat ({speedboats.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari speedboat..."
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

              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Tambah Speedboat
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {dialogMode === 'create'
                        ? 'Tambah Speedboat'
                        : 'Ubah Speedboat'}
                    </DialogTitle>
                    <DialogDescription>
                      Data ini menjadi pilihan speedboat di aplikasi mobile.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label>Nama Speedboat</Label>
                      <Input
                        value={formData.name}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Contoh: KM Lumba-Lumba"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        value={formData.status}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: event.target.value,
                          }))
                        }
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="btn-ocean"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diperbarui</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedSpeedboats.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      variant={statusVariant(item.status)}
                      label={statusLabels[item.status]}
                      showIcon={false}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(item.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70"
                        onClick={() => setDeleteTarget(item)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredSpeedboats.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground"
                  >
                    {loading ? 'Memuat data...' : 'Tidak ada speedboat yang cocok.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePaginationBar
            totalItems={filteredSpeedboats.length}
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
            <AlertDialogTitle>Hapus Speedboat</AlertDialogTitle>
            <AlertDialogDescription>
              Data {deleteTarget?.name} akan dihapus permanen. Lanjutkan?
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

export default SpeedboatList;
