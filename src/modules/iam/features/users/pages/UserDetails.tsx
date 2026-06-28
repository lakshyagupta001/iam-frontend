import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/modules/iam/features/users/services/users.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Shield, Users as UsersIcon, Lock } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { EffectivePermissions } from './components/EffectivePermissions';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getUser(id!),
    enabled: !!id,
  });

  const { data: boundary, isLoading: isBoundaryLoading } = useQuery({
    queryKey: ['users', id, 'boundary'],
    queryFn: () => usersApi.getBoundary(id!),
    enabled: !!id,
  });

  if (isUserLoading || isBoundaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const userGroups = user.groupMemberships?.map(gm => gm.group) || [];
  const userPolicies = user.directPolicies?.map(dp => dp.policy) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => navigate('/iam/users')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to Users</TooltipContent>
        </Tooltip>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="ml-auto">
          {user.isRoot && <Badge variant="destructive" className="ml-2">ROOT USER</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groups Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" /> Groups
              </CardTitle>
              <CardDescription>Groups this user belongs to</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={userGroups}
              emptyMessage="User does not belong to any groups."
              keyExtractor={(g) => g.id}
              columns={[
                {
                  header: "Group Name",
                  cell: (g) => <span className="font-medium">{g.name}</span>,
                },
                {
                  header: "Description",
                  cell: (g) => <span className="text-sm text-slate-500">{g.description || '-'}</span>,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Policies Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Direct Policies
              </CardTitle>
              <CardDescription>Policies attached directly to the user</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={userPolicies}
              emptyMessage="No direct policies attached."
              keyExtractor={(p) => p.id}
              columns={[
                {
                  header: "Policy Name",
                  cell: (p) => <span className="font-medium">{p.name}</span>,
                },
                {
                  header: "Description",
                  cell: (p) => <span className="text-sm text-slate-500">{p.description || '-'}</span>,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Permission Boundary
            </CardTitle>
            <CardDescription>A managed policy that sets the maximum permissions this user can have.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {boundary ? (
            <div className="p-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-lg">{boundary.policy.name}</span>
                <Badge variant="destructive">BOUNDARY</Badge>
              </div>
              <p className="text-sm text-slate-500">{boundary.policy.description || 'No description provided'}</p>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">
              No boundary assigned. This user's permissions are unrestricted.
            </div>
          )}
        </CardContent>
      </Card>

      <EffectivePermissions userId={user.id} />
    </div>
  );
}
