import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Fish, Filter, Search } from 'lucide-react';
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
const MegafaunaObservationList = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { megafaunaObservations, updateMegafaunaObservation, deleteMegafaunaObservation } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [speciesFilter, setSpeciesFilter] = useState('all');
    const [areaFilter, setAreaFilter] = useState('all');
    const [editOpen, setEditOpen] = useState(false);
    const [editingObservation, setEditingObservation] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editForm, setEditForm] = useState({
        behavior: '',
        count: 0,
        locationName: '',
    });
    const speciesOptions = Array.from(new Set(megafaunaObservations.map((item) => item.speciesName)));
    const areaOptions = Array.from(new Set(megafaunaObservations.map((item) => item.areaName)));
    const formatDate = (date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const filteredObservations = megafaunaObservations.filter((item) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = item.speciesName.toLowerCase().includes(query) ||
            item.locationName.toLowerCase().includes(query) ||
            item.areaName.toLowerCase().includes(query) ||
            item.stationName.toLowerCase().includes(query);
        const matchesSpecies = speciesFilter === 'all' || item.speciesName === speciesFilter;
        const matchesArea = areaFilter === 'all' || item.areaName === areaFilter;
        return matchesSearch && matchesSpecies && matchesArea;
    });
    const openEdit = (observation) => {
        setEditingObservation(observation);
        setEditForm({
            behavior: observation.behavior,
            count: observation.count,
            locationName: observation.locationName,
        });
        setEditOpen(true);
    };
    const handleEditSubmit = (event) => {
        event.preventDefault();
        if (!editingObservation)
            return;
        updateMegafaunaObservation(editingObservation.id, {
            behavior: editForm.behavior.trim(),
            count: Number(editForm.count) || 0,
            locationName: editForm.locationName.trim(),
        });
        toast({
            title: 'Berhasil',
            description: 'Observasi megafauna diperbarui.',
        });
        setEditOpen(false);
        setEditingObservation(null);
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteMegafaunaObservation(deleteTarget.id);
        toast({
            title: 'Berhasil',
            description: 'Data megafauna dihapus.',
        });
        setDeleteTarget(null);
    };
    return (<MainLayout title="Observasi Megafauna" subtitle="Rekap observasi megafauna patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Fish className="h-5 w-5 text-primary"/>
              Observasi ({megafaunaObservations.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari spesies, lokasi..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-card"/>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Spesies</label>
                    <Select value={speciesFilter} onValueChange={(value) => setSpeciesFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {speciesOptions.map((species) => (<SelectItem key={species} value={species}>
                            {species}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Area</label>
                    <Select value={areaFilter} onValueChange={(value) => setAreaFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {areaOptions.map((area) => (<SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setSpeciesFilter('all');
                setAreaFilter('all');
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
                  <TableHead className="font-semibold">Spesies</TableHead>
                  <TableHead className="font-semibold">Jumlah</TableHead>
                  <TableHead className="font-semibold">Lokasi</TableHead>
                  <TableHead className="font-semibold">Perilaku</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObservations.map((item) => (<TableRow key={item.id}>
                    <TableCell className="text-sm font-medium">{formatDate(item.observationTime)}</TableCell>
                    <TableCell className="text-sm">{item.speciesName}</TableCell>
                    <TableCell className="text-sm">{item.count}</TableCell>
                    <TableCell className="text-sm">{item.locationName}</TableCell>
                    <TableCell className="text-sm">{item.behavior}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70" onClick={() => navigate(`/monitoring-megafauna/${item.id}`)}>
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
                {filteredObservations.length === 0 && (<TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      Tidak ada observasi yang cocok dengan pencarian.
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
            <DialogTitle>Ubah Observasi Megafauna</DialogTitle>
            <DialogDescription>Perbarui perilaku dan lokasi observasi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Lokasi</Label>
              <Input id="locationName" value={editForm.locationName} onChange={(event) => setEditForm((prev) => ({ ...prev, locationName: event.target.value }))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="behavior">Perilaku</Label>
              <Textarea id="behavior" value={editForm.behavior} onChange={(event) => setEditForm((prev) => ({ ...prev, behavior: event.target.value }))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Jumlah</Label>
              <Input id="count" type="number" value={editForm.count} onChange={(event) => setEditForm((prev) => ({ ...prev, count: Number(event.target.value) }))}/>
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
            <AlertDialogTitle>Hapus Observasi Megafauna</AlertDialogTitle>
            <AlertDialogDescription>
              Observasi {deleteTarget?.speciesName} akan dihapus. Lanjutkan?
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
export default MegafaunaObservationList;
