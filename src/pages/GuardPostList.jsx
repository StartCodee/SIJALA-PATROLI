import { useState } from 'react';
import { Anchor, ChevronDown, ChevronUp, Filter, Plus, Search } from 'lucide-react';
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
const typeLabels = {
    pelabuhan: 'Pelabuhan',
    pos_jaga: 'Pos Jaga',
};
const statusLabels = {
    aktif: 'Aktif',
    nonaktif: 'Nonaktif',
};
const statusVariant = (status) => (status === 'aktif' ? 'approved' : 'rejected');
const GuardPostList = () => {
    const { guardPosts, addGuardPost, updateGuardPost, deleteGuardPost } = useData();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [editingPost, setEditingPost] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'pelabuhan',
        status: 'aktif',
        address: '',
        contact: '',
        lat: '',
        lon: '',
        notes: '',
    });
    const filteredPosts = guardPosts.filter((post) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = post.name.toLowerCase().includes(query) || post.address.toLowerCase().includes(query);
        const matchesType = typeFilter === 'all' || post.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        return matchesQuery && matchesType && matchesStatus;
    });
    const handleCreateSubmit = (event) => {
        event.preventDefault();
        if (!formData.name.trim()) {
            toast({
                title: 'Error',
                description: 'Nama pos jaga wajib diisi',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.address.trim()) {
            toast({
                title: 'Error',
                description: 'Alamat wajib diisi',
                variant: 'destructive',
            });
            return;
        }
        const lat = Number.parseFloat(formData.lat);
        const lon = Number.parseFloat(formData.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            toast({
                title: 'Error',
                description: 'Koordinat wajib diisi dengan angka',
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
            contact: formData.contact.trim() || '-',
            location: { lat, lon },
            notes: formData.notes.trim() || undefined,
        };
        if (dialogMode === 'create') {
            addGuardPost(payload);
            toast({
                title: 'Berhasil',
                description: 'Data pos jaga berhasil ditambahkan',
            });
        }
        else if (editingPost) {
            updateGuardPost(editingPost.id, payload);
            toast({
                title: 'Berhasil',
                description: 'Data pos jaga berhasil diperbarui',
            });
        }
        setIsSubmitting(false);
        setDialogOpen(false);
        setDialogMode('create');
        setEditingPost(null);
        setFormData({
            name: '',
            type: 'pelabuhan',
            status: 'aktif',
            address: '',
            contact: '',
            lat: '',
            lon: '',
            notes: '',
        });
    };
    const openCreate = () => {
        setDialogMode('create');
        setEditingPost(null);
        setFormData({
            name: '',
            type: 'pelabuhan',
            status: 'aktif',
            address: '',
            contact: '',
            lat: '',
            lon: '',
            notes: '',
        });
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
            contact: post.contact === '-' ? '' : post.contact,
            lat: String(post.location.lat),
            lon: String(post.location.lon),
            notes: post.notes ?? '',
        });
        setDialogOpen(true);
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteGuardPost(deleteTarget.id);
        toast({
            title: 'Berhasil',
            description: 'Data pos jaga berhasil dihapus',
        });
        setDeleteTarget(null);
    };
    return (<MainLayout title="Pelabuhan/Pos Jaga" subtitle="Master data pos jaga dan pelabuhan patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Anchor className="h-5 w-5 text-primary"/>
              Lokasi Pos Jaga ({guardPosts.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari pos jaga..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-card"/>
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
                setEditingPost(null);
                setFormData({
                    name: '',
                    type: 'pelabuhan',
                    status: 'aktif',
                    address: '',
                    contact: '',
                    lat: '',
                    lon: '',
                    notes: '',
                });
            }
        }}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4"/>
                    Tambah Lokasi
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {dialogMode === 'create' ? 'Form Pos Jaga/Pelabuhan' : 'Ubah Pos Jaga/Pelabuhan'}
                    </DialogTitle>
                    <DialogDescription>
                      {dialogMode === 'create'
            ? 'Tambahkan master data lokasi patroli.'
            : 'Perbarui data lokasi patroli.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lokasi *</Label>
                        <Input id="name" placeholder="Pos Jaga ..." value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}/>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe"/>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="pelabuhan">Pelabuhan</SelectItem>
                            <SelectItem value="pos_jaga">Pos Jaga</SelectItem>
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
                            <SelectItem value="aktif">Aktif</SelectItem>
                            <SelectItem value="nonaktif">Nonaktif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact">Kontak</Label>
                        <Input id="contact" placeholder="08xx-xxxx-xxxx" value={formData.contact} onChange={(event) => setFormData((prev) => ({ ...prev, contact: event.target.value }))}/>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Alamat *</Label>
                        <Input id="address" placeholder="Alamat lengkap lokasi" value={formData.address} onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lat">Lintang *</Label>
                        <Input id="lat" placeholder="-0.2000" value={formData.lat} onChange={(event) => setFormData((prev) => ({ ...prev, lat: event.target.value }))}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lon">Bujur *</Label>
                        <Input id="lon" placeholder="130.5000" value={formData.lon} onChange={(event) => setFormData((prev) => ({ ...prev, lon: event.target.value }))}/>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="notes">Catatan</Label>
                        <Input id="notes" placeholder="Catatan tambahan" value={formData.notes} onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}/>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" className="btn-ocean" disabled={isSubmitting}>
                        {dialogMode === 'create' ? 'Simpan Lokasi' : 'Simpan Perubahan'}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipe</label>
                    <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="pelabuhan">Pelabuhan</SelectItem>
                        <SelectItem value="pos_jaga">Pos Jaga</SelectItem>
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
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
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
                <TableHead>Lokasi</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Koordinat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (<TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{post.name}</p>
                      <p className="text-xs text-muted-foreground">{post.address}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{typeLabels[post.type]}</TableCell>
                  <TableCell className="text-sm">{post.contact}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {post.location.lat.toFixed(4)}, {post.location.lon.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <StatusChip variant={statusVariant(post.status)} label={statusLabels[post.status]} showIcon={false}/>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70" onClick={() => openEdit(post)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70" onClick={() => setDeleteTarget(post)}>
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>))}
              {filteredPosts.length === 0 && (<TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Tidak ada lokasi yang cocok dengan pencarian.
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
            <AlertDialogTitle>Hapus Lokasi</AlertDialogTitle>
            <AlertDialogDescription>
              Lokasi {deleteTarget?.name} akan dihapus. Crew yang terkait akan disetel ke tanpa pos jaga.
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
export default GuardPostList;
