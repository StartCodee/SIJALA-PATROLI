import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ClipboardList, Filter, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';
const NonPermanentResourceList = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { nonPermanentResources, patrols, updateNonPermanentResource, deleteNonPermanentResource, } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [patrolFilter, setPatrolFilter] = useState('all');
    const [originFilter, setOriginFilter] = useState('all');
    const [editOpen, setEditOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editForm, setEditForm] = useState({
        activity: '',
        interviewee: '',
        residentOrigin: '',
        notes: '',
    });
    const originOptions = Array.from(new Set(nonPermanentResources.map((item) => item.residentOrigin)));
    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };
    const getPatrolCode = (patrolId) => {
        const patrol = patrols.find((item) => item.id === patrolId);
        return patrol?.code ?? '-';
    };
    const filteredResources = nonPermanentResources.filter((item) => {
        const query = searchQuery.toLowerCase();
        const patrolCode = getPatrolCode(item.patrolId).toLowerCase();
        const matchesSearch = item.resourceUser.toLowerCase().includes(query) ||
            item.activity.toLowerCase().includes(query) ||
            item.interviewee.toLowerCase().includes(query) ||
            item.residentOrigin.toLowerCase().includes(query) ||
            patrolCode.includes(query);
        const matchesPatrol = patrolFilter === 'all' || item.patrolId === patrolFilter;
        const matchesOrigin = originFilter === 'all' || item.residentOrigin === originFilter;
        return matchesSearch && matchesPatrol && matchesOrigin;
    });
    const openEdit = (resource) => {
        setEditingResource(resource);
        setEditForm({
            activity: resource.activity,
            interviewee: resource.interviewee,
            residentOrigin: resource.residentOrigin,
            notes: resource.notes ?? '',
        });
        setEditOpen(true);
    };
    const handleEditSubmit = (event) => {
        event.preventDefault();
        if (!editingResource)
            return;
        updateNonPermanentResource(editingResource.id, {
            activity: editForm.activity.trim(),
            interviewee: editForm.interviewee.trim(),
            residentOrigin: editForm.residentOrigin.trim(),
            notes: editForm.notes.trim() || undefined,
        });
        toast({
            title: 'Berhasil',
            description: 'Monitoring non-permanent diperbarui.',
        });
        setEditOpen(false);
        setEditingResource(null);
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteNonPermanentResource(deleteTarget.id);
        toast({
            title: 'Berhasil',
            description: 'Data monitoring non-permanent dihapus.',
        });
        setDeleteTarget(null);
    };
    return (<MainLayout title="Monitoring Non-Permanent" subtitle="Rekap survey sumber daya non-permanen">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary"/>
              Non-Permanent Survey ({nonPermanentResources.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari pengguna, aktivitas..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-card"/>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="w-4 h-4"/>
                Filter
                {showFilters ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (<Card className="mb-4 card-ocean animate-fade-in">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Patroli</label>
                    <Select value={patrolFilter} onValueChange={(value) => setPatrolFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {patrols.map((patrol) => (<SelectItem key={patrol.id} value={patrol.id}>
                            {patrol.code}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Asal</label>
                    <Select value={originFilter} onValueChange={(value) => setOriginFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {originOptions.map((origin) => (<SelectItem key={origin} value={origin}>
                            {origin}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setPatrolFilter('all');
                setOriginFilter('all');
            }}>
                      Atur Ulang Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold">Pengguna & Aktivitas</TableHead>
                  <TableHead className="font-semibold">Narasumber</TableHead>
                  <TableHead className="font-semibold">Asal</TableHead>
                  <TableHead className="font-semibold">Patroli</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((item) => (<TableRow key={item.id}>
                    <TableCell className="text-sm font-medium">{formatDate(item.surveyTime)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{item.resourceUser}</p>
                        <p className="text-xs text-muted-foreground">{item.activity}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{item.interviewee}</TableCell>
                    <TableCell className="text-sm">{item.residentOrigin}</TableCell>
                    <TableCell className="text-sm font-mono">{getPatrolCode(item.patrolId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70" onClick={() => navigate(`/monitoring-non-permanent/${item.id}`)}>
                          Detail
                        </Button>
                        <Button variant="ghost" size="sm" className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70" onClick={() => setDeleteTarget(item)}>
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>))}
                {filteredResources.length === 0 && (<TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      Tidak ada data non-permanent yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Ubah Monitoring Non-Permanent</DialogTitle>
            <DialogDescription>Perbarui informasi aktivitas dan wawancara.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity">Aktivitas</Label>
              <Input id="activity" value={editForm.activity} onChange={(event) => setEditForm((prev) => ({ ...prev, activity: event.target.value }))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewee">Narasumber</Label>
              <Input id="interviewee" value={editForm.interviewee} onChange={(event) => setEditForm((prev) => ({ ...prev, interviewee: event.target.value }))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="residentOrigin">Asal</Label>
              <Input id="residentOrigin" value={editForm.residentOrigin} onChange={(event) => setEditForm((prev) => ({ ...prev, residentOrigin: event.target.value }))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea id="notes" value={editForm.notes} onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}/>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="btn-ocean">
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => {
            if (!open)
                setDeleteTarget(null);
        }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Monitoring Non-Permanent</AlertDialogTitle>
            <AlertDialogDescription>
              Data survey {deleteTarget?.resourceUser} akan dihapus. Lanjutkan?
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
export default NonPermanentResourceList;
