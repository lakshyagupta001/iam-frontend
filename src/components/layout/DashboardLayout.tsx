import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Initialize from localStorage or default to false
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  // Persist preference when changed
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    // On mobile, toggle the mobile menu
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      // On desktop, toggle the collapsed state
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-1 h-screen overflow-hidden">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          onToggle={toggleSidebar}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
