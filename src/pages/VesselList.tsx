import { useNavigate } from 'react-router-dom';
import { Ship, Plus, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { getConnectionStatus, formatRelativeTime } from '@/data/mockData';
import { useState } from 'react';

const VesselList = () => {
  const navigate = useNavigate();
  const { vessels, patrols } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVessels = vessels.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.callSign.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPatrolCode = (patrolId: string | null) => {
    if (!patrolId) return '-';
    const patrol = patrols.find(p => p.id === patrolId);
    return patrol?.code || '-';
  };

  return (
    <MainLayout title="Daftar Kapal" subtitle="Kelola armada kapal patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Semua Kapal ({vessels.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari kapal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button disabled className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Kapal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Nama Kapal</TableHead>
                  <TableHead className="font-semibold">Call Sign</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Koneksi</TableHead>
                  <TableHead className="font-semibold">Patroli</TableHead>
                  <TableHead className="font-semibold">Kapten</TableHead>
                  <TableHead className="font-semibold">Last Update</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVessels.map((vessel) => (
                  <TableRow
                    key={vessel.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/vessels/${vessel.id}`)}
                  >
                    <TableCell className="font-medium">{vessel.name}</TableCell>
                    <TableCell className="font-mono text-sm">{vessel.callSign}</TableCell>
                    <TableCell>
                      <StatusBadge status={vessel.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={getConnectionStatus(vessel.lastPosition.timestamp)}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-sm">{getPatrolCode(vessel.patrolId)}</TableCell>
                    <TableCell className="text-sm">{vessel.captain}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(vessel.lastPosition.timestamp)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vessels/${vessel.id}`);
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

export default VesselList;
