import { useEffect, useMemo, useState } from 'react';
import { Anchor, ChevronDown, ChevronUp, Filter, Plus, Search } from 'lucide-react';
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
import { apiClient } from '@/lib/apiClient';

const typeLabels = {
  pelabuhan: 'Pelabuhan',
  pos_jaga: 'Pos Jaga',
};

const statusLabels = {
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
};

const statusVariant = (status) => (status === 'aktif' ? 'approved' : 'rejected');

const initialForm = {
  name: '',
  type: 'pelabuhan',
  status: 'aktif',
  address: '',
  contact: '',
  lat: '',
  lon: '',
  notes: '',
};

const GuardPostList = () => {
  const { toast } = useToast();

  const [guardPosts, setGuardPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingPost, setEditingPost] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getGuardPosts();
      setGuardPosts(response.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat lokasi',
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

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return guardPosts.filter((post) => {
      const matchesQuery =
        query.length === 0 ||
        post.name.toLowerCase().includes(query) ||
        post.address.toLowerCase().includes(query);

      const matchesType = typeFilter === 'all' || post.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [guardPosts, searchQuery, typeFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, typeFilter, statusFilter]);

  const pagedPosts = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filteredPosts.slice(from, from + pageSize);
  }, [filteredPosts, page, pageSize]);

  const resetForm = () => {
    setDialogMode('create');
    setEditingPost(null);
    setFormData(initialForm);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (post) => {
    setDialogMode('edit');
    setEditingPost(post);
    setFormData({
      name: post.name,
      type: post.type,
      status: post.status,
      address: post.address,
      contact: post.contact,
      lat: String(post.location?.lat ?? ''),
      lon: String(post.location?.lon ?? ''),
      notes: post.notes || '',
    });
    setDialogOpen(true);
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const lat = Number.parseFloat(formData.lat);
    const lon = Number.parseFloat(formData.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      toast({
        title: 'Koordinat tidak valid',
        description: 'Lintang dan bujur harus berupa angka.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
      address: formData.address.trim(),
      contact: formData.contact.trim(),
      location: {
        lat,
        lon,
      },
      notes: formData.notes.trim() || null,
    };

    try {
      if (dialogMode === 'create') {
        const created = await apiClient.createGuardPost(payload);
        setGuardPosts((prev) => [created, ...prev]);
      } else if (editingPost) {
        const updated = await apiClient.updateGuardPost(editingPost.id, payload);
        setGuardPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
      }

      toast({
        title: 'Berhasil',
        description:
          dialogMode === 'create'
            ? 'Data pelabuhan/pos berhasil ditambahkan.'
            : 'Data pelabuhan/pos berhasil diperbarui.',
      });

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Gagal menyimpan data',
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
      await apiClient.deleteGuardPost(deleteTarget.id);
      setGuardPosts((prev) => prev.filter((post) => post.id !== deleteTarget.id));
      toast({ title: 'Berhasil', description: 'Data lokasi berhasil dihapus.' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <MainLayout title="Pelabuhan/Pos Jaga" subtitle="Master data lokasi patroli dari API">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Anchor className="h-5 w-5 text-primary" />
              Lokasi ({guardPosts.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari lokasi..."
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
                    Tambah Lokasi
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {dialogMode === 'create' ? 'Tambah Lokasi' : 'Ubah Lokasi'}
                    </DialogTitle>
                    <DialogDescription>
                      Kelola data pelabuhan dan pos jaga yang dipakai patroli.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nama Lokasi</Label>
                        <Input
                          value={formData.name}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, name: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tipe</Label>
                        <select
                          value={formData.type}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, type: event.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="pelabuhan">Pelabuhan</option>
                          <option value="pos_jaga">Pos Jaga</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                          value={formData.status}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, status: event.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Kontak</Label>
                        <Input
                          value={formData.contact}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, contact: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Alamat</Label>
                        <Input
                          value={formData.address}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, address: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Lintang</Label>
                        <Input
                          value={formData.lat}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, lat: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Bujur</Label>
                        <Input
                          value={formData.lon}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, lon: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Catatan</Label>
                        <Input
                          value={formData.notes}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, notes: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" className="btn-ocean" disabled={isSubmitting}>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipe</label>
                    <select
                      value={typeFilter}
                      onChange={(event) => setTypeFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      <option value="pelabuhan">Pelabuhan</option>
                      <option value="pos_jaga">Pos Jaga</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setTypeFilter('all');
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
                <TableHead>Lokasi</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Koordinat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{post.name}</p>
                      <p className="text-xs text-muted-foreground">{post.address}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{typeLabels[post.type]}</TableCell>
                  <TableCell className="text-sm">{post.contact}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {post.location?.lat?.toFixed(4)}, {post.location?.lon?.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      variant={statusVariant(post.status)}
                      label={statusLabels[post.status]}
                      showIcon={false}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70"
                        onClick={() => openEdit(post)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70"
                        onClick={() => setDeleteTarget(post)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredPosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    {loading ? 'Memuat data...' : 'Tidak ada lokasi yang cocok.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePaginationBar
            totalItems={filteredPosts.length}
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
            <AlertDialogTitle>Hapus Lokasi</AlertDialogTitle>
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

export default GuardPostList;
