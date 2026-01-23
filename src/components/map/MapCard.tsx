import { MapPin, Crosshair, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MapCardProps {
  title?: string;
  selectedVessel?: {
    name: string;
    lat: number;
    lon: number;
  } | null;
  onCenterClick?: () => void;
  className?: string;
  showControls?: boolean;
  children?: React.ReactNode;
}

export const MapCard = ({
  title = 'Peta Monitoring',
  selectedVessel,
  onCenterClick,
  className,
  showControls = true,
  children,
}: MapCardProps) => {
  return (
    <Card className={cn('overflow-hidden shadow-card', className)}>
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
        {/* Map Placeholder Area */}
        <div className="relative h-[400px] bg-map-placeholder map-grid-bg overflow-hidden">
          {/* Placeholder Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Map akan diintegrasikan di sini
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Leaflet / Mapbox ready
                </p>
              </div>
            </div>
            
            {/* Selected vessel coordinates */}
            {selectedVessel && (
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-card">
                <p className="text-xs text-muted-foreground">Koordinat Terpilih</p>
                <p className="text-sm font-medium text-foreground font-mono">
                  {selectedVessel.lat.toFixed(6)}, {selectedVessel.lon.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Map Controls */}
          {showControls && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-card overflow-hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-b border-border">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-card/95 backdrop-blur-sm border border-border shadow-card">
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Center Button */}
          {onCenterClick && (
            <div className="absolute bottom-4 right-4">
              <Button
                size="sm"
                onClick={onCenterClick}
                className="shadow-card gap-2"
              >
                <Crosshair className="h-4 w-4" />
                Center to Selected
              </Button>
            </div>
          )}

          {children}
        </div>
      </CardContent>
    </Card>
  );
};
