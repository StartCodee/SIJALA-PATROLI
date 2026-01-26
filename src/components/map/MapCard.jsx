import { useEffect, useMemo, useRef } from 'react';
import { MapPin, Crosshair, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import '@/lib/leaflet';
export const MapCard = ({ title = 'Peta Pemantauan', selectedVessel, paths = [], markers = [], onCenterClick, className, showControls = true, children, }) => {
    const mapRef = useRef(null);
    const defaultCenter = useMemo(() => ({ lat: -0.23, lon: 130.51 }), []);
    const center = selectedVessel ?? defaultCenter;
    useEffect(() => {
        if (!selectedVessel || !mapRef.current)
            return;
        const zoom = Math.max(mapRef.current.getZoom(), 12);
        mapRef.current.setView([selectedVessel.lat, selectedVessel.lon], zoom, { animate: true });
    }, [selectedVessel]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map)
            return;
        const handleResize = () => map.invalidateSize();
        const timer = window.setTimeout(() => map.invalidateSize(), 0);
        window.addEventListener('resize', handleResize);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    useEffect(() => {
        if (!mapRef.current)
            return;
        const points = paths.flatMap((path) => path.points);
        if (points.length < 2)
            return;
        const bounds = points.map((point) => [point.lat, point.lon]);
        mapRef.current.fitBounds(bounds, { padding: [24, 24] });
    }, [paths]);
    const handleZoomIn = () => {
        mapRef.current?.zoomIn();
    };
    const handleZoomOut = () => {
        mapRef.current?.zoomOut();
    };
    const handleCenter = () => {
        if (!selectedVessel || !mapRef.current)
            return;
        const zoom = Math.max(mapRef.current.getZoom(), 12);
        mapRef.current.setView([selectedVessel.lat, selectedVessel.lon], zoom, { animate: true });
        onCenterClick?.();
    };
    return (<Card className={cn('overflow-hidden shadow-card min-h-[320px]', className)}>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary"/>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        {selectedVessel && (<Badge variant="secondary" className="font-normal">
            {selectedVessel.name}
          </Badge>)}
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative min-h-[320px] w-full overflow-hidden">
          <MapContainer center={[center.lat, center.lon]} zoom={12} zoomControl={false} className="w-full" style={{ height: '100%', minHeight: '320px' }} whenCreated={(map) => {
            mapRef.current = map;
            window.setTimeout(() => map.invalidateSize(), 0);
        }}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {paths.map((path, index) => (<Polyline key={`path-${index}`} positions={path.points.map((point) => [point.lat, point.lon])} pathOptions={{
                color: path.color ?? '#2563eb',
                weight: path.weight ?? 3,
            }}/>))}
            {markers.map((marker, index) => (<CircleMarker key={`marker-${index}`} center={[marker.lat, marker.lon]} radius={5} pathOptions={{
                color: marker.color ?? '#ef4444',
                fillColor: marker.color ?? '#ef4444',
                fillOpacity: 0.85,
            }}>
                {(marker.label || marker.description) && (<Popup>
                    <div className="text-sm font-medium">{marker.label ?? 'Marker'}</div>
                    {marker.description && (<div className="text-xs text-muted-foreground">{marker.description}</div>)}
                  </Popup>)}
              </CircleMarker>))}
            {selectedVessel && (<Marker position={[selectedVessel.lat, selectedVessel.lon]}>
                <Popup>
                  <div className="text-sm font-medium">{selectedVessel.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedVessel.lat.toFixed(6)}, {selectedVessel.lon.toFixed(6)}
                  </div>
                </Popup>
              </Marker>)}
          </MapContainer>

          {/* Selected vessel coordinates */}
          {selectedVessel && (<div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-card">
              <p className="text-xs text-muted-foreground">Koordinat Terpilih</p>
              <p className="text-sm font-medium text-foreground font-mono">
                {selectedVessel.lat.toFixed(6)}, {selectedVessel.lon.toFixed(6)}
              </p>
            </div>)}

          {/* Map Controls */}
          {showControls && (<div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-card overflow-hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-b border-border" onClick={handleZoomIn} aria-label="Perbesar peta">
                  <ZoomIn className="h-4 w-4"/>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={handleZoomOut} aria-label="Perkecil peta">
                  <ZoomOut className="h-4 w-4"/>
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-card/95 backdrop-blur-sm border border-border shadow-card" aria-label="Pengaturan layer" title="Pengaturan layer">
                <Layers className="h-4 w-4"/>
              </Button>
            </div>)}

          {/* Center Button */}
          {showControls && selectedVessel && (<div className="absolute bottom-4 right-4 z-[1000]">
              <Button size="sm" onClick={handleCenter} className="shadow-card gap-2">
                <Crosshair className="h-4 w-4"/>
                Pusatkan ke Terpilih
              </Button>
            </div>)}

          {children}
        </div>
      </CardContent>
    </Card>);
};
