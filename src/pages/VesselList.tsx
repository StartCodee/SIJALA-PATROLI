import { useNavigate } from 'react-router-dom';
import { Ship, Plus, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { getConnectionStatus, formatRelativeTime, Vessel } from '@/data/mockData';
import { useState } from 'react';

const VesselList = () => {
  const navigate = useNavigate();
  const { vessels, patrols, addVessel } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getInitialFormData = () => ({
    name: '',
    callSign: '',
    status: 'standby' as Vessel['status'],
    captain: '',
    crew: '',
    type: '',
  });
  const [formData, setFormData] = useState(getInitialFormData);

  const filteredVessels = vessels.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.callSign.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPatrolCode = (patrolId: string | null) => {
    if (!patrolId) return '-';
    const patrol = patrols.find(p => p.id === patrolId);
    return patrol?.code || '-';
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Nama kapal wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.callSign.trim()) {
      toast({
        title: 'Error',
        description: 'Call sign wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.captain.trim()) {
      toast({
        title: 'Error',
        description: 'Nama kapten wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    const crewCount = Number.parseInt(formData.crew, 10);
    if (!Number.isFinite(crewCount) || crewCount <= 0) {
      toast({
        title: 'Error',
        description: 'Jumlah kru wajib diisi dengan angka',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.type.trim()) {
      toast({
        title: 'Error',
        description: 'Tipe kapal wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const basePosition = vessels[0]?.lastPosition ?? {
      lat: 0,
      lon: 0,
      speed: 0,
      heading: 0,
      timestamp: new Date(),
    };
    const offset = () => (Math.random() - 0.5) * 0.01;

    addVessel({
      name: formData.name.trim(),
      callSign: formData.callSign.trim(),
      status: formData.status,
      patrolId: null,
      lastPosition: {
        lat: basePosition.lat + offset(),
        lon: basePosition.lon + offset(),
        speed: formData.status === 'aktif' ? 8 : 0,
        heading: 0,
        timestamp: new Date(),
      },
      captain: formData.captain.trim(),
      crew: crewCount,
      type: formData.type.trim(),
    });

    toast({
      title: 'Berhasil',
      description: 'Kapal berhasil ditambahkan',
    });

    setIsSubmitting(false);
    setCreateOpen(false);
    setFormData(getInitialFormData());
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
              <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                  setCreateOpen(open);
                  if (!open) {
                    setFormData(getInitialFormData());
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Kapal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Form Kapal Baru</DialogTitle>
                    <DialogDescription>
                      Tambahkan kapal patroli baru tanpa berpindah halaman.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Kapal *</Label>
                        <Input
                          id="name"
                          placeholder="KP. Raja Ampat"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="callSign">Call Sign *</Label>
                        <Input
                          id="callSign"
                          placeholder="RA-08"
                          value={formData.callSign}
                          onChange={(e) => setFormData(prev => ({ ...prev, callSign: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Vessel['status'] }))}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aktif">Aktif</SelectItem>
                            <SelectItem value="standby">Standby</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crew">Jumlah Kru *</Label>
                        <Input
                          id="crew"
                          type="number"
                          min={1}
                          placeholder="6"
                          value={formData.crew}
                          onChange={(e) => setFormData(prev => ({ ...prev, crew: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="captain">Kapten *</Label>
                        <Input
                          id="captain"
                          placeholder="Kapten Lukas"
                          value={formData.captain}
                          onChange={(e) => setFormData(prev => ({ ...prev, captain: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipe Kapal *</Label>
                        <Input
                          id="type"
                          placeholder="Kapal Patroli Cepat"
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Kapal'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
