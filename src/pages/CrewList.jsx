import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, Plus, Search, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusChip } from '@/components/StatusChip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
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
    if (status === 'aktif')
        return 'approved';
    if (status === 'cuti')
        return 'pending';
    return 'rejected';
};
const CrewList = () => {
    const navigate = useNavigate();
    const { crew, guardPosts, addCrew, updateCrew, deleteCrew } = useData();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [postFilter, setPostFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [editingCrew, setEditingCrew] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        status: 'aktif',
        phone: '',
        email: '',
        basePostId: '',
        certifications: '',
    });
    const filteredCrew = crew.filter((member) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = member.name.toLowerCase().includes(query) ||
            member.role.toLowerCase().includes(query);
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
        const matchesPost = postFilter === 'all' ||
            (postFilter === 'none' ? !member.basePostId : member.basePostId === postFilter);
        return matchesSearch && matchesRole && matchesStatus && matchesPost;
    });
    const getPostName = (postId) => {
        if (!postId)
            return '-';
        const post = guardPosts.find((item) => item.id === postId);
        return post?.name ?? '-';
    };
    const handleCreateSubmit = (event) => {
        event.preventDefault();
        if (!formData.name.trim()) {
            toast({
                title: 'Error',
                description: 'Nama personel wajib diisi',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.role) {
            toast({
                title: 'Error',
                description: 'Peran personel wajib dipilih',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.phone.trim()) {
            toast({
                title: 'Error',
                description: 'Nomor telepon wajib diisi',
                variant: 'destructive',
            });
            return;
        }
        setIsSubmitting(true);
        const payload = {
            name: formData.name.trim(),
            role: formData.role,
            status: formData.status,
            phone: formData.phone.trim(),
            email: formData.email.trim() || '-',
            basePostId: formData.basePostId || null,
            certifications: formData.certifications
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
        };
        if (dialogMode === 'create') {
            addCrew({
                ...payload,
                lastActiveAt: new Date(),
            });
            toast({
                title: 'Berhasil',
                description: 'Personel berhasil ditambahkan',
            });
        }
        else if (editingCrew) {
            updateCrew(editingCrew.id, payload);
            toast({
                title: 'Berhasil',
                description: 'Personel berhasil diperbarui',
            });
        }
        setIsSubmitting(false);
        setDialogOpen(false);
        setDialogMode('create');
        setEditingCrew(null);
        setFormData({
            name: '',
            role: '',
            status: 'aktif',
            phone: '',
            email: '',
            basePostId: '',
            certifications: '',
        });
    };
    const openCreate = () => {
        setDialogMode('create');
        setEditingCrew(null);
        setFormData({
            name: '',
            role: '',
            status: 'aktif',
            phone: '',
            email: '',
            basePostId: '',
            certifications: '',
        });
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
            email: member.email === '-' ? '' : member.email,
            basePostId: member.basePostId ?? '',
            certifications: member.certifications.join(', '),
        });
        setDialogOpen(true);
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteCrew(deleteTarget.id);
        toast({
            title: 'Berhasil',
            description: 'Personel berhasil dihapus',
        });
        setDeleteTarget(null);
    };
    return (<MainLayout title="Personel" subtitle="Kelola data personel patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary"/>
              Personel Aktif ({crew.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari personel..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-card"/>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="w-4 h-4"/>
                Filter
                {showFilters ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
                setDialogMode('create');
                setEditingCrew(null);
                setFormData({
                    name: '',
                    role: '',
                    status: 'aktif',
                    phone: '',
                    email: '',
                    basePostId: '',
                    certifications: '',
                });
            }
        }}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4"/>
                    Tambah Personel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {dialogMode === 'create' ? 'Form Personel Baru' : 'Ubah Personel'}
                    </DialogTitle>
                    <DialogDescription>
                      {dialogMode === 'create'
            ? 'Tambahkan personel baru ke sistem patroli.'
            : 'Perbarui data personel yang dipilih.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input id="name" placeholder="Nama personel" value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}/>
                      </div>
                      <div className="space-y-2">
                        <Label>Peran *</Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih peran"/>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {Object.entries(roleLabels).map(([value, label]) => (<SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status"/>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {Object.entries(statusLabels).map(([value, label]) => (<SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telepon *</Label>
                        <Input id="phone" placeholder="08xx-xxxx-xxxx" value={formData.phone} onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="nama@patroli.id" value={formData.email} onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}/>
                      </div>
                      <div className="space-y-2">
                        <Label>Pos Jaga</Label>
                        <Select value={formData.basePostId || 'none'} onValueChange={(value) => setFormData((prev) => ({ ...prev, basePostId: value === 'none' ? '' : value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pos jaga"/>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="none">Tidak ada</SelectItem>
                            {guardPosts.map((post) => (<SelectItem key={post.id} value={post.id}>
                                {post.name}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="certifications">Sertifikasi</Label>
                        <Input id="certifications" placeholder="Pisahkan dengan koma, contoh: STCW, SAR Laut" value={formData.certifications} onChange={(event) => setFormData((prev) => ({ ...prev, certifications: event.target.value }))}/>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" className="btn-ocean" disabled={isSubmitting}>
                        {dialogMode === 'create' ? 'Simpan Personel' : 'Simpan Perubahan'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (<Card className="mb-4 card-ocean animate-fade-in">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Peran</label>
                    <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {Object.entries(roleLabels).map(([value, label]) => (<SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {Object.entries(statusLabels).map(([value, label]) => (<SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pos Jaga</label>
                    <Select value={postFilter} onValueChange={(value) => setPostFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="none">Tanpa Pos Jaga</SelectItem>
                        {guardPosts.map((post) => (<SelectItem key={post.id} value={post.id}>
                            {post.name}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setRoleFilter('all');
                setStatusFilter('all');
                setPostFilter('all');
            }}>
                      Atur Ulang Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
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
              {filteredCrew.map((member) => (<TableRow key={member.id}>
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
                    <StatusChip variant={statusVariant(member.status)} label={statusLabels[member.status]} showIcon={false}/>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70" onClick={() => navigate(`/crew/${member.id}`)}>
                        Detail
                      </Button>
                      <Button variant="ghost" size="sm" className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70" onClick={() => openEdit(member)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70" onClick={() => setDeleteTarget(member)}>
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>))}
              {filteredCrew.length === 0 && (<TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Tidak ada personel yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => {
            if (!open)
                setDeleteTarget(null);
        }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Personel</AlertDialogTitle>
            <AlertDialogDescription>
              Personel {deleteTarget?.name} akan dihapus beserta penugasan terkait. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>);
};
export default CrewList;
