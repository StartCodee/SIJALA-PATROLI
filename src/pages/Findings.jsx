import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';
const Findings = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { findings, vesselTypes, vesselSubtypes, updateFinding, deleteFinding, } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [zoneFilter, setZoneFilter] = useState('all');
    const [vesselTypeFilter, setVesselTypeFilter] = useState('all');
    const [cardFilter, setCardFilter] = useState('all');
    const [editOpen, setEditOpen] = useState(false);
    const [editingFinding, setEditingFinding] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editForm, setEditForm] = useState({
        violationDetails: '',
        actionTaken: '',
        hasTlpjlCard: false,
    });
    const zones = Array.from(new Set(findings.map((finding) => finding.zone)));
    const getVesselTypeName = (id) => {
        const vesselType = vesselTypes.find((item) => item.id === id);
        return vesselType?.name ?? '-';
    };
    const getVesselSubtypeName = (id) => {
        if (!id)
            return '-';
        const subtype = vesselSubtypes.find((item) => item.id === id);
        return subtype?.name ?? '-';
    };
    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };
    const filteredFindings = findings.filter((finding) => {
        const query = searchQuery.toLowerCase();
        const vesselTypeName = getVesselTypeName(finding.vesselTypeId).toLowerCase();
        const vesselSubtypeName = getVesselSubtypeName(finding.vesselSubtypeId).toLowerCase();
        const matchesSearch = finding.locationName.toLowerCase().includes(query) ||
            finding.gpsId.toLowerCase().includes(query) ||
            finding.violationDetails.toLowerCase().includes(query) ||
            vesselTypeName.includes(query) ||
            vesselSubtypeName.includes(query);
        const matchesZone = zoneFilter === 'all' || finding.zone === zoneFilter;
        const matchesVesselType = vesselTypeFilter === 'all' || finding.vesselTypeId === vesselTypeFilter;
        const matchesCard = cardFilter === 'all' ||
            (cardFilter === 'yes' ? finding.hasTlpjlCard : !finding.hasTlpjlCard);
        return matchesSearch && matchesZone && matchesVesselType && matchesCard;
    });
    const openEdit = (finding) => {
        setEditingFinding(finding);
        setEditForm({
            violationDetails: finding.violationDetails,
            actionTaken: finding.actionTaken,
            hasTlpjlCard: finding.hasTlpjlCard,
        });
        setEditOpen(true);
    };
    const handleEditSubmit = (event) => {
        event.preventDefault();
        if (!editingFinding)
            return;
        updateFinding(editingFinding.id, {
            violationDetails: editForm.violationDetails.trim(),
            actionTaken: editForm.actionTaken.trim(),
            hasTlpjlCard: editForm.hasTlpjlCard,
        });
        toast({
            title: 'Berhasil',
            description: 'Temuan berhasil diperbarui',
        });
        setEditOpen(false);
        setEditingFinding(null);
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteFinding(deleteTarget.id);
        toast({
            title: 'Berhasil',
            description: 'Temuan berhasil dihapus',
        });
        setDeleteTarget(null);
    };
    return (<MainLayout title="Temuan" subtitle="Rekap data temuan patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary"/>
              Daftar Temuan ({findings.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari lokasi, GPS, pelanggaran..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-card"/>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zona</label>
                    <Select value={zoneFilter} onValueChange={(value) => setZoneFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {zones.map((zone) => (<SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipe Kapal</label>
                    <Select value={vesselTypeFilter} onValueChange={(value) => setVesselTypeFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {vesselTypes.map((type) => (<SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Kartu TLPJL</label>
                    <Select value={cardFilter} onValueChange={(value) => setCardFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="yes">Ada</SelectItem>
                        <SelectItem value="no">Tidak Ada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setZoneFilter('all');
                setVesselTypeFilter('all');
                setCardFilter('all');
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
                  <TableHead className="font-semibold w-[200px]">Tanggal</TableHead>
                  <TableHead className="font-semibold w-[220px]">Kapal</TableHead>
                  <TableHead className="font-semibold w-[180px]">Zona</TableHead>
                  <TableHead className="font-semibold w-[140px]">TLPJL</TableHead>
                  <TableHead className="font-semibold w-[140px]">Foto</TableHead>
                  <TableHead className="font-semibold text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFindings.map((finding) => (<TableRow key={finding.id}>
                      <TableCell className="py-4 align-top">
                        <p className="text-sm font-semibold text-foreground">
                          {formatDate(finding.findingTime)}
                        </p>
                      </TableCell>
                      <TableCell className="py-4 align-top">
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {getVesselTypeName(finding.vesselTypeId)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{finding.zone}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 align-top">
                        <Badge variant="outline" className={finding.hasTlpjlCard
                ? 'border-status-approved/30 bg-status-approved-bg text-status-approved'
                : 'border-status-rejected/30 bg-status-rejected-bg text-status-rejected'}>
                          {finding.hasTlpjlCard ? 'Ada' : 'Tidak Ada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 align-top text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <img src={finding.imageUrl} alt={`Foto temuan ${finding.locationName}`} className="h-10 w-10 rounded-lg object-cover border border-border" loading="lazy"/>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 align-top text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm" className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70" onClick={() => navigate(`/findings/${finding.id}`)}>
                            Detail
                          </Button>
                          <Button variant="ghost" size="sm" className="border border-status-pending/30 bg-status-pending-bg text-status-pending hover:bg-status-pending-bg/70" onClick={() => openEdit(finding)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="border border-status-rejected/30 bg-status-rejected-bg text-status-rejected hover:bg-status-rejected-bg/70" onClick={() => setDeleteTarget(finding)}>
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>))}
                {filteredFindings.length === 0 && (<TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      Tidak ada temuan yang cocok dengan pencarian.
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
            <DialogTitle>Ubah Temuan</DialogTitle>
            <DialogDescription>Perbarui informasi pelanggaran dan tindak lanjut.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="violationDetails">Detail Pelanggaran</Label>
              <Input id="violationDetails" value={editForm.violationDetails} onChange={(event) => setEditForm((prev) => ({ ...prev, violationDetails: event.target.value }))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionTaken">Tindak Lanjut</Label>
              <Input id="actionTaken" value={editForm.actionTaken} onChange={(event) => setEditForm((prev) => ({ ...prev, actionTaken: event.target.value }))}/>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="hasTlpjlCard" checked={editForm.hasTlpjlCard} onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, hasTlpjlCard: Boolean(checked) }))}/>
              <Label htmlFor="hasTlpjlCard">Memiliki Kartu TLPJL</Label>
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
            <AlertDialogTitle>Hapus Temuan</AlertDialogTitle>
            <AlertDialogDescription>
              Temuan {deleteTarget?.locationName} akan dihapus. Lanjutkan?
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
export default Findings;
