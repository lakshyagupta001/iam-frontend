import { useState } from 'react';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/modules/iam/features/users/services/users.service';
import { groupsApi } from '@/modules/iam/features/groups/services/groups.service';
import { policiesApi } from '@/modules/iam/features/policies/services/policies.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Loader2, UserCog } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';

export default function UsersList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['users', { page, limit, search }],
    queryFn: () => usersApi.listUsers({ page, limit, search }),
  });

  const { data: allGroupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.listGroups({ limit: 100 }),
    enabled: isCreating && !!user?.isRoot,
  });

  const { data: allPoliciesData } = useQuery({
    queryKey: ['policies'],
    queryFn: () => policiesApi.listPolicies({ limit: 100, type: 'MANAGED' }),
    enabled: isCreating && !!user?.isRoot,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const newUser = await usersApi.createUser({ name, email, password });
      const newUserId = newUser.id;
      
      const promises: Promise<any>[] = [];

      if (selectedGroupIds.length > 0) {
        selectedGroupIds.forEach(groupId => {
          promises.push(groupsApi.addMember(groupId, newUserId));
        });
      }

      if (selectedPolicyIds.length > 0) {
        selectedPolicyIds.forEach(policyId => {
          promises.push(usersApi.attachPolicy(newUserId, policyId));
        });
      }

      if (promises.length > 0) {
        const results = await Promise.allSettled(promises);
        const hasFailures = results.some(r => r.status === 'rejected');
        
        if (hasFailures) {
          toast.warning('User created successfully. Some groups or policies could not be assigned.');
        } else {
          toast.success('User created and access assigned successfully');
        }
      } else {
        toast.success('User created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreating(false);
      setName('');
      setEmail('');
      setPassword('');
      setSelectedGroupIds([]);
      setSelectedPolicyIds([]);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        const errorData = error.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          toast.error(errorData.errors[0]?.message || 'Validation failed');
        } else {
          toast.error(errorData?.message || 'Failed to create user');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const users = paginatedData?.data || [];
  const pagination = paginatedData?.pagination;
  const groupsOptions = (allGroupsData?.data || []).map(g => ({ ...g, description: g.description ?? undefined }));
  const policiesOptions = (allPoliciesData?.data || []).map(p => ({ ...p, description: p.description ?? undefined }));

  return (
    <div className="space-y-6">
      <PageToolbar
        searchPlaceholder="Search Users..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        primaryAction={
          user?.isRoot && (
            <PrimaryButton onClick={() => setIsCreating(!isCreating)} icon={UserPlus}>
              New User
            </PrimaryButton>
          )
        }
      />

      {isCreating && user?.isRoot && (
        <Card className="border-blue-100 shadow-md shadow-blue-500/5 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>
              Add a new user to your organization. They will be able to log in immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">Name</label>
                  <Input required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">Email</label>
                  <Input required type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">Password</label>
                  <Input required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5 sm:col-span-4">
                  <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">Assign Groups (Optional)</label>
                  <MultiSelectDropdown 
                    options={groupsOptions} 
                    selectedIds={selectedGroupIds} 
                    onChange={setSelectedGroupIds} 
                    placeholder="Select groups..."
                    searchPlaceholder="Search groups..."
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-4">
                  <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">Attach Policies (Optional)</label>
                  <MultiSelectDropdown 
                    options={policiesOptions} 
                    selectedIds={selectedPolicyIds} 
                    onChange={setSelectedPolicyIds} 
                    placeholder="Select policies..."
                    searchPlaceholder="Search policies..."
                  />
                </div>
                <div className="flex gap-2 sm:col-span-4 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={users}
        isLoading={isLoading}
        emptyMessage="No users found."
        pagination={pagination}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
        columns={[
          {
            header: "Name",
            cell: (u) => <span className="font-medium">{u.name}</span>,
          },
          {
            header: "Email",
            cell: (u) => <span className="text-slate-500">{u.email}</span>,
          },
          {
            header: "Role",
            cell: (u) => u.isRoot ? <Badge variant="destructive">ROOT</Badge> : <Badge variant="secondary">USER</Badge>,
          },
          {
            header: "Actions",
            cell: (u) => (
              <DataTableRowActions
                onView={() => navigate(`/iam/users/${u.id}`)}
                onEdit={() => navigate(`/iam/users/${u.id}/edit`)}
                viewAction="iam:GetUser"
                editAction={[
                  'iam:AddUserToGroup',
                  'iam:RemoveUserFromGroup',
                  'iam:AttachUserPolicy',
                  'iam:DetachUserPolicy',
                  'iam:PutUserBoundary',
                  'iam:DeleteUserBoundary'
                ]}
                editIcon={<UserCog className="h-4 w-4" />}
                editLabel="Manage Access"
              />
            ),
          }
        ]}
      />
    </div>
  );
}
