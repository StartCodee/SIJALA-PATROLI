import { Ship, Navigation, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Vessel, getConnectionStatus, formatRelativeTime } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface VesselListItemProps {
  vessel: Vessel;
  isSelected?: boolean;
  onClick?: () => void;
  onDetailClick?: () => void;
  compact?: boolean;
}

export const VesselListItem = ({
  vessel,
  isSelected,
  onClick,
  onDetailClick,
  compact = false,
}: VesselListItemProps) => {
  const connectionStatus = getConnectionStatus(vessel.lastPosition.timestamp);

  return (
    <div
      className={cn(
        'p-4 border-b border-border last:border-b-0 cursor-pointer transition-colors',
        isSelected ? 'bg-primary/5' : 'hover:bg-muted/50',
        compact && 'p-3'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
            vessel.status === 'aktif' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            <Ship className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {vessel.name}
              </h4>
              <StatusBadge status={vessel.status} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{vessel.callSign}</p>
            
            {!compact && vessel.status === 'aktif' && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Navigation className="h-3 w-3" />
                  <span>{vessel.lastPosition.speed} kn</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(vessel.lastPosition.timestamp)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={connectionStatus} size="sm" />
          {onDetailClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDetailClick();
              }}
              className="text-xs h-7 px-2"
            >
              Detail
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
