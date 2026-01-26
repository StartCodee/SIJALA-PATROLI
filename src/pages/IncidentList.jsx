import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileWarning, Filter, Plus, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { formatRelativeTime } from '@/data/mockData';
import { useState } from 'react';
import { IncidentForm } from '@/components/incidents/IncidentForm';
const IncidentList = () => {
    const navigate = useNavigate();
    const { incidents, vessels, patrols } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const categoryOptions = Array.from(new Set(incidents.map((incident) => incident.category)));
    const filteredIncidents = incidents.filter((incident) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = incident.title.toLowerCase().includes(query) || incident.category.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
        const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
        const matchesCategory = categoryFilter === 'all' || incident.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
    });
    const getVesselName = (vesselId) => {
        if (!vesselId)
            return '-';
        const vessel = vessels.find(v => v.id === vesselId);
        return vessel?.name || '-';
    };
    const getPatrolCode = (patrolId) => {
        if (!patrolId)
            return '-';
        const patrol = patrols.find(p => p.id === patrolId);
        return patrol?.code || '-';
    };
    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'high':
                return <Badge variant="destructive" className="text-xs">Tinggi</Badge>;
            case 'medium':
                return <Badge variant="secondary" className="text-xs bg-warning/15 text-warning border-warning/30">Sedang</Badge>;
            case 'low':
                return <Badge variant="secondary" className="text-xs">Rendah</Badge>;
            default:
                return null;
        }
    };
    return (<MainLayout title="Laporan Kejadian" subtitle="Kelola laporan kejadian patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-primary"/>
              Semua Laporan ({incidents.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Cari laporan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-card"/>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="w-4 h-4"/>
                Filter
                {showFilters ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
              </Button>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4"/>
                    Buat Laporan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Form Laporan Kejadian</DialogTitle>
                    <DialogDescription>
                      Isi informasi kejadian baru tanpa berpindah halaman.
                    </DialogDescription>
                  </DialogHeader>
                  <IncidentForm resetOnSuccess onCancel={() => setCreateOpen(false)} onSuccess={() => setCreateOpen(false)}/>
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
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="investigating">Investigasi</SelectItem>
                        <SelectItem value="closed">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Prioritas</label>
                    <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="high">Tinggi</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="low">Rendah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Kategori</label>
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">Semua</SelectItem>
                        {categoryOptions.map((category) => (<SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setStatusFilter('all');
                setSeverityFilter('all');
                setCategoryFilter('all');
            }}>
                      Atur Ulang Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Judul</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Prioritas</TableHead>
                  <TableHead className="font-semibold">Kapal</TableHead>
                  <TableHead className="font-semibold">Patroli</TableHead>
                  <TableHead className="font-semibold">Waktu</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (<TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/incidents/${incident.id}`)}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {incident.title}
                    </TableCell>
                    <TableCell className="text-sm">{incident.category}</TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} size="sm"/>
                    </TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell className="text-sm">{getVesselName(incident.vesselId)}</TableCell>
                    <TableCell className="text-sm font-mono">{getPatrolCode(incident.patrolId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(incident.time)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="border border-status-info/30 bg-status-info-bg text-status-info hover:bg-status-info-bg/70" onClick={(e) => {
                e.stopPropagation();
                navigate(`/incidents/${incident.id}`);
            }}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>);
};
export default IncidentList;
