import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Filter, Navigation, Clock, Info } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { VesselListItem } from '@/components/shared/VesselListItem';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { getConnectionStatus, formatRelativeTime } from '@/data/mockData';
const LiveMonitoring = () => {
    const navigate = useNavigate();
    const { vessels, selectedVesselId, setSelectedVesselId, patrols } = useData();
    const [statusFilter, setStatusFilter] = useState('all');
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    // Filter vessels
    const filteredVessels = vessels.filter(v => {
        if (statusFilter === 'all')
            return true;
        if (statusFilter === 'aktif')
            return v.status === 'aktif';
        if (statusFilter === 'standby')
            return v.status === 'standby';
        if (statusFilter === 'maintenance')
            return v.status === 'maintenance';
        return true;
    });
    const selectedVessel = selectedVesselId
        ? vessels.find(v => v.id === selectedVesselId)
        : null;
    const handleVesselClick = (vessel) => {
        setSelectedVesselId(vessel.id);
    };
    const handleDetailClick = () => {
        setDetailSheetOpen(true);
    };
    const handleCenterClick = () => {
        // Placeholder for map centering
        console.log('Pusatkan ke kapal:', selectedVessel?.name);
    };
    const selectedPatrol = selectedVessel?.patrolId
        ? patrols.find(p => p.id === selectedVessel.patrolId)
        : null;
    return (<MainLayout title="Pemantauan Langsung" subtitle="Pemantauan posisi kapal secara waktu nyata">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Map Area - 70% */}
        <div className="lg:col-span-7">
          <MapCard title="Peta Pemantauan" selectedVessel={selectedVessel ? {
            name: selectedVessel.name,
            lat: selectedVessel.lastPosition.lat,
            lon: selectedVessel.lastPosition.lon,
        } : null} onCenterClick={selectedVessel ? handleCenterClick : undefined} className="h-[calc(100vh-180px)] min-h-[500px]"/>
        </div>

        {/* Vessel List Panel - 30% */}
        <div className="lg:col-span-3">
          <Card className="shadow-card h-[calc(100vh-180px)] min-h-[500px] flex flex-col">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary"/>
                  Daftar Kapal
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {filteredVessels.length} kapal
                </span>
              </div>
            
              {/* Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4"/>
                    <SelectValue placeholder="Saring status"/>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-sidebar text-sidebar-foreground border-sidebar-border">
                  <SelectItem value="all" className="data-[highlighted]:bg-sidebar-primary data-[highlighted]:text-sidebar-primary-foreground data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground">
                    Semua Status
                  </SelectItem>
                  <SelectItem value="aktif" className="data-[highlighted]:bg-sidebar-primary data-[highlighted]:text-sidebar-primary-foreground data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground">
                    Aktif
                  </SelectItem>
                  <SelectItem value="standby" className="data-[highlighted]:bg-sidebar-primary data-[highlighted]:text-sidebar-primary-foreground data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground">
                    Siaga
                  </SelectItem>
                  <SelectItem value="maintenance" className="data-[highlighted]:bg-sidebar-primary data-[highlighted]:text-sidebar-primary-foreground data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground">
                    Perawatan
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="divide-y divide-border">
                  {filteredVessels.map((vessel) => (<VesselListItem key={vessel.id} vessel={vessel} isSelected={vessel.id === selectedVesselId} onClick={() => handleVesselClick(vessel)} onDetailClick={handleDetailClick}/>))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vessel Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ship className="h-5 w-5 text-primary"/>
              </div>
              <div>
                <span>{selectedVessel?.name}</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  {selectedVessel?.callSign}
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>

          {selectedVessel && (<div className="mt-6 space-y-6">
              {/* Status Section */}
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedVessel.status}/>
                <StatusBadge status={getConnectionStatus(selectedVessel.lastPosition.timestamp)}/>
              </div>

              {/* Position Info */}
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary"/>
                    Posisi Terakhir
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Lintang</p>
                      <p className="text-sm font-medium font-mono">
                        {selectedVessel.lastPosition.lat.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bujur</p>
                      <p className="text-sm font-medium font-mono">
                        {selectedVessel.lastPosition.lon.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kecepatan</p>
                      <p className="text-sm font-medium">
                        {selectedVessel.lastPosition.speed} knot
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Arah</p>
                      <p className="text-sm font-medium">
                        {selectedVessel.lastPosition.heading}°
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                    <Clock className="h-4 w-4"/>
                    <span>Pembaruan: {formatRelativeTime(selectedVessel.lastPosition.timestamp)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Vessel Info */}
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary"/>
                    Informasi Kapal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tipe</span>
                    <span className="text-sm font-medium">{selectedVessel.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Kapten</span>
                    <span className="text-sm font-medium">{selectedVessel.captain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Kru</span>
                    <span className="text-sm font-medium">{selectedVessel.crew} orang</span>
                  </div>
                  {selectedPatrol && (<div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Patroli</span>
                      <span className="text-sm font-medium">{selectedPatrol.code}</span>
                    </div>)}
                </CardContent>
              </Card>

              {/* Actions */}
              <Button className="w-full" onClick={() => {
                setDetailSheetOpen(false);
                navigate(`/vessels/${selectedVessel.id}`);
            }}>
                Buka Detail Kapal
              </Button>
            </div>)}
        </SheetContent>
      </Sheet>
    </MainLayout>);
};
export default LiveMonitoring;
