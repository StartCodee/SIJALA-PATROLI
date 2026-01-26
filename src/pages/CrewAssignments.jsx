import { useState } from 'react';
import { ChevronDown, ChevronUp, ClipboardList, Filter, Plus, Search } from 'lucide-react';
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
    active: 'Aktif',
    planned: 'Terjadwal',
    completed: 'Selesai',
};
const statusVariant = (status) => {
    if (status === 'active')
        return 'approved';
    if (status === 'planned')
        return 'pending';
    return 'info';
};
const CrewAssignments = () => {
    const { crewAssignments, patrols, crew, addCrewAssignment, updateCrewAssignment, deleteCrewAssignment } = useData();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [shiftFilter, setShiftFilter] = useState('all');
    const [patrolFilter, setPatrolFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        patrolId: '',
        crewId: '',
        role: '',
        shift: 'pagi',
        status: 'planned',
    });
    const filteredAssignments = crewAssignments.filter((assignment) => {
        const patrol = patrols.find((item) => item.id === assignment.patrolId);
        const member = crew.find((item) => item.id === assignment.crewId);
        const query = searchQuery.toLowerCase();
        const patrolCode = patrol?.code?.toLowerCase() ?? '';
        const patrolArea = patrol?.areaName?.toLowerCase() ?? '';
        const memberName = member?.name?.toLowerCase() ?? '';
        const matchesSearch = patrolCode.includes(query) || patrolArea.includes(query) || memberName.includes(query);
        const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
        const matchesShift = shiftFilter === 'all' || assignment.shift === shiftFilter;
        const matchesPatrol = patrolFilter === 'all' || assignment.patrolId === patrolFilter;
        return matchesSearch && matchesStatus && matchesShift && matchesPatrol;
    });
    const formatDateTime = (date) => date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const handleCreateSubmit = (event) => {
        event.preventDefault();
        if (!formData.patrolId) {
            toast({
                title: 'Error',
                description: 'Patroli wajib dipilih',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.crewId) {
            toast({
                title: 'Error',
                description: 'Personel wajib dipilih',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.role) {
            toast({
                title: 'Error',
                description: 'Peran wajib dipilih',
                variant: 'destructive',
            });
            return;
        }
        setIsSubmitting(true);
        const payload = {
            patrolId: formData.patrolId,
            crewId: formData.crewId,
            role: formData.role,
            shift: formData.shift,
            status: formData.status,
        };
        if (dialogMode === 'create') {
            addCrewAssignment({
                ...payload,
                assignedAt: new Date(),
            });
            toast({
                title: 'Berhasil',
                description: 'Penugasan crew berhasil dibuat',
            });
        }
        else if (editingAssignment) {
            updateCrewAssignment(editingAssignment.id, payload);
            toast({
                title: 'Berhasil',
                description: 'Penugasan crew berhasil diperbarui',
            });
        }
        setIsSubmitting(false);
        setDialogOpen(false);
        setDialogMode('create');
        setEditingAssignment(null);
        setFormData({
            patrolId: '',
            crewId: '',
            role: '',
            shift: 'pagi',
            status: 'planned',
        });
    };
    const openCreate = () => {
        setDialogMode('create');
        setEditingAssignment(null);
        setFormData({
            patrolId: '',
            crewId: '',
            role: '',
            shift: 'pagi',
            status: 'planned',
        });
        setDialogOpen(true);
    };
    const openEdit = (assignment) => {
        setDialogMode('edit');
        setEditingAssignment(assignment);
        setFormData({
            patrolId: assignment.patrolId,
            crewId: assignment.crewId,
            role: assignment.role,
            shift: assignment.shift,
            status: assignment.status,
        });
        setDialogOpen(true);
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteCrewAssignment(deleteTarget.id);
        toast({
            title: 'Berhasil',
            description: 'Penugasan crew berhasil dihapus',
        });
        setDeleteTarget(null);
    };
    return (<MainLayout title="Penugasan Crew" subtitle="Kelola penempatan personel ke patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary"/>
              Penugasan Aktif ({crewAssignments.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari patroli atau crew..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-card"/>
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
                setEditingAssignment(null);
                setFormData({
                    patrolId: '',
                    crewId: '',
                    role: '',
                    shift: 'pagi',
                    status: 'planned',
                });
            }
        }}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4"/>
                    Tambah Penugasan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {dialogMode === 'create' ? 'Form Penugasan Crew' : 'Ubah Penugasan Crew'}
                    </DialogTitle>
                    <DialogDescription>
                      {dialogMode === 'create'
            ? 'Atur personel yang ditempatkan ke patroli.'
            : 'Perbarui detail penugasan crew.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Patroli *</Label>
                        <Select value={formData.patrolId} onValueChange={(value) => setFormData((prev) => ({ ...prev, patrolId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih patroli"/>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {patrols.map((patrol) => (<SelectItem key={patrol.id} value={patrol.id}>
                                {patrol.code} - {patrol.areaName}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Crew *</Label>
                        <Select value={formData.crewId} onValueChange={(value) => setFormData((prev) => ({ ...prev, crewId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih crew"/>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {crew.map((member) => (<SelectItem key={member.id} value={member.id}>
                                {member.name} ({roleLabels[member.role]})
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
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
                        <Label>Shift</Label>
                        <Select value={formData.shift} onValueChange={(value) => setFormData((prev) => ({ ...prev, shift: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih shift"/>
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="pagi">Pagi</SelectItem>
                            <SelectItem value="siang">Siang</SelectItem>
                            <SelectItem value="malam">Malam</SelectItem>
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
                            <SelectItem value="planned">Terjadwal</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="completed">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" className="btn-ocean" disabled={isSubmitting}>
                        {dialogMode === 'create' ? 'Simpan Penugasan' : 'Simpan Perubahan'}
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="planned">Terjadwal</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Shift</label>
                    <Select value={shiftFilter} onValueChange={(value) => setShiftFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="pagi">Pagi</SelectItem>
                        <SelectItem value="siang">Siang</SelectItem>
                        <SelectItem value="malam">Malam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Patroli</label>
                    <Select value={patrolFilter} onValueChange={(value) => setPatrolFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {patrols.map((patrol) => (<SelectItem key={patrol.id} value={patrol.id}>
                            {patrol.code} - {patrol.areaName}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setStatusFilter('all');
                setShiftFilter('all');
                setPatrolFilter('all');
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
                <TableHead>Patroli</TableHead>
                <TableHead>Crew</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ditetapkan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => {
            const patrol = patrols.find((item) => item.id === assignment.patrolId);
            const member = crew.find((item) => item.id === assignment.crewId);
            return (<TableRow key={assignment.id}>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{patrol?.code ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">{patrol?.areaName ?? '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{member?.name ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">
                          {member ? roleLabels[member.role] : '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{roleLabels[assignment.role]}</TableCell>
                    <TableCell className="text-sm capitalize">{assignment.shift}</TableCell>
                    <TableCell>
                      <StatusChip variant={statusVariant(assignment.status)} label={statusLabels[assignment.status]} showIcon={false}/>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(assignment.assignedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70" onClick={() => openEdit(assignment)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70" onClick={() => setDeleteTarget(assignment)}>
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>);
        })}
              {filteredAssignments.length === 0 && (<TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    Tidak ada penugasan yang cocok dengan pencarian.
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
            <AlertDialogTitle>Hapus Penugasan Crew</AlertDialogTitle>
            <AlertDialogDescription>
              Penugasan crew ini akan dihapus dari daftar. Lanjutkan?
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
export default CrewAssignments;
