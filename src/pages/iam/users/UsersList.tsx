import { useState } from 'react';
import { PageToolbar } from '../../../components/ui/page-toolbar';
import { PrimaryButton } from '../../../components/ui/primary-button';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../api/users.api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { DataTable } from '../../../components/ui/data-table';
import { DataTableRowActions } from '../../../components/ui/data-table-actions';

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
  const [isCreating, setIsCreating] = useState(false);

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['users', { page, limit, search }],
    queryFn: () => usersApi.listUsers({ page, limit, search }),
  });

  const createMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreating(false);
      setName('');
      setEmail('');
      setPassword('');
      toast.success('User created successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          toast.error(errorData.errors[0]?.message || 'Validation failed');
        } else {
          toast.error(errorData?.message || 'Failed to create user');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, email, password });
  };

  const users = paginatedData?.data || [];
  const pagination = paginatedData?.pagination;

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
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Name</label>
                  <Input required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email</label>
                  <Input required type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Password</label>
                  <Input required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" variant="ghost" className="mr-2" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create User
                </Button>
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
              />
            ),
          }
        ]}
      />
    </div>
  );
}
