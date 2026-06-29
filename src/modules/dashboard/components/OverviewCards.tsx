import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { usersApi } from '@/modules/iam/features/users/services/users.service';
import { groupsApi } from '@/modules/iam/features/groups/services/groups.service';
import { Users, UsersIcon, FileText, Package, Lock, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RestrictedCardProps {
  title: string;
  description: string;
}

function RestrictedCard({ title, description }: RestrictedCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="border border-red-500 bg-red-50 text-red-600 dark:border-red-500/50 dark:bg-red-950/20 dark:text-red-400 opacity-90 cursor-not-allowed p-4 flex flex-col justify-center h-24 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-1">
             <span className="text-sm font-semibold uppercase tracking-wide">{title}</span>
             <Lock className="h-4 w-4 text-red-500/70" />
          </div>
          <div className="text-2xl font-bold">---</div>
          <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5 truncate">{description}</p>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col items-center gap-2 text-center">
          <span>Permission Required</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function OverviewCards() {
  const { user, hasPermission } = useAuth();

  const canListUsers = hasPermission('iam:ListUsers');
  const canListGroups = hasPermission('iam:ListGroups');

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['dashboard', 'users'],
    queryFn: () => usersApi.listUsers({ page: 1, limit: 1 }),
    enabled: canListUsers,
  });

  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['dashboard', 'groups'],
    queryFn: () => groupsApi.listGroups({ limit: 1 }),
    enabled: canListGroups,
  });

  const { data: myDetails, isLoading: isLoadingMyDetails } = useQuery({
    queryKey: ['dashboard', 'my-details', user?.id],
    queryFn: () => usersApi.getUser(user!.id),
    enabled: !!user?.id && !user?.isRoot,
  });

  const myPoliciesCount = useMemo(() => {
    if (!myDetails) return 0;
    const policyIds = new Set<string>();
    myDetails.directPolicies?.forEach((p: any) => policyIds.add(p.policy.id));
    myDetails.groupMemberships?.forEach((gm: any) => {
      gm.group.policies?.forEach((p: any) => policyIds.add(p.policy.id));
    });
    return policyIds.size;
  }, [myDetails]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Users Card */}
      {!canListUsers ? (
        <RestrictedCard title="Users" description="Total Users" />
      ) : (
        <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-center h-24">
          <div className="flex justify-between items-center mb-1">
             <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Users</span>
             <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {isLoadingUsers ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : (usersData?.pagination?.totalItems ?? 0)}
          </div>
        </Card>
      )}

      {/* Groups Card */}
      {!canListGroups ? (
        <RestrictedCard title="Groups" description="Total Groups" />
      ) : (
        <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-center h-24">
          <div className="flex justify-between items-center mb-1">
             <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Groups</span>
             <UsersIcon className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {isLoadingGroups ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : (groupsData?.pagination?.totalItems ?? 0)}
          </div>
        </Card>
      )}

      {/* My Policies Card */}
      <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-center h-24">
        <div className="flex justify-between items-center mb-1">
           <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">My Policies</span>
           <FileText className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {user?.isRoot ? (
            <span className="text-lg tracking-tight text-emerald-600 dark:text-emerald-400">All (Root)</span>
          ) : isLoadingMyDetails ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : (
            myPoliciesCount
          )}
        </div>
      </Card>

      {/* Resources Card */}
      <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-center h-24">
        <div className="flex justify-between items-center mb-1">
           <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Resources</span>
           <Package className="h-4 w-4 text-orange-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          4
        </div>
      </Card>
    </div>
  );
}
