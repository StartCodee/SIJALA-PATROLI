import { cn } from '@/lib/utils';
export const KPICard = ({ title, value, icon: Icon, trend, variant = 'default', className, }) => {
    const variantStyles = {
        default: {
            iconBg: 'bg-muted',
            iconColor: 'text-muted-foreground',
            trendColor: 'text-muted-foreground',
        },
        primary: {
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
            trendColor: 'text-primary',
        },
        success: {
            iconBg: 'bg-status-approved-bg',
            iconColor: 'text-status-approved',
            trendColor: 'text-status-approved',
        },
        warning: {
            iconBg: 'bg-status-pending-bg',
            iconColor: 'text-status-pending',
            trendColor: 'text-status-pending',
        },
        destructive: {
            iconBg: 'bg-status-rejected-bg',
            iconColor: 'text-status-rejected',
            trendColor: 'text-status-rejected',
        },
    };
    const styles = variantStyles[variant];
    return (<div className={cn('kpi-card', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', styles.iconBg)}>
          <Icon className={cn('h-5 w-5', styles.iconColor)}/>
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground tracking-tight">{value}</p>
      {trend && (<p className={cn('mt-2 text-xs font-medium', trend.isPositive ? styles.trendColor : 'text-status-rejected')}>
          {trend.isPositive ? '+' : ''}
          {trend.value}% dari kemarin
        </p>)}
    </div>);
};
