import { NavLink, useLocation } from 'react-router-dom';
import { Users, Shield, Key, Menu, LayoutDashboard, FileText, Bell, Settings, Activity } from 'lucide-react';
import logo from '@/assets/changenetworks.png';
import { cn } from '../../lib/utils';
import { Sheet, SheetContent } from '../ui/sheet';
import { Button } from '../ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

const dashboardItem = { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard };

const iamItems = [
  { name: 'Users', path: '/iam/users', icon: Users },
  { name: 'Groups', path: '/iam/groups', icon: Shield },
  { name: 'Policies', path: '/iam/policies', icon: Key },
];

const resourceItems = [
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Audit', path: '/audit', icon: Activity },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, isMobileOpen, onMobileClose, onToggle }: SidebarProps) {
  const location = useLocation();

  const NavItem = ({ item, collapsed = false }: { item: any; collapsed?: boolean }) => {
    const isActive = location.pathname.startsWith(item.path);
    return (
      <NavLink
        to={item.path}
        onClick={onMobileClose}
        className={cn(
          "flex items-center rounded-lg transition-all duration-300",
          collapsed ? "justify-center px-0 py-3 mx-2" : "px-3 py-2 space-x-3",
          isActive
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
        )}
        title={collapsed ? item.name : undefined}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
      </NavLink>
    );
  };

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      <NavItem item={dashboardItem} collapsed={collapsed} />
      
      <div className={cn("my-2 border-t border-slate-200 dark:border-slate-800", collapsed ? "mx-2" : "mx-4")} />
      
      {iamItems.map((item) => (
        <NavItem key={item.name} item={item} collapsed={collapsed} />
      ))}
      
      <div className={cn("my-2 border-t border-slate-200 dark:border-slate-800", collapsed ? "mx-2" : "mx-4")} />
      
      {!collapsed && (
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Available Resources
        </div>
      )}
      
      {resourceItems.map((item) => (
        <NavItem key={item.name} item={item} collapsed={collapsed} />
      ))}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:block border-r bg-white dark:bg-slate-900 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className={cn(
            "flex h-16 items-center border-b transition-all duration-300 overflow-hidden",
            isCollapsed ? "justify-center px-0" : "px-4"
          )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggle} className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Sidebar</TooltipContent>
          </Tooltip>
            {!isCollapsed && (
              <div className="flex items-center gap-2 whitespace-nowrap text-slate-900 dark:text-white ml-2">
                <img src={logo} alt="Change Networks" className="w-44 h-auto object-contain shrink-0" />
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto py-4">
            <nav className={cn(
              "grid items-start text-sm font-medium",
              isCollapsed ? "gap-2 px-0" : "gap-1 px-4"
            )}>
              <NavContent collapsed={isCollapsed} />
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={(open) => !open && onMobileClose()}>
        <SheetContent side="left" className="flex flex-col w-[250px] sm:w-[300px] p-0">
          <div className="flex h-16 items-center border-b px-6 text-slate-900 dark:text-white">
            <div className="flex items-center gap-2 w-full">
              <img src={logo} alt="Change Networks" className="w-44 h-auto object-contain shrink-0" />
            </div>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid gap-1 px-4 text-sm font-medium">
              <NavContent collapsed={false} />
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
