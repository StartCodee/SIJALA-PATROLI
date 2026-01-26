import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export const Topbar = ({ title, subtitle, sidebarCollapsed, onMenuClick, showSearch = true, }) => {
    return (<header className={cn('fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300', sidebarCollapsed ? 'left-16' : 'left-64')}>
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5"/>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (<p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>)}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {showSearch && (<div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
              <Input placeholder="Cari..." className="w-64 pl-9 h-9 bg-background border-border"/>
            </div>)}
        </div>
      </div>
    </header>);
};
