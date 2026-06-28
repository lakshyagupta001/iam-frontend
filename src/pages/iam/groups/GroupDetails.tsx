import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../../../api/groups.api';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Loader2, ArrowLeft, Shield, Users as UsersIcon } from 'lucide-react';
import { DataTable } from '../../../components/ui/data-table';

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: group, isLoading } = useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.getGroup(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const groupMembers = group.memberships?.map(m => m.user) || [];
  const groupPolicies = group.policyAttachments?.map(p => p.policy) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/iam/groups')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-sm text-slate-500">{group.description || 'No description provided'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Members Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" /> Members
              </CardTitle>
              <CardDescription>Users who belong to this group</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={groupMembers}
              emptyMessage="No members in this group."
              keyExtractor={(u) => u.id}
              columns={[
                {
                  header: "Name",
                  cell: (u) => <span className="font-medium">{u.name}</span>,
                },
                {
                  header: "Email",
                  cell: (u) => <span className="text-sm text-slate-500">{u.email}</span>,
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
                <Shield className="h-5 w-5" /> Policies
              </CardTitle>
              <CardDescription>Policies attached to this group</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={groupPolicies}
              emptyMessage="No policies attached."
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
    </div>
  );
}
