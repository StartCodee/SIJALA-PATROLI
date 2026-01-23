import { useNavigate } from 'react-router-dom';
import { Route, Plus, Search } from 'lucide-react';
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
import { useState } from 'react';

const PatrolList = () => {
  const navigate = useNavigate();
  const { patrols, vessels } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatrols = patrols.filter(p =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.areaName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVesselName = (vesselId: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    return vessel?.name || '-';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <MainLayout title="Daftar Patroli" subtitle="Kelola jadwal dan riwayat patroli">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Semua Patroli ({patrols.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari patroli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button disabled className="gap-2">
                <Plus className="h-4 w-4" />
                Buat Patroli
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Kode</TableHead>
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold">Area</TableHead>
                  <TableHead className="font-semibold">Kapal</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatrols.map((patrol) => (
                  <TableRow
                    key={patrol.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/patrols/${patrol.id}`)}
                  >
                    <TableCell className="font-medium font-mono">{patrol.code}</TableCell>
                    <TableCell>{formatDate(patrol.date)}</TableCell>
                    <TableCell>{patrol.areaName}</TableCell>
                    <TableCell>{getVesselName(patrol.vesselId)}</TableCell>
                    <TableCell>
                      <StatusBadge status={patrol.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patrols/${patrol.id}`);
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

export default PatrolList;
