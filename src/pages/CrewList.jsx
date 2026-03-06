import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, Plus, Search, Users } from 'lucide-react';
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

const roleLabels = {
  kapten: 'Kapten',
  navigator: 'Navigator',
  teknisi: 'Teknisi',
  operator: 'Operator',
  medis: 'Medis',
  petugas: 'Petugas',
};

const statusLabels = {
  aktif: 'Aktif',
  cuti: 'Cuti',
  nonaktif: 'Nonaktif',
};

const statusVariant = (status) => {
  if (status === 'aktif') return 'approved';
  if (status === 'cuti') return 'pending';
  return 'rejected';
};

const initialForm = {
  name: '',
  role: 'petugas',
  status: 'aktif',
  phone: '',
  email: '',
  basePostId: '',
  certifications: '',
};

const CrewList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [crew, setCrew] = useState([]);
  const [guardPosts, setGuardPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [postFilter, setPostFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingCrew, setEditingCrew] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [crewResponse, postsResponse] = await Promise.all([
        apiClient.getCrew(),
        apiClient.getGuardPosts(),
      ]);

      setCrew(crewResponse.items || []);
      setGuardPosts(postsResponse.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat data personel',
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

  const getPostName = (postId) => {
    if (!postId) return '-';
    const post = guardPosts.find((item) => item.id === postId);
    return post?.name ?? '-';
  };

  const filteredCrew = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return crew.filter((member) => {
      const matchesSearch =
        query.length === 0 ||
        member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query);

      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesPost =
        postFilter === 'all' ||
        (postFilter === 'none' ? !member.basePostId : member.basePostId === postFilter);

      return matchesSearch && matchesRole && matchesStatus && matchesPost;
    });
  }, [crew, postFilter, roleFilter, searchQuery, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, statusFilter, postFilter]);

  const pagedCrew = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filteredCrew.slice(from, from + pageSize);
  }, [filteredCrew, page, pageSize]);

  const resetForm = () => {
    setDialogMode('create');
    setEditingCrew(null);
    setFormData(initialForm);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (member) => {
    setDialogMode('edit');
    setEditingCrew(member);
    setFormData({
      name: member.name,
      role: member.role,
      status: member.status,
      phone: member.phone,
      email: member.email,
      basePostId: member.basePostId || '',
      certifications: (member.certifications || []).join(', '),
    });
    setDialogOpen(true);
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      role: formData.role,
      status: formData.status,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      basePostId: formData.basePostId || null,
      certifications: formData.certifications
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (dialogMode === 'create') {
        const created = await apiClient.createCrew(payload);
        setCrew((prev) => [created, ...prev]);
      } else if (editingCrew) {
        const updated = await apiClient.updateCrew(editingCrew.id, payload);
        setCrew((prev) => prev.map((member) => (member.id === updated.id ? updated : member)));
      }

      toast({
        title: 'Berhasil',
        description:
          dialogMode === 'create'
            ? 'Data personel berhasil ditambahkan.'
            : 'Data personel berhasil diperbarui.',
      });

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Gagal menyimpan personel',
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
      await apiClient.deleteCrew(deleteTarget.id);
      setCrew((prev) => prev.filter((member) => member.id !== deleteTarget.id));
      toast({ title: 'Berhasil', description: 'Personel berhasil dihapus.' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus personel',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <MainLayout title="Personel" subtitle="Kelola data personel patroli dari API">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Personel ({crew.length})
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari personel..."
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
                    Tambah Personel
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {dialogMode === 'create' ? 'Tambah Personel' : 'Ubah Personel'}
                    </DialogTitle>
                    <DialogDescription>Kelola profil personel patroli jaga laut.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nama</Label>
                        <Input
                          value={formData.name}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, name: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Peran</Label>
                        <select
                          value={formData.role}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, role: event.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
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
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Telepon</Label>
                        <Input
                          value={formData.phone}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, phone: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, email: event.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Pos Jaga</Label>
                        <select
                          value={formData.basePostId}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, basePostId: event.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Tidak ada</option>
                          {guardPosts.map((post) => (
                            <option key={post.id} value={post.id}>
                              {post.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Sertifikasi</Label>
                        <Input
                          value={formData.certifications}
                          onChange={(event) =>
                            setFormData((prev) => ({ ...prev, certifications: event.target.value }))
                          }
                          placeholder="Pisahkan dengan koma"
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Peran</label>
                    <select
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
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
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pos Jaga</label>
                    <select
                      value={postFilter}
                      onChange={(event) => setPostFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Semua</option>
                      <option value="none">Tanpa Pos Jaga</option>
                      {guardPosts.map((post) => (
                        <option key={post.id} value={post.id}>
                          {post.name}
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
                        setRoleFilter('all');
                        setStatusFilter('all');
                        setPostFilter('all');
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
                <TableHead>Personel</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Pos Jaga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedCrew.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{roleLabels[member.role]}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{member.phone}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{getPostName(member.basePostId)}</TableCell>
                  <TableCell>
                    <StatusChip
                      variant={statusVariant(member.status)}
                      label={statusLabels[member.status]}
                      showIcon={false}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70"
                        onClick={() => navigate(`/crew/${member.id}`)}
                      >
                        Detail
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70"
                        onClick={() => openEdit(member)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70"
                        onClick={() => setDeleteTarget(member)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredCrew.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    {loading ? 'Memuat data...' : 'Tidak ada personel yang cocok.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePaginationBar
            totalItems={filteredCrew.length}
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
            <AlertDialogTitle>Hapus Personel</AlertDialogTitle>
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

export default CrewList;
