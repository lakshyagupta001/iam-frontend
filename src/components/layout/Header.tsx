import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '../ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = (pathname: string) => {
    if (pathname === '/iam/users') return 'Users';
    if (pathname.match(/^\/iam\/users\/[^/]+\/edit$/)) return 'Edit User';
    if (pathname.startsWith('/iam/users/')) return 'User Details';
    if (pathname === '/iam/groups') return 'Groups';
    if (pathname.match(/^\/iam\/groups\/[^/]+\/edit$/)) return 'Edit Group';
    if (pathname.startsWith('/iam/groups/')) return 'Group Details';
    if (pathname === '/iam/policies') return 'Policies';
    if (pathname.match(/^\/iam\/policies\/new$/)) return 'Create Policy';
    if (pathname.match(/^\/iam\/policies\/[^/]+\/edit$/)) return 'Edit Policy';
    if (pathname.startsWith('/iam/policies/')) return 'Policy Details';
    return 'IAM Console';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 dark:bg-slate-900">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-xl tracking-tight whitespace-nowrap">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="flex w-full items-center gap-4 ml-auto">
        <div className="ml-auto flex items-center space-x-4">
          {user?.isRoot && (
            <Badge variant="destructive" className="hidden sm:inline-flex">ROOT</Badge>
          )}

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center dark:bg-slate-800">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>User Profile</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
