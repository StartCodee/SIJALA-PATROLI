import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, Search, TreePine } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';
const validationOptions = [
    'pending',
    'valid',
    'invalid',
];
const validationLabels = {
    pending: 'Menunggu',
    valid: 'Valid',
    invalid: 'Tidak Valid',
};
const HabitatMonitoringList = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { monitoringHabitats, conservationAreas, updateMonitoringHabitat, deleteMonitoringHabitat, } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [areaFilter, setAreaFilter] = useState('all');
    const [validationFilter, setValidationFilter] = useState('all');
    const [editOpen, setEditOpen] = useState(false);
    const [editingHabitat, setEditingHabitat] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editForm, setEditForm] = useState({
        habitatValidation: 'pending',
        cardQuestion: '',
        collectedBy: '',
    });
    const formatDate = (date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const getAreaName = (areaId) => {
        const area = conservationAreas.find((item) => item.id === areaId);
        return area?.name ?? '-';
    };
    const getValidationBadge = (status) => {
        const className = status === 'valid'
            ? 'border-status-approved/30 bg-status-approved-bg text-status-approved'
            : status === 'invalid'
                ? 'border-status-rejected/30 bg-status-rejected-bg text-status-rejected'
                : 'border-status-pending/30 bg-status-pending-bg text-status-pending';
        return (<Badge variant="outline" className={className}>
        {validationLabels[status]}
      </Badge>);
    };
    const filteredHabitats = monitoringHabitats.filter((item) => {
        const query = searchQuery.toLowerCase();
        const areaName = getAreaName(item.conservationAreaId).toLowerCase();
        const matchesSearch = item.monitoringCode.toLowerCase().includes(query) ||
            item.siteName.toLowerCase().includes(query) ||
            item.collectedBy.toLowerCase().includes(query) ||
            areaName.includes(query);
        const matchesArea = areaFilter === 'all' || item.conservationAreaId === areaFilter;
        const matchesValidation = validationFilter === 'all' || item.habitatValidation === validationFilter;
        return matchesSearch && matchesArea && matchesValidation;
    });
    const openEdit = (habitat) => {
        setEditingHabitat(habitat);
        setEditForm({
            habitatValidation: habitat.habitatValidation,
            cardQuestion: habitat.cardQuestion,
            collectedBy: habitat.collectedBy,
        });
        setEditOpen(true);
    };
    const handleEditSubmit = (event) => {
        event.preventDefault();
        if (!editingHabitat)
            return;
        updateMonitoringHabitat(editingHabitat.id, {
            habitatValidation: editForm.habitatValidation,
            cardQuestion: editForm.cardQuestion.trim(),
            collectedBy: editForm.collectedBy.trim(),
        });
        toast({
            title: 'Berhasil',
            description: 'Monitoring habitat diperbarui.',
        });
        setEditOpen(false);
        setEditingHabitat(null);
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteMonitoringHabitat(deleteTarget.id);
        toast({
            title: 'Berhasil',
            description: 'Monitoring habitat dihapus.',
        });
        setDeleteTarget(null);
    };
    return (<MainLayout title="Monitoring Habitat" subtitle="Rekap monitoring habitat konservasi">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TreePine className="h-5 w-5 text-primary"/>
              Monitoring Habitat ({monitoringHabitats.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari kode, lokasi..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-card"/>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Area</label>
                    <Select value={areaFilter} onValueChange={(value) => setAreaFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {conservationAreas.map((area) => (<SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Validasi</label>
                    <Select value={validationFilter} onValueChange={(value) => setValidationFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {validationOptions.map((status) => (<SelectItem key={status} value={status}>
                            {validationLabels[status]}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setAreaFilter('all');
                setValidationFilter('all');
            }}>
                      Atur Ulang Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="min-w-[950px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Kode</TableHead>
                  <TableHead className="font-semibold">Area & Site</TableHead>
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold">Validasi</TableHead>
                  <TableHead className="font-semibold">Pengumpul</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHabitats.map((item) => (<TableRow key={item.id}>
                    <TableCell className="text-sm font-medium">{item.monitoringCode}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{getAreaName(item.conservationAreaId)}</p>
                        <p className="text-xs text-muted-foreground">{item.siteName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(item.monitoringTime)}</TableCell>
                    <TableCell>{getValidationBadge(item.habitatValidation)}</TableCell>
                    <TableCell className="text-sm">{item.collectedBy}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70" onClick={() => navigate(`/monitoring-habitat/${item.id}`)}>
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
                {filteredHabitats.length === 0 && (<TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      Tidak ada data monitoring habitat yang cocok.
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
            <DialogTitle>Ubah Monitoring Habitat</DialogTitle>
            <DialogDescription>Perbarui status validasi dan catatan kartu.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Validasi</Label>
              <Select value={editForm.habitatValidation} onValueChange={(value) => setEditForm((prev) => ({ ...prev, habitatValidation: value }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {validationOptions.map((status) => (<SelectItem key={status} value={status}>
                      {validationLabels[status]}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectedBy">Pengumpul</Label>
              <Input id="collectedBy" value={editForm.collectedBy} onChange={(event) => setEditForm((prev) => ({ ...prev, collectedBy: event.target.value }))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardQuestion">Catatan Kartu</Label>
              <Textarea id="cardQuestion" value={editForm.cardQuestion} onChange={(event) => setEditForm((prev) => ({ ...prev, cardQuestion: event.target.value }))}/>
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
            <AlertDialogTitle>Hapus Monitoring Habitat</AlertDialogTitle>
            <AlertDialogDescription>
              Monitoring {deleteTarget?.monitoringCode} akan dihapus. Lanjutkan?
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
export default HabitatMonitoringList;
