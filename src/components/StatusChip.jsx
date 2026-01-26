import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, CircleDot, Clock, CreditCard, RefreshCw, XCircle, } from 'lucide-react';
const variantStyles = {
    pending: 'status-chip-pending',
    approved: 'status-chip-approved',
    rejected: 'status-chip-rejected',
    revision: 'status-chip-revision',
    info: 'status-chip-info',
    warning: 'status-chip-pending',
    success: 'status-chip-approved',
};
const variantIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    revision: AlertCircle,
    info: CircleDot,
    warning: AlertCircle,
    success: CheckCircle,
};
export function StatusChip({ variant, label, showIcon = true, size = 'md', className, }) {
    const Icon = variantIcons[variant];
    return (<span className={cn('status-chip', variantStyles[variant], size === 'sm' && 'px-2 py-0.5 text-[10px]', className)}>
      {showIcon && <Icon className={cn('w-3 h-3', size === 'sm' && 'w-2.5 h-2.5')}/>}
      {label}
    </span>);
}
export function UserStatusChip({ status }) {
    const config = {
        active: { variant: 'approved', label: 'Aktif' },
        disabled: { variant: 'rejected', label: 'Nonaktif' },
    };
    const { variant, label } = config[status];
    return <StatusChip variant={variant} label={label}/>;
}
export function RoleBadge({ role }) {
    const config = {
        admin: { variant: 'rejected', label: 'Admin' },
        petugas: { variant: 'info', label: 'Petugas' },
    };
    const { variant, label } = config[role] || { variant: 'info', label: role };
    return <StatusChip variant={variant} label={label} showIcon={false}/>;
}
export function PaymentStatusChip({ status }) {
    const config = {
        belum_bayar: { variant: 'pending', label: 'Belum Bayar', icon: CreditCard },
        sudah_bayar: { variant: 'approved', label: 'Sudah Bayar', icon: CheckCircle },
        refund_diproses: { variant: 'revision', label: 'Pengembalian Diproses', icon: RefreshCw },
        refund_selesai: { variant: 'info', label: 'Pengembalian Selesai', icon: CheckCircle },
    };
    const { variant, label } = config[status] || { variant: 'info', label: status };
    return <StatusChip variant={variant} label={label}/>;
}
