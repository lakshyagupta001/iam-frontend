import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/modules/iam/features/users/services/users.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionNamespaceGroup } from './PermissionNamespaceGroup';
import { ShieldCheck, Search, ShieldX, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';

interface EffectivePermissionsProps {
  userId: string;
}

export function EffectivePermissions({ userId }: EffectivePermissionsProps) {
  const [search, setSearch] = useState('');

  const { data: permissions, isLoading, isError, error } = useQuery({
    queryKey: ['users', userId, 'effective-permissions'],
    queryFn: () => usersApi.getEffectivePermissions(userId),
    enabled: !!userId,
  });

  const { groupedPermissions, stats } = useMemo(() => {
    if (!permissions) return { groupedPermissions: {}, stats: { allowed: 0, denied: 0, namespaces: 0 } };

    const grouped: Record<string, { action: string; isAllowed: boolean }[]> = {};
    let allowedCount = 0;
    let deniedCount = 0;

    // Filter and group
    Object.entries(permissions).forEach(([action, isAllowed]) => {
      // Apply search filter (action string or namespace)
      if (search && !action.toLowerCase().includes(search.toLowerCase())) {
        return;
      }

      if (isAllowed) allowedCount++;
      else deniedCount++;

      const namespace = action.split(':')[0] || 'other';
      if (!grouped[namespace]) {
        grouped[namespace] = [];
      }
      grouped[namespace].push({ action, isAllowed });
    });

    return { 
      groupedPermissions: grouped, 
      stats: {
        allowed: allowedCount,
        denied: deniedCount,
        namespaces: Object.keys(grouped).length
      }
    };
  }, [permissions, search]);

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" /> Effective Permissions
          </CardTitle>
          <CardDescription>Calculating complete access profile...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mt-6 border-red-200">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center text-red-600">
          <ShieldX className="h-12 w-12 mb-2 text-red-400" />
          <h3 className="text-lg font-semibold mb-1">Failed to load permissions</h3>
          <p className="text-sm">{(error as any)?.message || 'An error occurred while fetching effective permissions.'}</p>
        </CardContent>
      </Card>
    );
  }

  const hasPermissions = permissions && Object.keys(permissions).length > 0;
  const noSearchResults = Object.keys(groupedPermissions).length === 0;

  return (
    <Card className="mt-6">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" /> Effective Permissions
        </CardTitle>
        <CardDescription>
          Final evaluated permissions resulting from direct policies, group memberships, and permission boundaries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center p-3 border rounded-lg bg-slate-50 shadow-sm">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mr-3">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Allowed</p>
              <h4 className="text-lg font-bold text-slate-800 leading-tight">{stats.allowed}</h4>
            </div>
          </div>
          <div className="flex items-center p-3 border rounded-lg bg-slate-50 shadow-sm">
            <div className="p-2 bg-red-100 text-red-600 rounded-full mr-3">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Denied</p>
              <h4 className="text-lg font-bold text-slate-800 leading-tight">{stats.denied}</h4>
            </div>
          </div>
          <div className="flex items-center p-3 border rounded-lg bg-slate-50 shadow-sm">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full mr-3">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Namespaces</p>
              <h4 className="text-lg font-bold text-slate-800 leading-tight">{stats.namespaces}</h4>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search Permissions by action or namespace (e.g. reports:Read)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Permissions List */}
        {!hasPermissions ? (
           <div className="text-center py-12 border rounded-lg bg-slate-50 border-dashed">
            <ShieldX className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">No permissions found for this user.</p>
          </div>
        ) : noSearchResults ? (
          <div className="text-center py-12 border rounded-lg bg-slate-50 border-dashed">
            <Search className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">No permissions match your search query.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-2 space-y-0">
            {Object.entries(groupedPermissions).map(([namespace, perms]) => (
              <PermissionNamespaceGroup 
                key={namespace} 
                namespace={namespace} 
                permissions={perms} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
