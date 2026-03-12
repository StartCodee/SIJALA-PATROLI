import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Route,
  Users,
  Anchor,
  Ship,
  FileWarning,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Camera,
  Fish,
  TreePine,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoKkpRajaAmpat from '@/assets/KKP-RajaAmpat.png';
import TribbleImage from '@/assets/image/tribble.png';
const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    // {
    //     title: 'Pemantauan Langsung',
    //     href: '/monitoring',
    //     icon: MapPin,
    // },
    // {
    //     title: 'Kapal',
    //     href: '/vessels',
    //     icon: Ship,
    // },
    {
        title: 'Personel',
        href: '/crew',
        icon: Users,
    },
    // {
    //     title: 'Penugasan Crew',
    //     href: '/crew-assignments',
    //     icon: ClipboardList,
    // },
    {
        title: 'Pelabuhan/Pos Jaga',
        href: '/guard-posts',
        icon: Anchor,
    },
    {
        title: 'Management Speedboat',
        href: '/speedboats',
        icon: Ship,
    },
    {
        title: 'Monitoring Pemanfaatan (RUM)',
        href: '/monitoring-megafauna',
        icon: Fish,
    },
    {
        title: 'Monitoring Habitat',
        href: '/monitoring-habitat',
        icon: TreePine,
    },
];
const patrolGroupItems = [
    {
        title: 'Daftar Patroli',
        href: '/patrols',
        icon: Route,
    },
    {
        title: 'Laporan Kejadian',
        href: '/incidents',
        icon: FileWarning,
    },
    {
        title: 'Temuan',
        href: '/findings',
        icon: Camera,
    },
];
const adminItems = [
   
];
const profileInfo = {
    name: 'Rudi Hartono',
    role: 'Admin',
    initials: 'RH',
    avatar: '/placeholder.svg',
};
export const AppSidebar = ({ collapsed, onToggle }) => {
    const location = useLocation();
    const isPathActive = (href) => location.pathname === href ||
        (href !== '/' && location.pathname.startsWith(`${href}/`));
    const patrolGroupActive = patrolGroupItems.some((item) => isPathActive(item.href));
    const [patrolGroupOpen, setPatrolGroupOpen] = useState(patrolGroupActive);
    useEffect(() => {
        if (patrolGroupActive)
            setPatrolGroupOpen(true);
    }, [patrolGroupActive]);
    return (<aside className={cn('fixed inset-y-0 left-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-300 shadow-2xl', collapsed ? 'w-16' : 'w-64')} style={{ background: 'var(--gradient-sidebar)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-3 flex-1 min-w-0', collapsed && 'justify-center')}>
          <div className={cn('rounded-xl bg-white/95 ring-1 ring-white/25 p-1 shadow-sm', collapsed ? 'h-10 w-10' : 'h-12 w-12')}>
            <img src={LogoKkpRajaAmpat} alt="KKP Raja Ampat" className="h-full w-full object-contain drop-shadow-sm"/>
          </div>
          {!collapsed && (<div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-white truncate leading-tight">SIJALA</h1>
              <p className="text-[11px] text-sidebar-foreground/70 truncate">Patroli Jaga Laut</p>
            </div>)}
        </div>
      </div>

      <img src={TribbleImage} alt="Tribble" className="pointer-events-none absolute bottom-[-5px] w-[150px]"/>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto custom-scrollbar py-4">
        {!collapsed && (<p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-4 mb-2">
            Menu Utama
          </p>)}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = isPathActive(item.href);
            return (<NavLink key={item.href} to={item.href} className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-2')} title={collapsed ? item.title : undefined}>
                <item.icon className="w-5 h-5 shrink-0"/>
                {!collapsed && <span className="truncate">{item.title}</span>}
              </NavLink>);
        })}

          {collapsed ? (<NavLink to="/patrols" className={cn('nav-item justify-center px-2', patrolGroupActive && 'active')} title="Patroli">
              <Route className="w-5 h-5 shrink-0"/>
            </NavLink>) : (<div className="space-y-1">
              <button type="button" className={cn('nav-item w-full justify-between', patrolGroupActive && 'active')} onClick={() => setPatrolGroupOpen((prev) => !prev)} aria-expanded={patrolGroupOpen} aria-label="Toggle menu patroli">
                <span className="flex items-center gap-3 min-w-0">
                  <Route className="w-5 h-5 shrink-0"/>
                  <span className="truncate">Patroli</span>
                </span>
                {patrolGroupOpen ? (<ChevronUp className="w-4 h-4 shrink-0"/>) : (<ChevronDown className="w-4 h-4 shrink-0"/>)}
              </button>
              <div className={cn('overflow-hidden transition-all duration-200', patrolGroupOpen ? 'max-h-52' : 'max-h-0')}>
                <div className="space-y-1 pt-1">
                  {patrolGroupItems.map((item) => {
                    const isActive = isPathActive(item.href);
                    return (<NavLink key={item.href} to={item.href} className={cn('nav-item py-2 pl-11 pr-3 text-sm', isActive && 'active')} title={item.title}>
                        <item.icon className="w-4 h-4 shrink-0"/>
                        <span className="truncate">{item.title}</span>
                      </NavLink>);
                })}
                </div>
              </div>
            </div>)}
        </div>

        {adminItems.length > 0 && (<>
            {!collapsed && (<p className="mt-6 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-4 mb-2">
                Administrasi
              </p>)}
            <div className="space-y-1">
              {adminItems.map((item) => {
                const isActive = isPathActive(item.href);
                return (<NavLink key={item.href} to={item.href} className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-2')} title={collapsed ? item.title : undefined}>
                    <item.icon className="w-5 h-5 shrink-0"/>
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </NavLink>);
            })}
            </div>
          </>)}
      </nav>

      <div className={cn('border-t border-sidebar-border p-4', collapsed && 'flex flex-col items-center gap-2')}>
        {!collapsed ? (<div className="flex items-center gap-2">
            <NavLink to="/profile" className={({ isActive }) => cn('flex flex-1 items-center gap-3 rounded-lg p-2 transition-colors', isActive
                ? 'bg-sidebar-primary/15 text-sidebar-primary'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground')}>
              <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center overflow-hidden">
                <img src={profileInfo.avatar} alt={profileInfo.name} className="h-full w-full object-cover"/>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{profileInfo.name}</p>
                <p className="text-[10px] text-sidebar-foreground/60">{profileInfo.role}</p>
              </div>
            </NavLink>
            <button type="button" className="p-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors" aria-label="Keluar" title="Keluar">
              <LogOut className="w-4 h-4"/>
            </button>
          </div>) : (<>
            <NavLink to="/profile" className={({ isActive }) => cn('flex items-center justify-center rounded-lg p-2 transition-colors', isActive
                ? 'bg-sidebar-primary/15 text-sidebar-primary'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground')} title="Profil Akun">
              <div className="h-9 w-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center overflow-hidden text-xs font-semibold text-sidebar-primary">
                {profileInfo.initials}
              </div>
            </NavLink>
            <button type="button" className="p-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors" aria-label="Keluar" title="Keluar">
              <LogOut className="w-4 h-4"/>
            </button>
          </>)}
      </div>

      {/* Collapse Toggle */}
      <button type="button" onClick={onToggle} className="absolute -right-3 top-24 hidden md:flex bg-sidebar border border-sidebar-border rounded-full p-1.5 hover:bg-sidebar-accent transition-colors" aria-label={collapsed ? 'Perluas menu samping' : 'Ciutkan menu samping'} title={collapsed ? 'Perluas menu samping' : 'Ciutkan menu samping'}>
        {collapsed ? (<ChevronRight className="w-3.5 h-3.5 text-sidebar-foreground"/>) : (<ChevronLeft className="w-3.5 h-3.5 text-sidebar-foreground"/>)}
      </button>
    </aside>);
};
