import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, Plus, Route, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { AREA_NAMES } from '@/data/mockData';
import { useState } from 'react';
const PatrolList = () => {
    const navigate = useNavigate();
    const { patrols, vessels, guardPosts, conservationAreas, addPatrol } = useData();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [areaFilter, setAreaFilter] = useState('all');
    const [vesselFilter, setVesselFilter] = useState('all');
    const [postFilter, setPostFilter] = useState('all');
    const [validationFilter, setValidationFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const getInitialFormData = () => ({
        code: '',
        date: new Date().toISOString().split('T')[0],
        areaName: '',
        conservationAreaId: conservationAreas[0]?.id ?? '',
        postId: guardPosts[0]?.id ?? '',
        vesselId: '',
        status: 'planned',
        objective: '',
        departureTime: '08:00',
        patrolDays: 1,
    });
    const [formData, setFormData] = useState(getInitialFormData);
    const filteredPatrols = patrols.filter((patrol) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = patrol.code.toLowerCase().includes(query) || patrol.areaName.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || patrol.status === statusFilter;
        const matchesArea = areaFilter === 'all' || patrol.conservationAreaId === areaFilter;
        const matchesVessel = vesselFilter === 'all' || patrol.vesselId === vesselFilter;
        const matchesPost = postFilter === 'all' || patrol.postId === postFilter;
        const matchesValidation = validationFilter === 'all' || patrol.patrolValidation === validationFilter;
        return matchesSearch && matchesStatus && matchesArea && matchesVessel && matchesPost && matchesValidation;
    });
    const getVesselName = (vesselId) => {
        const vessel = vessels.find(v => v.id === vesselId);
        return vessel?.name || '-';
    };
    const getConservationAreaName = (areaId) => {
        const area = conservationAreas.find((item) => item.id === areaId);
        return area ? `${area.code} - ${area.name}` : '-';
    };
    const getPostName = (postId) => {
        const post = guardPosts.find((item) => item.id === postId);
        return post?.name ?? '-';
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };
    const formatLiters = (value) => `${value.toLocaleString('id-ID')} L`;
    const validationLabels = {
        pending: 'Menunggu',
        validated: 'Tervalidasi',
        rejected: 'Ditolak',
    };
    const validationClasses = {
        pending: 'bg-warning/15 text-warning border-warning/30',
        validated: 'bg-success/15 text-success border-success/30',
        rejected: 'bg-destructive/15 text-destructive border-destructive/30',
    };
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!formData.code.trim()) {
            toast({
                title: 'Error',
                description: 'Kode patroli wajib diisi',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.date) {
            toast({
                title: 'Error',
                description: 'Tanggal patroli wajib diisi',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.areaName) {
            toast({
                title: 'Error',
                description: 'Area patroli wajib dipilih',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.conservationAreaId) {
            toast({
                title: 'Error',
                description: 'Area konservasi wajib dipilih',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.postId) {
            toast({
                title: 'Error',
                description: 'Pos jaga wajib dipilih',
                variant: 'destructive',
            });
            return;
        }
        if (!formData.vesselId) {
            toast({
                title: 'Error',
                description: 'Kapal patroli wajib dipilih',
                variant: 'destructive',
            });
            return;
        }
        setIsSubmitting(true);
        const startTime = formData.date
            ? new Date(`${formData.date}T${formData.departureTime || '08:00'}:00`)
            : new Date();
        const endTime = formData.status === 'completed' ? new Date() : null;
        const fuelStartLiters = 1000;
        const fuelRemainingLiters = formData.status === 'completed' ? 550 : 850;
        addPatrol({
            code: formData.code.trim(),
            date: formData.date,
            vesselId: formData.vesselId,
            status: formData.status,
            areaName: formData.areaName,
            startTime,
            endTime,
            objective: formData.objective.trim() || 'Patroli rutin',
            conservationAreaId: formData.conservationAreaId || conservationAreas[0]?.id || 'ca-01',
            postId: formData.postId || guardPosts[0]?.id || 'gp-01',
            departureTime: formData.departureTime || '08:00',
            patrolDays: formData.patrolDays || 1,
            fuelStartLiters,
            fuelRemainingLiters,
            fuelUsedLiters: Math.max(0, fuelStartLiters - fuelRemainingLiters),
            overnightLocation: guardPosts.find((post) => post.id === formData.postId)?.name || 'Pelabuhan Sorong',
            areaDescription: formData.areaName || 'Area patroli',
            hasNonPermanentResources: false,
            hasPermanentResources: false,
            hasMegafaunaObservation: false,
            patrolValidation: 'pending',
            collectedBy: 'Admin Sistem',
            collectedAt: new Date(),
        });
        toast({
            title: 'Berhasil',
            description: 'Patroli berhasil dibuat',
        });
        setIsSubmitting(false);
        setCreateOpen(false);
        setFormData(getInitialFormData());
    };
    return (<MainLayout title="Daftar Patroli" subtitle="Kelola jadwal dan riwayat patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-primary"/>
              Semua Patroli ({patrols.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari patroli..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-card"/>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="w-4 h-4"/>
                Filter
                {showFilters ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
              </Button>
              <Dialog open={createOpen} onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) {
                setFormData(getInitialFormData());
            }
        }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4"/>
                    Buat Patroli
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Form Patroli Baru</DialogTitle>
                    <DialogDescription>
                      Tambahkan jadwal patroli tanpa berpindah halaman.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="code">Kode Patroli *</Label>
                        <Input id="code" placeholder="PTR-2026-007" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Tanggal *</Label>
                        <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}/>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Area Konservasi *</Label>
                        <Select value={formData.conservationAreaId} onValueChange={(value) => setFormData(prev => ({ ...prev, conservationAreaId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih area konservasi"/>
                          </SelectTrigger>
                          <SelectContent>
                            {conservationAreas.map((area) => (<SelectItem key={area.id} value={area.id}>
                                {area.code} - {area.name}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Pos Jaga *</Label>
                        <Select value={formData.postId} onValueChange={(value) => setFormData(prev => ({ ...prev, postId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pos jaga"/>
                          </SelectTrigger>
                          <SelectContent>
                            {guardPosts.map((post) => (<SelectItem key={post.id} value={post.id}>
                                {post.name}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="areaName">Area Patroli *</Label>
                        <Select value={formData.areaName} onValueChange={(value) => setFormData(prev => ({ ...prev, areaName: value }))}>
                          <SelectTrigger id="areaName">
                            <SelectValue placeholder="Pilih area patroli"/>
                          </SelectTrigger>
                          <SelectContent>
                            {AREA_NAMES.map((area) => (<SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="departureTime">Jam Berangkat</Label>
                        <Input id="departureTime" type="time" value={formData.departureTime} onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}/>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="vesselId">Kapal *</Label>
                        <Select value={formData.vesselId} onValueChange={(value) => setFormData(prev => ({ ...prev, vesselId: value }))}>
                          <SelectTrigger id="vesselId">
                            <SelectValue placeholder="Pilih kapal patroli"/>
                          </SelectTrigger>
                          <SelectContent>
                            {vessels.map((vessel) => (<SelectItem key={vessel.id} value={vessel.id}>
                                {vessel.name} ({vessel.callSign})
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patrolDays">Durasi (hari)</Label>
                        <Input id="patrolDays" type="number" min={1} value={formData.patrolDays} onChange={(e) => setFormData(prev => ({ ...prev, patrolDays: Number(e.target.value) || 1 }))}/>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Pilih status"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Direncanakan</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objective">Tujuan Patroli</Label>
                      <Textarea id="objective" placeholder="Ringkasan tujuan patroli..." rows={3} value={formData.objective} onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}/>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Patroli'}
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="planned">Direncanakan</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Area Konservasi</label>
                    <Select value={areaFilter} onValueChange={(value) => setAreaFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {conservationAreas.map((area) => (<SelectItem key={area.id} value={area.id}>
                            {area.code} - {area.name}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Kapal</label>
                    <Select value={vesselFilter} onValueChange={(value) => setVesselFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {vessels.map((vessel) => (<SelectItem key={vessel.id} value={vessel.id}>
                            {vessel.name} ({vessel.callSign})
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
                        {guardPosts.map((post) => (<SelectItem key={post.id} value={post.id}>
                            {post.name}
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
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="validated">Tervalidasi</SelectItem>
                        <SelectItem value="rejected">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setStatusFilter('all');
                setAreaFilter('all');
                setVesselFilter('all');
                setPostFilter('all');
                setValidationFilter('all');
            }}>
                      Atur Ulang Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Patroli</TableHead>
                  <TableHead className="font-semibold">Area/Pos</TableHead>
                  <TableHead className="font-semibold">BBM</TableHead>
                  <TableHead className="font-semibold">Flag</TableHead>
                  <TableHead className="font-semibold">Validasi</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatrols.map((patrol) => (<TableRow key={patrol.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/patrols/${patrol.id}`)}>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-semibold font-mono">{patrol.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(patrol.date)} • {patrol.departureTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {patrol.patrolDays} hari • {getVesselName(patrol.vesselId)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{getConservationAreaName(patrol.conservationAreaId)}</p>
                        <p className="text-xs text-muted-foreground">{patrol.areaName}</p>
                        <p className="text-xs text-muted-foreground">{getPostName(patrol.postId)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Mulai: <span className="text-foreground">{formatLiters(patrol.fuelStartLiters)}</span></p>
                        <p>Terpakai: <span className="text-foreground">{formatLiters(patrol.fuelUsedLiters)}</span></p>
                        <p>Sisa: <span className="text-foreground">{formatLiters(patrol.fuelRemainingLiters)}</span></p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patrol.hasNonPermanentResources && (<Badge variant="outline" className="text-[10px]">
                            Non-Permanen
                          </Badge>)}
                        {patrol.hasPermanentResources && (<Badge variant="outline" className="text-[10px]">
                            Permanen
                          </Badge>)}
                        {patrol.hasMegafaunaObservation && (<Badge variant="outline" className="text-[10px]">
                            Megafauna
                          </Badge>)}
                        {!patrol.hasNonPermanentResources &&
                !patrol.hasPermanentResources &&
                !patrol.hasMegafaunaObservation && (<span className="text-xs text-muted-foreground">-</span>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <Badge className={`border ${validationClasses[patrol.patrolValidation]}`}>
                          {validationLabels[patrol.patrolValidation]}
                        </Badge>
                        <p>{patrol.collectedBy}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={patrol.status} size="sm"/>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70" onClick={(e) => {
                e.stopPropagation();
                navigate(`/patrols/${patrol.id}`);
            }}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>))}
                {filteredPatrols.length === 0 && (<TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      Tidak ada patroli yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>);
};
export default PatrolList;
