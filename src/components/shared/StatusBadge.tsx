import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ConnectionStatus, getConnectionStatusLabel } from '@/data/mockData';

interface StatusBadgeProps {
  status: ConnectionStatus | 'aktif' | 'standby' | 'maintenance' | 'active' | 'planned' | 'completed' | 'open' | 'closed' | 'investigating';
  size?: 'sm' | 'default';
}

export const StatusBadge = ({ status, size = 'default' }: StatusBadgeProps) => {
  const getConfig = () => {
    switch (status) {
      // Connection status
      case 'normal':
        return { label: getConnectionStatusLabel(status), className: 'bg-success/15 text-success border-success/30' };
      case 'delayed':
        return { label: getConnectionStatusLabel(status), className: 'bg-warning/15 text-warning border-warning/30' };
      case 'offline':
        return { label: getConnectionStatusLabel(status), className: 'bg-destructive/15 text-destructive border-destructive/30' };
      
      // Vessel status
      case 'aktif':
        return { label: 'Aktif', className: 'bg-success/15 text-success border-success/30' };
      case 'standby':
        return { label: 'Standby', className: 'bg-warning/15 text-warning border-warning/30' };
      case 'maintenance':
        return { label: 'Maintenance', className: 'bg-muted text-muted-foreground border-border' };
      
      // Patrol status
      case 'active':
        return { label: 'Aktif', className: 'bg-success/15 text-success border-success/30' };
      case 'planned':
        return { label: 'Direncanakan', className: 'bg-primary/15 text-primary border-primary/30' };
      case 'completed':
        return { label: 'Selesai', className: 'bg-muted text-muted-foreground border-border' };
      
      // Incident status
      case 'open':
        return { label: 'Terbuka', className: 'bg-destructive/15 text-destructive border-destructive/30' };
      case 'closed':
        return { label: 'Ditutup', className: 'bg-muted text-muted-foreground border-border' };
      case 'investigating':
        return { label: 'Investigasi', className: 'bg-warning/15 text-warning border-warning/30' };
      
      default:
        return { label: status, className: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const config = getConfig();

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        config.className,
        size === 'sm' && 'text-xs px-2 py-0'
      )}
    >
      {config.label}
    </Badge>
  );
};
