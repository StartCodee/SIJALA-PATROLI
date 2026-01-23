import { useNavigate } from 'react-router-dom';
import { FileWarning, Plus, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { formatRelativeTime } from '@/data/mockData';
import { useState } from 'react';

const IncidentList = () => {
  const navigate = useNavigate();
  const { incidents, vessels, patrols } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVesselName = (vesselId: string | null) => {
    if (!vesselId) return '-';
    const vessel = vessels.find(v => v.id === vesselId);
    return vessel?.name || '-';
  };

  const getPatrolCode = (patrolId: string | null) => {
    if (!patrolId) return '-';
    const patrol = patrols.find(p => p.id === patrolId);
    return patrol?.code || '-';
  };

  const getSeverityBadge = (severity: string) => {
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

  return (
    <MainLayout title="Laporan Kejadian" subtitle="Kelola laporan kejadian patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-primary" />
              Semua Laporan ({incidents.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari laporan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button onClick={() => navigate('/incidents/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                Buat Laporan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                {filteredIncidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {incident.title}
                    </TableCell>
                    <TableCell className="text-sm">{incident.category}</TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} size="sm" />
                    </TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell className="text-sm">{getVesselName(incident.vesselId)}</TableCell>
                    <TableCell className="text-sm font-mono">{getPatrolCode(incident.patrolId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(incident.time)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/incidents/${incident.id}`);
                        }}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default IncidentList;
