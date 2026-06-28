import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../../api/groups.api';
import { usersApi } from '../../../api/users.api';
import { policiesApi } from '../../../api/policies.api';
import { Button } from '../../../components/ui/button';
import { PermissionButton } from '../../../components/iam/PermissionButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Loader2, ArrowLeft, Shield, Users as UsersIcon, Plus, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { DataTable } from '../../../components/ui/data-table';
import { DataTableRowActions } from '../../../components/ui/data-table-actions';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../components/ui/tooltip';

export default function GroupEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { data: group, isLoading } = useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.getGroup(id!),
    enabled: !!id,
  });

  const { data: allUsersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.listUsers({ limit: 100 }),
  });

  const { data: allPoliciesData } = useQuery({
    queryKey: ['policies'],
    queryFn: () => policiesApi.listPolicies({ limit: 100, type: 'MANAGED' }),
  });

  const updateGroupMutation = useMutation({
    mutationFn: (data: { name: string, description: string }) => groupsApi.updateGroup(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      setIsEditDialogOpen(false);
      toast.success('Group updated successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        const errorData = error.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          toast.error(errorData.errors[0]?.message || 'Validation failed');
        } else {
          toast.error(errorData?.message || 'Failed to update group');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const addUserMutation = useMutation({
    mutationFn: (userId: string) => groupsApi.addMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      setIsUserDialogOpen(false);
      setSelectedUser('');
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

  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => groupsApi.removeMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      toast.success('User removed from group successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to remove user');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const attachPolicyMutation = useMutation({
    mutationFn: (policyId: string) => groupsApi.attachPolicy(id!, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
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
    mutationFn: (policyId: string) => groupsApi.detachPolicy(id!, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
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

  const availableUsers = allUsersData?.data.filter(u => !groupMembers.find(gm => gm.id === u.id)) || [];
  const availablePolicies = allPoliciesData?.data.filter(p => !groupPolicies.find(gp => gp.id === p.id)) || [];

  const openEditDialog = () => {
    setEditName(group.name);
    setEditDescription(group.description || '');
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGroupMutation.mutate({ name: editName, description: editDescription });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => navigate('/iam/groups')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Groups</TooltipContent>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-sm text-slate-500">{group.description || 'No description provided'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <PermissionButton action="iam:UpdateGroup" variant="outline" onClick={openEditDialog} tooltip="Edit Group">
                <Edit2 className="h-4 w-4 mr-2" /> Edit Group
              </PermissionButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Group</DialogTitle>
                <DialogDescription>Update the details for this group.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input required value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="ghost" className="mr-2" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <PermissionButton action="iam:UpdateGroup" type="submit" disabled={updateGroupMutation.isPending} tooltip="Save Group">
                    {updateGroupMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </PermissionButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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

            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <PermissionButton action="iam:AddGroupMember" size="sm" variant="outline" tooltip="Add Member">
                  <Plus className="h-4 w-4 mr-2" /> Add Member
                </PermissionButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Member to Group</DialogTitle>
                  <DialogDescription>
                    Select a user to add to this group.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length === 0 && (
                        <SelectItem value="none" disabled>No available users</SelectItem>
                      )}
                      {availableUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                  <PermissionButton
                    action="iam:AddGroupMember"
                    onClick={() => addUserMutation.mutate(selectedUser)}
                    disabled={!selectedUser || addUserMutation.isPending}
                    tooltip="Add Member"
                  >
                    {addUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add
                  </PermissionButton>
                </div>
              </DialogContent>
            </Dialog>
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
                {
                  header: "Actions",
                  cell: (u) => (
                    <DataTableRowActions
                      deleteAction="iam:RemoveGroupMember"
                      onDelete={() => removeUserMutation.mutate(u.id)}
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
                <Shield className="h-5 w-5" /> Policies
              </CardTitle>
              <CardDescription>Policies attached to this group</CardDescription>
            </div>

            <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
              <DialogTrigger asChild>
                <PermissionButton action="iam:AttachGroupPolicy" size="sm" variant="outline" tooltip="Attach Policy">
                  <Plus className="h-4 w-4 mr-2" /> Attach Policy
                </PermissionButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Attach Policy to Group</DialogTitle>
                  <DialogDescription>
                    Select a policy to attach. All members of this group will inherit its permissions.
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
                    action="iam:AttachGroupPolicy"
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
                {
                  header: "Actions",
                  cell: (p) => (
                    <DataTableRowActions
                      deleteAction="iam:DetachGroupPolicy"
                      onDelete={() => detachPolicyMutation.mutate(p.id)}
                    />
                  ),
                }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
