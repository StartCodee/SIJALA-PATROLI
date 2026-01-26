import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Ship, ShieldAlert, ClipboardList } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MapCard } from '@/components/map/MapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
const FindingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getFindingById, vesselTypes, vesselSubtypes, gearTypes, violationTypes, findingViolationItems, mediaFiles, } = useData();
    const finding = id ? getFindingById(id) : undefined;
    if (!finding) {
        return (<MainLayout title="Temuan Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Temuan dengan ID tersebut tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/findings')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>);
    }
    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };
    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const getVesselTypeName = (typeId) => {
        const vesselType = vesselTypes.find((item) => item.id === typeId);
        return vesselType?.name ?? '-';
    };
    const getVesselSubtypeName = (subtypeId) => {
        if (!subtypeId)
            return '-';
        const subtype = vesselSubtypes.find((item) => item.id === subtypeId);
        return subtype?.name ?? '-';
    };
    const getGearNames = (gearIds) => {
        if (gearIds.length === 0)
            return '-';
        const names = gearIds
            .map((gearId) => gearTypes.find((item) => item.id === gearId)?.name)
            .filter(Boolean);
        return names.length > 0 ? names.join(', ') : '-';
    };
    const violations = findingViolationItems
        .filter((item) => item.findingId === finding.id)
        .map((item) => ({
        ...item,
        detail: violationTypes.find((type) => type.id === item.violationTypeId),
    }))
        .filter((item) => item.detail);
    const photo = mediaFiles.find((item) => item.id === finding.findingPhotoId);
    return (<MainLayout title="Detail Temuan" subtitle={finding.locationName}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/findings')}>
        <ArrowLeft className="h-4 w-4 mr-2"/>
        Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-primary"/>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{finding.locationName}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{finding.zone}</Badge>
                    <Badge variant="outline">{finding.subzone}</Badge>
                    <Badge className={finding.hasTlpjlCard ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'}>
                      {finding.hasTlpjlCard ? 'TLPJL: Ada' : 'TLPJL: Tidak'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tanggal Temuan: {formatDate(finding.findingTime)} · Jam: {formatTime(finding.findingTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <MapCard title="Lokasi Temuan" selectedVessel={{
            name: finding.locationName,
            lat: finding.latitude,
            lon: finding.longitude,
        }} markers={[
            {
                lat: finding.latitude,
                lon: finding.longitude,
                label: 'Temuan',
                description: finding.locationName,
                color: '#ef4444',
            },
        ]} showControls={false}/>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary"/>
                Detail Pelanggaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Detail Pelanggaran</p>
                <p className="text-sm">{finding.violationDetails}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tindak Lanjut</p>
                <p className="text-sm">{finding.actionTaken}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary"/>
                Jenis Pelanggaran ({violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada jenis pelanggaran yang ditautkan.
                </p>) : (<div className="space-y-3">
                  {violations.map((item) => (<div key={item.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.detail?.name}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {item.detail?.code}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.detail?.description}
                      </p>
                    </div>))}
                </div>)}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary"/>
                Informasi Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Koordinat</span>
                <span className="font-mono">
                  {finding.latitude.toFixed(5)}, {finding.longitude.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GPS ID</span>
                <span>{finding.gpsId}</span>
              </div>
              {finding.zoneOther !== '-' && (<div className="flex justify-between">
                  <span className="text-muted-foreground">Zona Lainnya</span>
                  <span>{finding.zoneOther}</span>
                </div>)}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary"/>
                Kapal & Alat Tangkap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipe Kapal</span>
                <span>{getVesselTypeName(finding.vesselTypeId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtipe</span>
                <span>{getVesselSubtypeName(finding.vesselSubtypeId)}</span>
              </div>
              {finding.vesselTypeOther !== '-' && (<div className="flex justify-between">
                  <span className="text-muted-foreground">Tipe Lainnya</span>
                  <span>{finding.vesselTypeOther}</span>
                </div>)}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alat Tangkap</span>
                <span>{getGearNames(finding.gearTypes)}</span>
              </div>
              {finding.gearOther !== '-' && (<div className="flex justify-between">
                  <span className="text-muted-foreground">Alat Lainnya</span>
                  <span>{finding.gearOther}</span>
                </div>)}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary"/>
                Foto Temuan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border overflow-hidden bg-muted">
                <img src={photo?.url ?? finding.imageUrl} alt={photo?.name ?? 'Foto temuan'} className="w-full h-48 object-cover" loading="lazy"/>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>{photo?.name ?? 'Dokumentasi temuan'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>);
};
export default FindingDetail;
