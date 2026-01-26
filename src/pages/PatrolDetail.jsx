import { useParams, useNavigate } from 'react-router-dom';
import { Route, ArrowLeft, Ship, MapPin, Calendar, Target, Clock, FileWarning, Camera, Users, Package, Sprout, Fish, } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { formatRelativeTime } from '@/data/mockData';
const PatrolDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getPatrolById, getVesselById, getIncidentsByPatrolId, getAssignmentsByPatrolId, guardPosts, conservationAreas, crew, patrolEquipment, gearTypes, nonPermanentResources, permanentResources, megafaunaObservations, trackPoints, findings, } = useData();
    const patrol = id ? getPatrolById(id) : undefined;
    const vessel = patrol ? getVesselById(patrol.vesselId) : undefined;
    const incidents = id ? getIncidentsByPatrolId(id) : [];
    const assignments = id ? getAssignmentsByPatrolId(id) : [];
    const patrolFindings = patrol ? findings.filter((finding) => finding.patrolId === patrol.id) : [];
    const patrolEquipmentItems = patrol
        ? patrolEquipment.filter((item) => item.patrolId === patrol.id)
        : [];
    const patrolNonPermanent = patrol
        ? nonPermanentResources.filter((item) => item.patrolId === patrol.id)
        : [];
    const patrolPermanent = patrol
        ? permanentResources.filter((item) => item.patrolId === patrol.id)
        : [];
    const patrolMegafauna = patrol
        ? megafaunaObservations.filter((item) => item.patrolId === patrol.id)
        : [];
    if (!patrol) {
        return (<MainLayout title="Patroli Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Patroli dengan ID tersebut tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/patrols')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>);
    }
    const formatDateTime = (date) => {
        return date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const roleLabels = {
        kapten: 'Kapten',
        navigator: 'Navigator',
        teknisi: 'Teknisi',
        operator: 'Operator',
        medis: 'Medis',
        petugas: 'Petugas',
    };
    const validationLabels = {
        pending: 'Menunggu',
        validated: 'Tervalidasi',
        rejected: 'Ditolak',
    };
    const getConservationAreaName = (areaId) => {
        const area = conservationAreas.find((item) => item.id === areaId);
        return area ? `${area.code} - ${area.name}` : '-';
    };
    const getPostName = (postId) => {
        const post = guardPosts.find((item) => item.id === postId);
        return post?.name ?? '-';
    };
    const getCrewName = (crewId) => {
        const member = crew.find((item) => item.id === crewId);
        return member?.name ?? '-';
    };
    const getGearTypeName = (gearTypeId) => {
        const gear = gearTypes.find((item) => item.id === gearTypeId);
        return gear?.name ?? 'Lainnya';
    };
    const patrolTrackPoints = patrol
        ? trackPoints
            .filter((point) => {
            if (point.vesselId !== patrol.vesselId)
                return false;
            if (point.timestamp < patrol.startTime)
                return false;
            if (patrol.endTime && point.timestamp > patrol.endTime)
                return false;
            return true;
        })
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        : [];
    const patrolPath = patrolTrackPoints.map((point) => ({ lat: point.lat, lon: point.lon }));
    const mapMarkers = [
        ...patrolFindings.map((finding) => ({
            lat: finding.latitude,
            lon: finding.longitude,
            label: 'Temuan',
            description: finding.locationName || 'Temuan patroli',
            color: '#ef4444',
        })),
        ...patrolNonPermanent.map((resource) => ({
            lat: resource.location.lat,
            lon: resource.location.lon,
            label: 'Non-Permanen',
            description: resource.activity,
            color: '#f59e0b',
        })),
        ...patrolPermanent.map((resource) => ({
            lat: resource.location.lat,
            lon: resource.location.lon,
            label: 'Permanen',
            description: resource.resourceType,
            color: '#10b981',
        })),
        ...patrolMegafauna.map((observation) => ({
            lat: observation.location.lat,
            lon: observation.location.lon,
            label: 'Megafauna',
            description: observation.speciesName,
            color: '#3b82f6',
        })),
    ];
    return (<MainLayout title={patrol.code} subtitle={patrol.areaName}>
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/patrols')}>
        <ArrowLeft className="h-4 w-4 mr-2"/>
        Kembali ke Daftar
      </Button>

      {/* Status */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Route className="h-6 w-6 text-primary"/>
        </div>
        <div>
          <h2 className="text-xl font-bold">{patrol.code}</h2>
          <StatusBadge status={patrol.status}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <MapCard title="Rute Patroli" selectedVessel={vessel ? {
            name: vessel.name,
            lat: vessel.lastPosition.lat,
            lon: vessel.lastPosition.lon,
        } : null} paths={patrolPath.length > 1 ? [{ points: patrolPath, color: '#2563eb' }] : []} markers={mapMarkers} className="min-h-[360px]">
            {mapMarkers.length > 0 && (<div className="absolute top-4 left-4 z-[1000] space-y-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-card pointer-events-none">
                <p className="font-medium text-foreground">Legenda</p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ef4444]"/>
                  Temuan
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]"/>
                  Non-Permanen
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10b981]"/>
                  Permanen
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3b82f6]"/>
                  Megafauna
                </div>
              </div>)}
          </MapCard>

          {/* Crew */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary"/>
                Crew Patroli ({assignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada crew yang ditugaskan pada patroli ini.
                </p>) : (<Table>
                  <TableHeader>
                    <TableRow>
                  <TableHead>Peran</TableHead>
                  <TableHead>Nama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (<TableRow key={assignment.id}>
                    <TableCell className="text-sm">{roleLabels[assignment.role]}</TableCell>
                    <TableCell className="text-sm font-medium">{getCrewName(assignment.crewId)}</TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>)}
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary"/>
                Perlengkapan ({patrolEquipmentItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patrolEquipmentItems.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada perlengkapan tercatat.
                </p>) : (<Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Alat</TableHead>
                      <TableHead>Deskripsi Lainnya</TableHead>
                      <TableHead>Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patrolEquipmentItems.map((item) => (<TableRow key={item.id}>
                        <TableCell className="text-sm">{getGearTypeName(item.gearTypeId)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.otherDescription ?? '-'}</TableCell>
                        <TableCell className="text-sm">{item.quantity}</TableCell>
                      </TableRow>))}
                  </TableBody>
                </Table>)}
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Patrol Info */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary"/>
                  Detail Patroli
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5"/>
                  <div>
                    <p className="text-xs text-muted-foreground">Area Konservasi</p>
                    <p className="font-medium">{getConservationAreaName(patrol.conservationAreaId)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5"/>
                  <div>
                    <p className="text-xs text-muted-foreground">Area</p>
                    <p className="font-medium">{patrol.areaName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5"/>
                  <div>
                    <p className="text-xs text-muted-foreground">Pos Jaga</p>
                    <p className="font-medium">{getPostName(patrol.postId)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5"/>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal</p>
                    <p className="font-medium">{patrol.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5"/>
                  <div>
                    <p className="text-xs text-muted-foreground">Waktu Mulai</p>
                    <p className="font-medium">{formatDateTime(patrol.startTime)}</p>
                    <p className="text-xs text-muted-foreground">Jam Berangkat: {patrol.departureTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5"/>
                  <div>
                    <p className="text-xs text-muted-foreground">Durasi</p>
                    <p className="font-medium">{patrol.patrolDays} hari</p>
                  </div>
                </div>
                {patrol.endTime && (<div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5"/>
                    <div>
                      <p className="text-xs text-muted-foreground">Waktu Selesai</p>
                      <p className="font-medium">{formatDateTime(patrol.endTime)}</p>
                    </div>
                  </div>)}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5"/>
                  <div>
                    <p className="text-xs text-muted-foreground">Lokasi Inap</p>
                    <p className="font-medium">{patrol.overnightLocation}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">BBM Awal</p>
                    <p className="font-medium">{patrol.fuelStartLiters.toLocaleString('id-ID')} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">BBM Terpakai</p>
                    <p className="font-medium">{patrol.fuelUsedLiters.toLocaleString('id-ID')} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">BBM Sisa</p>
                    <p className="font-medium">{patrol.fuelRemainingLiters.toLocaleString('id-ID')} L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Validasi</p>
                    <p className="font-medium">{validationLabels[patrol.patrolValidation]}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Tujuan</p>
                  <p className="text-sm">{patrol.objective}</p>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Deskripsi Area</p>
                  <p className="text-sm">{patrol.areaDescription}</p>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Pengumpulan Data</p>
                  <p className="text-sm">{patrol.collectedBy}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(patrol.collectedAt)}</p>
                </div>
              </CardContent>
            </Card>

          {/* Vessel Info */}
          {vessel && (<Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary"/>
                  Kapal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate(`/vessels/${vessel.id}`)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{vessel.name}</span>
                    <StatusBadge status={vessel.status} size="sm"/>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vessel.callSign} • {vessel.captain}
                  </p>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* Resource Survey */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary"/>
              Non-Permanent Resources ({patrolNonPermanent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patrolNonPermanent.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6">
                Tidak ada survey non-permanen pada patroli ini.
              </p>) : (<Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Aktivitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patrolNonPermanent.map((item) => (<TableRow key={item.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(item.surveyTime)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.location.lat.toFixed(4)}, {item.location.lon.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-sm">{item.activity}</TableCell>
                    </TableRow>))}
                </TableBody>
              </Table>)}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary"/>
              Permanent Resources ({patrolPermanent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patrolPermanent.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6">
                Tidak ada survey permanen pada patroli ini.
              </p>) : (<Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patrolPermanent.map((item) => (<TableRow key={item.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(item.surveyTime)}
                      </TableCell>
                      <TableCell className="text-sm">{item.resourceType}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.status}</TableCell>
                    </TableRow>))}
                </TableBody>
              </Table>)}
          </CardContent>
        </Card>
      </div>

      {/* Megafauna */}
      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Fish className="h-5 w-5 text-primary"/>
            Observasi Megafauna ({patrolMegafauna.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patrolMegafauna.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6">
              Belum ada observasi megafauna pada patroli ini.
            </p>) : (<Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Spesies</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Lokasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patrolMegafauna.map((item) => (<TableRow key={item.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(item.observationTime)}
                    </TableCell>
                    <TableCell className="text-sm">{item.speciesName}</TableCell>
                    <TableCell className="text-sm">{item.count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.locationName}</TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>)}
        </CardContent>
      </Card>

      {/* Incidents */}
      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary"/>
            Kejadian Terkait ({incidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-8">
              Belum ada kejadian tercatat pada patroli ini
            </p>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incidents.map((incident) => (<div key={incident.id} className="p-4 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors" onClick={() => navigate(`/incidents/${incident.id}`)}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-2">{incident.title}</h4>
                    <StatusBadge status={incident.status} size="sm"/>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {incident.category}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(incident.time)}
                  </p>
                </div>))}
            </div>)}
        </CardContent>
      </Card>

      {/* Findings */}
      <Card className="mt-6 shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary"/>
              Temuan Patroli ({patrolFindings.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/findings')} className="text-xs">
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {patrolFindings.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-8">
              Belum ada temuan yang diunggah.
            </p>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {patrolFindings.slice(0, 3).map((finding) => (<div key={finding.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img src={finding.imageUrl} alt={`Foto temuan oleh ${finding.uploader}`} className="h-full w-full object-cover" loading="lazy"/>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Diunggah oleh </span>
                      <span className="font-medium text-foreground">{finding.uploader}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dimasukkan {formatRelativeTime(finding.createdAt)} ({formatDateTime(finding.createdAt)})
                    </div>
                  </div>
                </div>))}
            </div>)}
        </CardContent>
      </Card>
    </MainLayout>);
};
export default PatrolDetail;
