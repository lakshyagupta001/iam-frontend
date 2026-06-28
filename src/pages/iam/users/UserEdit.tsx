import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../api/users.api';
import { groupsApi } from '../../../api/groups.api';
import { policiesApi } from '../../../api/policies.api';
import { Button } from '../../../components/ui/button';
import { PermissionButton } from '../../../components/iam/PermissionButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Loader2, ArrowLeft, Shield, Users as UsersIcon, Plus, Lock } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { DataTable } from '../../../components/ui/data-table';
import { DataTableRowActions } from '../../../components/ui/data-table-actions';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../components/ui/tooltip';

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [isBoundaryDialogOpen, setIsBoundaryDialogOpen] = useState(false);
  const [selectedBoundary, setSelectedBoundary] = useState<string>('');

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

  // Queries for the available groups and policies to add
  const { data: allGroupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.listGroups({ limit: 100 }), // Get all for dropdown
  });

  const { data: allPoliciesData } = useQuery({
    queryKey: ['policies'],
    queryFn: () => policiesApi.listPolicies({ limit: 100, type: 'MANAGED' }), // Get MANAGED only for dropdown
  });

  const addGroupMutation = useMutation({
    mutationFn: (groupId: string) => groupsApi.addMember(groupId, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      setIsGroupDialogOpen(false);
      setSelectedGroup('');
      toast.success('User added to group successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to add user to group');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const removeGroupMutation = useMutation({
    mutationFn: (groupId: string) => groupsApi.removeMember(groupId, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      toast.success('User removed from group successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to remove user from group');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const attachPolicyMutation = useMutation({
    mutationFn: (policyId: string) => usersApi.attachPolicy(id!, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      setIsPolicyDialogOpen(false);
      setSelectedPolicy('');
      toast.success('Policy attached successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to attach policy');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const detachPolicyMutation = useMutation({
    mutationFn: (policyId: string) => usersApi.detachPolicy(id!, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      toast.success('Policy detached successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to detach policy');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const assignBoundaryMutation = useMutation({
    mutationFn: (policyId: string) => usersApi.assignBoundary(id!, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      setIsBoundaryDialogOpen(false);
      setSelectedBoundary('');
      toast.success('Permission boundary assigned successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to assign boundary');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const removeBoundaryMutation = useMutation({
    mutationFn: () => usersApi.removeBoundary(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      toast.success('Permission boundary removed successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to remove boundary');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
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

  const availableGroups = allGroupsData?.data.filter(g => !userGroups.find(ug => ug.id === g.id)) || [];
  const availablePolicies = allPoliciesData?.data.filter(p => !userPolicies.find(up => up.id === p.id)) || [];

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
          <h1 className="text-2xl font-bold tracking-tight">Manage User Access</h1>
          <p className="text-sm text-slate-500">{user.name} ({user.email})</p>
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
            
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <PermissionButton action="iam:AddGroupMember" size="sm" variant="outline" tooltip="Add to Group">
                  <Plus className="h-4 w-4 mr-2" /> Add to Group
                </PermissionButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add User to Group</DialogTitle>
                  <DialogDescription>
                    Select a group to add this user to.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGroups.length === 0 && (
                        <SelectItem value="none" disabled>No available groups</SelectItem>
                      )}
                      {availableGroups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" onClick={() => setIsGroupDialogOpen(false)}>Cancel</Button>
                  <PermissionButton 
                    action="iam:AddGroupMember"
                    onClick={() => addGroupMutation.mutate(selectedGroup)} 
                    disabled={!selectedGroup || addGroupMutation.isPending}
                    tooltip="Add to Group"
                  >
                    {addGroupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add
                  </PermissionButton>
                </div>
              </DialogContent>
            </Dialog>

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
                {
                  header: "Actions",
                  cell: (g) => (
                    <DataTableRowActions
                      deleteAction="iam:RemoveGroupMember"
                      onDelete={() => removeGroupMutation.mutate(g.id)}
                    />
                  ),
                }
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

            <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
              <DialogTrigger asChild>
                <PermissionButton action="iam:AttachUserPolicy" size="sm" variant="outline" tooltip="Attach Policy">
                  <Plus className="h-4 w-4 mr-2" /> Attach Policy
                </PermissionButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Attach Policy</DialogTitle>
                  <DialogDescription>
                    Select a policy to attach to this user.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePolicies.length === 0 && (
                        <SelectItem value="none" disabled>No available policies</SelectItem>
                      )}
                      {availablePolicies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" onClick={() => setIsPolicyDialogOpen(false)}>Cancel</Button>
                  <PermissionButton 
                    action="iam:AttachUserPolicy"
                    onClick={() => attachPolicyMutation.mutate(selectedPolicy)} 
                    disabled={!selectedPolicy || attachPolicyMutation.isPending}
                    tooltip="Attach Policy"
                  >
                    {attachPolicyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Attach
                  </PermissionButton>
                </div>
              </DialogContent>
            </Dialog>

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
                {
                  header: "Actions",
                  cell: (p) => (
                    <DataTableRowActions
                      deleteAction="iam:DetachUserPolicy"
                      onDelete={() => detachPolicyMutation.mutate(p.id)}
                    />
                  ),
                }
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
            <CardDescription>A managed policy that sets the maximum permissions this user can have</CardDescription>
          </div>
          
          <Dialog open={isBoundaryDialogOpen} onOpenChange={setIsBoundaryDialogOpen}>
            <DialogTrigger asChild>
              <PermissionButton action="iam:PutUserBoundary" size="sm" variant="outline" tooltip="Assign Boundary">
                <Plus className="h-4 w-4 mr-2" /> Assign Boundary
              </PermissionButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Permission Boundary</DialogTitle>
                <DialogDescription>
                  Select a managed policy to act as a permission boundary for this user.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={selectedBoundary} onValueChange={setSelectedBoundary}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a boundary policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPoliciesData?.data.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setIsBoundaryDialogOpen(false)}>Cancel</Button>
                <PermissionButton 
                  action="iam:PutUserBoundary"
                  onClick={() => assignBoundaryMutation.mutate(selectedBoundary)} 
                  disabled={!selectedBoundary || assignBoundaryMutation.isPending}
                  tooltip="Assign Boundary"
                >
                  {assignBoundaryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assign
                </PermissionButton>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {boundary ? (
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg">{boundary.policy.name}</span>
                  <Badge variant="destructive">BOUNDARY</Badge>
                </div>
                <p className="text-sm text-slate-500">{boundary.policy.description || 'No description provided'}</p>
              </div>
              <PermissionButton 
                action="iam:DeleteUserBoundary"
                variant="outline" 
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={() => removeBoundaryMutation.mutate()}
                disabled={removeBoundaryMutation.isPending}
                tooltip="Remove Boundary"
              >
                {removeBoundaryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Remove Boundary
              </PermissionButton>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">
              No boundary assigned. This user's permissions are unrestricted.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
