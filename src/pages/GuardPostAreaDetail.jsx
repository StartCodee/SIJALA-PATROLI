import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Anchor,
  ArrowLeft,
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

const typeLabels = {
  pelabuhan: 'Pelabuhan',
  pos_jaga: 'Pos Jaga',
};

const statusLabels = {
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
};

const statusVariant = (status) => (status === 'aktif' ? 'approved' : 'rejected');

const initialPostForm = {
  name: '',
  type: 'pelabuhan',
  status: 'aktif',
  address: '',
  contact: '',
  lat: '',
  lon: '',
  notes: '',
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

const GuardPostAreaDetail = () => {
  const navigate = useNavigate();
  const { areaId } = useParams();
  const { toast } = useToast();

  const [area, setArea] = useState(null);
  const [areaLoading, setAreaLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postLoading, setPostLoading] = useState(false);

  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [postStatusFilter, setPostStatusFilter] = useState('all');
  const [postFilterOpen, setPostFilterOpen] = useState(true);
  const [postPage, setPostPage] = useState(1);
  const [postPageSize, setPostPageSize] = useState(10);

  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postDialogMode, setPostDialogMode] = useState('create');
  const [editingPost, setEditingPost] = useState(null);
  const [postFormData, setPostFormData] = useState(initialPostForm);
  const [isPostSubmitting, setIsPostSubmitting] = useState(false);

  const [deletePostTarget, setDeletePostTarget] = useState(null);

  const effectiveAreaId = String(areaId || '').trim();

  const loadArea = async () => {
    if (!effectiveAreaId) return;

    setAreaLoading(true);
    try {
      const areaData = await apiClient.getPatrolAreaById(effectiveAreaId);
      setArea(areaData);
    } catch (error) {
      setArea(null);
      toast({
        title: 'Gagal memuat detail kawasan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAreaLoading(false);
    }
  };

  const loadPosts = async () => {
    if (!effectiveAreaId) return;

    setPostLoading(true);
    try {
      const response = await apiClient.getGuardPosts({ areaId: effectiveAreaId });
      setPosts(response.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat data pos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPostLoading(false);
    }
  };

  useEffect(() => {
    if (!effectiveAreaId) return;
    loadArea();
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAreaId]);

  const filteredPosts = useMemo(() => {
    const query = postSearchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesQuery =
        query.length === 0 ||
        post.name.toLowerCase().includes(query) ||
        post.address.toLowerCase().includes(query) ||
        post.contact.toLowerCase().includes(query);
      const matchesType = postTypeFilter === 'all' || post.type === postTypeFilter;
      const matchesStatus = postStatusFilter === 'all' || post.status === postStatusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [posts, postSearchQuery, postTypeFilter, postStatusFilter]);

  const pagedPosts = useMemo(() => {
    const from = (postPage - 1) * postPageSize;
    return filteredPosts.slice(from, from + postPageSize);
  }, [filteredPosts, postPage, postPageSize]);

  useEffect(() => {
    setPostPage(1);
  }, [postSearchQuery, postTypeFilter, postStatusFilter]);

  const resetPostForm = () => {
    setPostDialogMode('create');
    setEditingPost(null);
    setPostFormData(initialPostForm);
  };

  const openCreatePost = () => {
    if (!area) return;
    resetPostForm();
    setPostDialogOpen(true);
  };

  const openEditPost = (post) => {
    setPostDialogMode('edit');
    setEditingPost(post);
    setPostFormData({
      name: post.name,
      type: post.type,
      status: post.status,
      address: post.address,
      contact: post.contact,
      lat: String(post.location?.lat ?? ''),
      lon: String(post.location?.lon ?? ''),
      notes: post.notes || '',
    });
    setPostDialogOpen(true);
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();

    if (!area) return;

    const location = parseCoordinatePair(postFormData.lat, postFormData.lon);
    if (!location) {
      toast({
        title: 'Koordinat tidak valid',
        description: 'Lintang dan bujur harus berupa angka.',
        variant: 'destructive',
      });
      return;
    }

    setIsPostSubmitting(true);
    try {
      const payload = {
        name: postFormData.name.trim(),
        areaId: area.id,
        type: postFormData.type,
        status: postFormData.status,
        address: postFormData.address.trim(),
        contact: postFormData.contact.trim(),
        location,
        notes: postFormData.notes.trim() || null,
      };

      if (postDialogMode === 'create') {
        await apiClient.createGuardPost(payload);
      } else if (editingPost) {
        await apiClient.updateGuardPost(editingPost.id, payload);
      }

      await loadPosts();

      toast({
        title: 'Berhasil',
        description:
          postDialogMode === 'create'
            ? 'Pos berhasil ditambahkan.'
            : 'Pos berhasil diperbarui.',
      });

      setPostDialogOpen(false);
      resetPostForm();
    } catch (error) {
      toast({
        title: 'Gagal menyimpan pos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsPostSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deletePostTarget) return;

    try {
      await apiClient.deleteGuardPost(deletePostTarget.id);
      await loadPosts();
      toast({
        title: 'Berhasil',
        description: 'Pos berhasil dihapus.',
      });
    } catch (error) {
      toast({
        title: 'Gagal menghapus pos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeletePostTarget(null);
    }
  };

  const imageUrl = toImageUrl(area?.imagePath);

  return (
    <MainLayout title="Detail Kawasan" subtitle="Manajemen pos untuk kawasan terpilih">
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/guard-posts')}>
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Kawasan
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-primary" />
            {area ? area.name : 'Detail Kawasan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!area && (
            <div className="text-sm text-muted-foreground">
              {areaLoading ? 'Memuat kawasan...' : 'Data kawasan tidak ditemukan.'}
            </div>
          )}

          {area && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <div className="w-full rounded-md border border-border bg-white p-2">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={area.name}
                      className="block w-full h-auto rounded-sm"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full min-h-24 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 md:self-start grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm content-start">
                <div>
                  <p className="text-muted-foreground">Nama Kawasan</p>
                  <p className="font-medium">{area.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kode Kawasan</p>
                  <p className="font-medium">{area.code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Titik Tengah</p>
                  <p className="font-medium">{centerLabel(area.center)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusChip
                    variant={statusVariant(area.status)}
                    label={statusLabels[area.status] || '-'}
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Anchor className="h-5 w-5 text-primary" />
              Manajemen Pos ({posts.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari pos..."
                  value={postSearchQuery}
                  onChange={(event) => setPostSearchQuery(event.target.value)}
                  className="pl-9 bg-card"
                  disabled={!area}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPostFilterOpen((prev) => !prev)}
                className="gap-2"
                disabled={!area}
              >
                <Filter className="w-4 h-4" />
                Filter
                {postFilterOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>

              <Dialog
                open={postDialogOpen}
                onOpenChange={(open) => {
                  setPostDialogOpen(open);
                  if (!open) resetPostForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={openCreatePost} disabled={!area}>
                    <Plus className="h-4 w-4" />
                    Tambah Pos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {postDialogMode === 'create' ? 'Tambah Pos' : 'Ubah Pos'}
                    </DialogTitle>
                    <DialogDescription>
                      {area
                        ? `Kelola pos untuk kawasan ${area.name}.`
                        : 'Pilih kawasan terlebih dahulu.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handlePostSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Kawasan</Label>
                        <Input value={area?.name || '-'} readOnly className="bg-muted/20" />
                      </div>

                      <div className="space-y-2">
                        <Label>Nama Pos</Label>
                        <Input
                          value={postFormData.name}
                          onChange={(event) =>
                            setPostFormData((prev) => ({ ...prev, name: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tipe</Label>
                        <select
                          value={postFormData.type}
                          onChange={(event) =>
                            setPostFormData((prev) => ({ ...prev, type: event.target.value }))
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
                          value={postFormData.status}
                          onChange={(event) =>
                            setPostFormData((prev) => ({ ...prev, status: event.target.value }))
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
                          value={postFormData.contact}
                          onChange={(event) =>
                            setPostFormData((prev) => ({ ...prev, contact: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Alamat</Label>
                        <Input
                          value={postFormData.address}
                          onChange={(event) =>
                            setPostFormData((prev) => ({ ...prev, address: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Lintang</Label>
                        <Input
                          value={postFormData.lat}
                          onChange={(event) =>
                            setPostFormData((prev) => ({ ...prev, lat: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Bujur</Label>
                        <Input
                          value={postFormData.lon}
                          onChange={(event) =>
                            setPostFormData((prev) => ({ ...prev, lon: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Catatan</Label>
                        <Input
                          value={postFormData.notes}
                          onChange={(event) =>
                            setPostFormData((prev) => ({ ...prev, notes: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setPostDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" className="btn-ocean" disabled={isPostSubmitting}>
                        {isPostSubmitting ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {postFilterOpen && area && (
            <Card className="mb-4 card-ocean animate-fade-in">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipe</label>
                    <select
                      value={postTypeFilter}
                      onChange={(event) => setPostTypeFilter(event.target.value)}
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
                      value={postStatusFilter}
                      onChange={(event) => setPostStatusFilter(event.target.value)}
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
                        setPostTypeFilter('all');
                        setPostStatusFilter('all');
                        setPostSearchQuery('');
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
                <TableHead>Nama Pos</TableHead>
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
                      label={statusLabels[post.status] || '-'}
                      showIcon={false}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70"
                        onClick={() => openEditPost(post)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70"
                        onClick={() => setDeletePostTarget(post)}
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
                    {postLoading ? 'Memuat data pos...' : 'Belum ada data pos pada kawasan ini.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePaginationBar
            totalItems={filteredPosts.length}
            page={postPage}
            pageSize={postPageSize}
            onPageChange={(nextPage) => setPostPage(nextPage)}
            onPageSizeChange={(nextSize) => {
              setPostPageSize(nextSize);
              setPostPage(1);
            }}
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deletePostTarget)}
        onOpenChange={(open) => {
          if (!open) setDeletePostTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pos</AlertDialogTitle>
            <AlertDialogDescription>
              Pos {deletePostTarget?.name} akan dihapus permanen. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default GuardPostAreaDetail;
