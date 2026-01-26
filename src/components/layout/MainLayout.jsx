import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';
export const MainLayout = ({ children, title, subtitle, showSearch = true }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    return (<div className="min-h-screen bg-background ocean-pattern">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}/>
      <Topbar title={title} subtitle={subtitle} sidebarCollapsed={sidebarCollapsed} showSearch={showSearch}/>
      <main className={cn('pt-16 min-h-screen transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <div className="p-6">{children}</div>
      </main>
    </div>);
};
