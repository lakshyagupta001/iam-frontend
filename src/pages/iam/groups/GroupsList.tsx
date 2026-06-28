import { useState } from 'react';
import { PageToolbar } from '../../../components/ui/page-toolbar';
import { PrimaryButton } from '../../../components/ui/primary-button';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../../api/groups.api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Shield, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';

import { DataTable } from '../../../components/ui/data-table';
import { DataTableRowActions } from '../../../components/ui/data-table-actions';

export default function GroupsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [isCreating, setIsCreating] = useState(false);

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['groups', { page, limit, search }],
    queryFn: () => groupsApi.listGroups({ page, limit, search }),
  });

  const createMutation = useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsCreating(false);
      setName('');
      setDescription('');
      toast.success('Group created successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          toast.error(errorData.errors[0]?.message || 'Validation failed');
        } else {
          toast.error(errorData?.message || 'Failed to create group');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: groupsApi.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group deleted successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete group');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, description });
  };

  const groups = paginatedData?.data || [];
  const pagination = paginatedData?.pagination;

  return (
    <div className="space-y-6">
      <PageToolbar
        searchPlaceholder="Search Groups..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        primaryAction={
          <PrimaryButton onClick={() => setIsCreating(!isCreating)} icon={Plus}>
            New Group
          </PrimaryButton>
        }
      />

      {isCreating && (
        <Card className="border-blue-100 shadow-md shadow-blue-500/5 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
            <CardDescription>
              Create a group to collectively manage policies for multiple users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Name</label>
                  <Input required placeholder="e.g. Developers" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Description</label>
                  <Input placeholder="Optional description..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" variant="ghost" className="mr-2" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Group
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={groups}
        isLoading={isLoading}
        emptyMessage="No groups found."
        pagination={pagination}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
        columns={[
          {
            header: "Name",
            cell: (g) => (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{g.name}</span>
              </div>
            ),
          },
          {
            header: "Description",
            cell: (g) => <span className="text-slate-500">{g.description || '-'}</span>,
          },
          {
            header: "Actions",
            cell: (g) => (
              <DataTableRowActions
                onView={() => navigate(`/iam/groups/${g.id}`)}
                onEdit={() => navigate(`/iam/groups/${g.id}/edit`)}
                onDelete={() => {
                  if (window.confirm('Are you sure you want to delete this group?')) {
                    deleteMutation.mutate(g.id);
                  }
                }}
              />
            ),
          }
        ]}
      />
    </div>
  );
}
