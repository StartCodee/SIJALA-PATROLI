import { cn } from '@/lib/utils';
import { getConnectionStatusLabel } from '@/data/mockData';
export const StatusBadge = ({ status, size = 'default' }) => {
    const getConfig = () => {
        switch (status) {
            // Connection status
            case 'normal':
                return { label: getConnectionStatusLabel(status), className: 'status-chip-approved' };
            case 'delayed':
                return { label: getConnectionStatusLabel(status), className: 'status-chip-pending' };
            case 'offline':
                return { label: getConnectionStatusLabel(status), className: 'status-chip-rejected' };
            // Vessel status
            case 'aktif':
                return { label: 'Aktif', className: 'status-chip-approved' };
            case 'standby':
                return { label: 'Siaga', className: 'status-chip-pending' };
            case 'maintenance':
                return { label: 'Perawatan', className: 'status-chip-info' };
            // Patrol status
            case 'active':
                return { label: 'Aktif', className: 'status-chip-approved' };
            case 'planned':
                return { label: 'Direncanakan', className: 'status-chip-info' };
            case 'completed':
                return { label: 'Selesai', className: 'status-chip-info' };
            // Incident status
            case 'open':
                return { label: 'Terbuka', className: 'status-chip-rejected' };
            case 'closed':
                return { label: 'Ditutup', className: 'status-chip-info' };
            case 'investigating':
                return { label: 'Investigasi', className: 'status-chip-revision' };
            default:
                return { label: status, className: 'status-chip-info' };
        }
    };
    const config = getConfig();
    return (<span className={cn('status-chip', config.className, size === 'sm' && 'px-2 py-0.5 text-[10px]')}>
      {config.label}
    </span>);
};
