import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Crosshair, Layers, ZoomIn, ZoomOut, Ship, Flag } from 'lucide-react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import '@/lib/leaflet';

const DEFAULT_CENTER = { lat: -0.23, lon: 130.51 };

const createRouteIcon = ({ symbol, color }) =>
  L.divIcon({
    className: 'sijala-route-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 999px;
        border: 2px solid white;
        background: ${color};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 6px 14px rgba(15, 23, 42, 0.28);
      ">${symbol}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createPointIcon = ({ symbol = '📍', color = '#2563eb' }) =>
  L.divIcon({
    className: 'sijala-point-marker',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 2px solid white;
        background: ${color};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        box-shadow: 0 6px 14px rgba(15, 23, 42, 0.28);
      ">${symbol}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

export const MapCard = ({
  title = 'Peta Pemantauan',
  selectedVessel,
  paths = [],
  markers = [],
  showSelectedMarker = true,
  onCenterClick,
  className,
  showControls = true,
  children,
}) => {
  const mapRef = useRef(null);
  const center = selectedVessel ?? DEFAULT_CENTER;

  useEffect(() => {
    if (!selectedVessel || !mapRef.current) return;
    const zoom = Math.max(mapRef.current.getZoom(), 12);
    mapRef.current.setView([selectedVessel.lat, selectedVessel.lon], zoom, { animate: true });
  }, [selectedVessel]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleResize = () => map.invalidateSize();
    const timer = window.setTimeout(() => map.invalidateSize(), 0);
    window.addEventListener('resize', handleResize);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const routePoints = paths.flatMap((path) => path.points || []);
    if (routePoints.length > 1) {
      const bounds = routePoints.map((point) => [point.lat, point.lon]);
      mapRef.current.fitBounds(bounds, { padding: [24, 24] });
      return;
    }

    const markerPoints = markers
      .filter((marker) => Number.isFinite(marker?.lat) && Number.isFinite(marker?.lon))
      .map((marker) => [marker.lat, marker.lon]);
    if (markerPoints.length > 1) {
      mapRef.current.fitBounds(markerPoints, { padding: [24, 24] });
    }
  }, [markers, paths]);

  const hasRoute = paths.some((path) => Array.isArray(path.points) && path.points.length > 1);

  const markerIcons = useMemo(() => {
    return {
      start: createRouteIcon({ symbol: '🚤', color: '#0f4c81' }),
      end: createRouteIcon({ symbol: '🏁', color: '#22a06b' }),
    };
  }, []);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const handleCenter = () => {
    if (!selectedVessel || !mapRef.current) return;
    const zoom = Math.max(mapRef.current.getZoom(), 12);
    mapRef.current.setView([selectedVessel.lat, selectedVessel.lon], zoom, { animate: true });
    onCenterClick?.();
  };

  return (
    <Card className={cn('overflow-hidden shadow-card min-h-[320px]', className)}>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        {selectedVessel && (
          <Badge variant="secondary" className="font-normal">
            {selectedVessel.name}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative min-h-[320px] w-full overflow-hidden">
          <MapContainer
            center={[center.lat, center.lon]}
            zoom={12}
            zoomControl={false}
            className="w-full"
            style={{ height: '100%', minHeight: '320px' }}
            whenCreated={(map) => {
              mapRef.current = map;
              window.setTimeout(() => map.invalidateSize(), 0);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {paths.map((path, index) => (
              <Polyline
                key={`route-main-${index}`}
                positions={(path.points || []).map((point) => [point.lat, point.lon])}
                pathOptions={{
                  color: path.color ?? '#2563eb',
                  weight: path.weight ?? 4,
                  lineCap: 'round',
                  opacity: 0.95,
                }}
              />
            ))}

            {paths.map((path, index) => (
              <Polyline
                key={`route-dash-${index}`}
                positions={(path.points || []).map((point) => [point.lat, point.lon])}
                pathOptions={{
                  color: '#93c5fd',
                  weight: 2,
                  lineCap: 'round',
                  dashArray: '2 10',
                  opacity: 0.9,
                }}
              />
            ))}

            {markers.map((marker, index) => {
              const kind = marker.kind || 'finding';

              if (kind === 'start' || kind === 'end') {
                const icon = kind === 'start' ? markerIcons.start : markerIcons.end;
                return (
                  <Marker key={`marker-route-${index}`} position={[marker.lat, marker.lon]} icon={icon}>
                    {(marker.label || marker.description) && (
                      <Popup>
                        <div className="text-sm font-medium">{marker.label ?? 'Marker'}</div>
                        {marker.description && (
                          <div className="text-xs text-muted-foreground">{marker.description}</div>
                        )}
                      </Popup>
                    )}
                  </Marker>
                );
              }

              if (marker.iconSymbol) {
                const icon = createPointIcon({
                  symbol: marker.iconSymbol,
                  color: marker.iconColor ?? marker.color ?? '#2563eb',
                });
                return (
                  <Marker key={`marker-point-${index}`} position={[marker.lat, marker.lon]} icon={icon}>
                    {(marker.label || marker.description) && (
                      <Popup>
                        <div className="text-sm font-medium">{marker.label ?? 'Titik Laporan'}</div>
                        {marker.description && (
                          <div className="text-xs text-muted-foreground">{marker.description}</div>
                        )}
                      </Popup>
                    )}
                  </Marker>
                );
              }

              return (
                <CircleMarker
                  key={`marker-finding-${index}`}
                  center={[marker.lat, marker.lon]}
                  radius={6}
                  pathOptions={{
                    color: marker.color ?? '#ef4444',
                    fillColor: marker.color ?? '#ef4444',
                    fillOpacity: 0.88,
                    weight: 2,
                  }}
                >
                  {(marker.label || marker.description) && (
                    <Popup>
                      <div className="text-sm font-medium">{marker.label ?? 'Temuan'}</div>
                      {marker.description && (
                        <div className="text-xs text-muted-foreground">{marker.description}</div>
                      )}
                    </Popup>
                  )}
                </CircleMarker>
              );
            })}

            {showSelectedMarker && selectedVessel && (
              <Marker position={[selectedVessel.lat, selectedVessel.lon]}>
                <Popup>
                  <div className="text-sm font-medium">{selectedVessel.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedVessel.lat.toFixed(6)}, {selectedVessel.lon.toFixed(6)}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {selectedVessel && (
            <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-card">
              <p className="text-xs text-muted-foreground">Koordinat Terpilih</p>
              <p className="text-sm font-medium text-foreground font-mono">
                {selectedVessel.lat.toFixed(6)}, {selectedVessel.lon.toFixed(6)}
              </p>
            </div>
          )}

          {hasRoute && (
            <div className="absolute top-4 left-4 z-[1000] rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-card backdrop-blur-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ship className="h-3.5 w-3.5 text-primary" />
                <span>Mulai Patroli</span>
                <span className="text-slate-300">·</span>
                <span>Titik Temuan</span>
                <span className="text-slate-300">·</span>
                <Flag className="h-3.5 w-3.5 text-emerald-600" />
                <span>Selesai</span>
              </div>
            </div>
          )}

          {showControls && (
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-card overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none border-b border-border"
                  onClick={handleZoomIn}
                  aria-label="Perbesar peta"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none"
                  onClick={handleZoomOut}
                  aria-label="Perkecil peta"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-card/95 backdrop-blur-sm border border-border shadow-card"
                aria-label="Pengaturan layer"
                title="Pengaturan layer"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showControls && selectedVessel && (
            <div className="absolute bottom-4 right-4 z-[1000]">
              <Button size="sm" onClick={handleCenter} className="shadow-card gap-2">
                <Crosshair className="h-4 w-4" />
                Pusatkan ke Terpilih
              </Button>
            </div>
          )}

          {children}
        </div>
      </CardContent>
    </Card>
  );
};
