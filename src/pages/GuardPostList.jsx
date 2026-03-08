import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Image as ImageIcon,
  MapPinned,
  Plus,
  Search,
} from 'lucide-react';
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

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100';
const API_ORIGIN = RAW_API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');

const statusLabels = {
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
};

const statusVariant = (status) => (status === 'aktif' ? 'approved' : 'rejected');

const initialAreaForm = {
  name: '',
  code: '',
  imagePath: '',
  centerLat: '',
  centerLon: '',
  status: 'aktif',
};

function toImageUrl(imagePath) {
  const value = String(imagePath || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/uploads/')) return `${API_ORIGIN}${value}`;
  if (value.startsWith('uploads/')) return `${API_ORIGIN}/${value}`;
  if (value.startsWith('/')) return value;
  if (value.startsWith('assets/')) return `/${value}`;
  return '';
}

function centerLabel(center) {
  if (!center) return '-';
  if (!Number.isFinite(center.lat) || !Number.isFinite(center.lon)) return '-';
  return `${Number(center.lat).toFixed(4)}, ${Number(center.lon).toFixed(4)}`;
}

function parseCoordinatePair(latRaw, lonRaw) {
  const lat = Number.parseFloat(latRaw);
  const lon = Number.parseFloat(lonRaw);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return { lat, lon };
}

const GuardPostList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [areas, setAreas] = useState([]);
  const [areaLoading, setAreaLoading] = useState(false);

  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  const [areaStatusFilter, setAreaStatusFilter] = useState('all');
  const [areaFilterOpen, setAreaFilterOpen] = useState(true);
  const [areaPage, setAreaPage] = useState(1);
  const [areaPageSize, setAreaPageSize] = useState(10);

  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [areaDialogMode, setAreaDialogMode] = useState('create');
  const [editingArea, setEditingArea] = useState(null);
  const [areaFormData, setAreaFormData] = useState(initialAreaForm);
  const [areaImageFile, setAreaImageFile] = useState(null);
  const [isAreaSubmitting, setIsAreaSubmitting] = useState(false);

  const [deleteAreaTarget, setDeleteAreaTarget] = useState(null);

  const loadAreas = async () => {
    setAreaLoading(true);
    try {
      const response = await apiClient.getPatrolAreas();
      setAreas(response.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat kawasan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAreaLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAreas = useMemo(() => {
    const query = areaSearchQuery.trim().toLowerCase();

    return areas.filter((area) => {
      const matchesQuery =
        query.length === 0 ||
        area.name.toLowerCase().includes(query) ||
        area.code.toLowerCase().includes(query);
      const matchesStatus = areaStatusFilter === 'all' || area.status === areaStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [areas, areaSearchQuery, areaStatusFilter]);

  const pagedAreas = useMemo(() => {
    const from = (areaPage - 1) * areaPageSize;
    return filteredAreas.slice(from, from + areaPageSize);
  }, [filteredAreas, areaPage, areaPageSize]);

  useEffect(() => {
    setAreaPage(1);
  }, [areaSearchQuery, areaStatusFilter]);

  const resetAreaForm = () => {
    setAreaDialogMode('create');
    setEditingArea(null);
    setAreaFormData(initialAreaForm);
    setAreaImageFile(null);
  };

  const openCreateArea = () => {
    resetAreaForm();
    setAreaDialogOpen(true);
  };

  const openEditArea = (area) => {
    setAreaDialogMode('edit');
    setEditingArea(area);
    setAreaImageFile(null);
    setAreaFormData({
      name: area.name || '',
      code: area.code || '',
      imagePath: area.imagePath || '',
      centerLat:
        area.center && Number.isFinite(area.center.lat)
          ? String(area.center.lat)
          : '',
      centerLon:
        area.center && Number.isFinite(area.center.lon)
          ? String(area.center.lon)
          : '',
      status: area.status || 'aktif',
    });
    setAreaDialogOpen(true);
  };

  const handleAreaSubmit = async (event) => {
    event.preventDefault();

    const centerLatRaw = areaFormData.centerLat.trim();
    const centerLonRaw = areaFormData.centerLon.trim();

    let center = null;
    if (centerLatRaw || centerLonRaw) {
      center = parseCoordinatePair(centerLatRaw, centerLonRaw);
      if (!center) {
        toast({
          title: 'Koordinat pusat tidak valid',
          description: 'Lintang dan bujur harus berupa angka.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsAreaSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', areaFormData.name.trim());
      payload.append('code', areaFormData.code.trim().toUpperCase());
      payload.append('status', areaFormData.status);
      payload.append('imagePath', areaFormData.imagePath.trim());

      if (center) {
        payload.append('centerLat', String(center.lat));
        payload.append('centerLon', String(center.lon));
      }

      if (areaImageFile) {
        payload.append('image', areaImageFile);
      }

      if (areaDialogMode === 'create') {
        await apiClient.createPatrolArea(payload);
      } else if (editingArea) {
        await apiClient.updatePatrolArea(editingArea.id, payload);
      }

      await loadAreas();

      toast({
        title: 'Berhasil',
        description:
          areaDialogMode === 'create'
            ? 'Kawasan berhasil ditambahkan.'
            : 'Kawasan berhasil diperbarui.',
      });

      setAreaDialogOpen(false);
      resetAreaForm();
    } catch (error) {
      toast({
        title: 'Gagal menyimpan kawasan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsAreaSubmitting(false);
    }
  };

  const handleDeleteArea = async () => {
    if (!deleteAreaTarget) return;

    try {
      await apiClient.deletePatrolArea(deleteAreaTarget.id);
      await loadAreas();
      toast({
        title: 'Berhasil',
        description: 'Kawasan berhasil dihapus.',
      });
    } catch (error) {
      toast({
        title: 'Gagal menghapus kawasan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteAreaTarget(null);
    }
  };

  return (
    <MainLayout title="Pelabuhan/Pos Jaga" subtitle="Kelola master kawasan, lalu buka halaman detail untuk manajemen pos">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-primary" />
              Kawasan ({areas.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari kawasan..."
                  value={areaSearchQuery}
                  onChange={(event) => setAreaSearchQuery(event.target.value)}
                  className="pl-9 bg-card"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAreaFilterOpen((prev) => !prev)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
                {areaFilterOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>

              <Dialog
                open={areaDialogOpen}
                onOpenChange={(open) => {
                  setAreaDialogOpen(open);
                  if (!open) resetAreaForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={openCreateArea}>
                    <Plus className="h-4 w-4" />
                    Tambah Kawasan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {areaDialogMode === 'create' ? 'Tambah Kawasan' : 'Ubah Kawasan'}
                    </DialogTitle>
                    <DialogDescription>
                      Master kawasan patroli untuk pemetaan area dan pos.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAreaSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nama Kawasan</Label>
                        <Input
                          value={areaFormData.name}
                          onChange={(event) =>
                            setAreaFormData((prev) => ({ ...prev, name: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Kode Kawasan</Label>
                        <Input
                          value={areaFormData.code}
                          onChange={(event) =>
                            setAreaFormData((prev) => ({
                              ...prev,
                              code: event.target.value.toUpperCase(),
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Path Gambar</Label>
                        <Input
                          value={areaFormData.imagePath}
                          onChange={(event) =>
                            setAreaFormData((prev) => ({ ...prev, imagePath: event.target.value }))
                          }
                          placeholder="Contoh: /uploads/area-ayau.jpg"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Upload Gambar Kawasan (multipart)</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const nextFile = event.target.files?.[0] || null;
                            setAreaImageFile(nextFile);
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          {areaImageFile
                            ? `File dipilih: ${areaImageFile.name}`
                            : 'Opsional. Jika diisi, file akan diupload ke backend.'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Lintang Titik Tengah</Label>
                        <Input
                          value={areaFormData.centerLat}
                          onChange={(event) =>
                            setAreaFormData((prev) => ({ ...prev, centerLat: event.target.value }))
                          }
                          placeholder="Opsional"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Bujur Titik Tengah</Label>
                        <Input
                          value={areaFormData.centerLon}
                          onChange={(event) =>
                            setAreaFormData((prev) => ({ ...prev, centerLon: event.target.value }))
                          }
                          placeholder="Opsional"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                          value={areaFormData.status}
                          onChange={(event) =>
                            setAreaFormData((prev) => ({ ...prev, status: event.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setAreaDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" className="btn-ocean" disabled={isAreaSubmitting}>
                        {isAreaSubmitting ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {areaFilterOpen && (
            <Card className="mb-4 card-ocean animate-fade-in">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                    <select
                      value={areaStatusFilter}
                      onChange={(event) => setAreaStatusFilter(event.target.value)}
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
                        setAreaStatusFilter('all');
                        setAreaSearchQuery('');
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
                <TableHead>Gambar</TableHead>
                <TableHead>Kawasan</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Titik Tengah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jumlah Pos</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedAreas.map((area) => {
                const imageUrl = toImageUrl(area.imagePath);
                const postCount = Array.isArray(area.posts) ? area.posts.length : 0;

                return (
                  <TableRow key={area.id}>
                    <TableCell>
                      <div className="w-[68px] h-[42px] rounded-md border border-border bg-muted/30 overflow-hidden flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={area.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{area.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{area.code}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{centerLabel(area.center)}</TableCell>
                    <TableCell>
                      <StatusChip
                        variant={statusVariant(area.status)}
                        label={statusLabels[area.status] || '-'}
                        showIcon={false}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{postCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/guard-posts/${area.id}`)}
                        >
                          Detail Pos
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70"
                          onClick={() => openEditArea(area)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70"
                          onClick={() => setDeleteAreaTarget(area)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredAreas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    {areaLoading ? 'Memuat data kawasan...' : 'Belum ada data kawasan.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePaginationBar
            totalItems={filteredAreas.length}
            page={areaPage}
            pageSize={areaPageSize}
            onPageChange={(nextPage) => setAreaPage(nextPage)}
            onPageSizeChange={(nextSize) => {
              setAreaPageSize(nextSize);
              setAreaPage(1);
            }}
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteAreaTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteAreaTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kawasan</AlertDialogTitle>
            <AlertDialogDescription>
              Kawasan {deleteAreaTarget?.name} akan dihapus permanen. Jika masih ada pos di kawasan ini,
              penghapusan akan ditolak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArea}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default GuardPostList;
