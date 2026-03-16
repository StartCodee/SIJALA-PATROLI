import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
export const Topbar = ({ title, subtitle, onMenuClick, showSearch = true, }) => {
    return (<header className="border-b border-border bg-card px-6 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5"/>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (<p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>)}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
          {showSearch && (<div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
              <Input placeholder="Cari..." className="w-full pl-9 h-9 bg-background border-border"/>
            </div>)}
        </div>
      </div>
    </header>);
};
