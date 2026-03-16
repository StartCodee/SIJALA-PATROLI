import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';

export const MainLayout = ({ children, title, subtitle, showSearch = true }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const contentRef = useRef(null);

    useEffect(() => {
        const contentElement = contentRef.current;
        if (contentElement) {
            contentElement.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname]);

    return (<div className="flex h-screen w-full overflow-hidden overscroll-none bg-background ocean-pattern">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          onMenuClick={() => setMobileOpen((prev) => !prev)}
        />
        <div ref={contentRef} className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-none">
          <div className="p-6">{children}</div>
        </div>
      </main>
    </div>);
};
