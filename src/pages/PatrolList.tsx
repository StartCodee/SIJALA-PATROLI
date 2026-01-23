import { useNavigate } from 'react-router-dom';
import { Route, Plus, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { AREA_NAMES, Patrol } from '@/data/mockData';
import { useState } from 'react';

const PatrolList = () => {
  const navigate = useNavigate();
  const { patrols, vessels, addPatrol } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getInitialFormData = () => ({
    code: '',
    date: new Date().toISOString().split('T')[0],
    areaName: '',
    vesselId: '',
    status: 'planned' as Patrol['status'],
    objective: '',
  });
  const [formData, setFormData] = useState(getInitialFormData);

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

  const handleCreateSubmit = (e: React.FormEvent) => {
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
      ? new Date(`${formData.date}T08:00:00`)
      : new Date();
    const endTime = formData.status === 'completed' ? new Date() : null;

    addPatrol({
      code: formData.code.trim(),
      date: formData.date,
      vesselId: formData.vesselId,
      status: formData.status,
      areaName: formData.areaName,
      startTime,
      endTime,
      objective: formData.objective.trim() || 'Patroli rutin',
    });

    toast({
      title: 'Berhasil',
      description: 'Patroli berhasil dibuat',
    });

    setIsSubmitting(false);
    setCreateOpen(false);
    setFormData(getInitialFormData());
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
                        <Input
                          id="code"
                          placeholder="PTR-2026-007"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Tanggal *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="areaName">Area Patroli *</Label>
                      <Select
                        value={formData.areaName}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, areaName: value }))}
                      >
                        <SelectTrigger id="areaName">
                          <SelectValue placeholder="Pilih area patroli" />
                        </SelectTrigger>
                        <SelectContent>
                          {AREA_NAMES.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vesselId">Kapal *</Label>
                      <Select
                        value={formData.vesselId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, vesselId: value }))}
                      >
                        <SelectTrigger id="vesselId">
                          <SelectValue placeholder="Pilih kapal patroli" />
                        </SelectTrigger>
                        <SelectContent>
                          {vessels.map((vessel) => (
                            <SelectItem key={vessel.id} value={vessel.id}>
                              {vessel.name} ({vessel.callSign})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Patrol['status'] }))}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Pilih status" />
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
                      <Textarea
                        id="objective"
                        placeholder="Ringkasan tujuan patroli..."
                        rows={3}
                        value={formData.objective}
                        onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                      />
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
