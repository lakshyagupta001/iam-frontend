import { useState } from 'react';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '@/modules/iam/features/policies/services/policies.service';
import { Key, Plus, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';
import { PermissionButton } from '@/modules/iam/components/PermissionButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { PolicyStatement } from '@/modules/iam/types/iam.types';

export default function PoliciesList() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);
  const [policyToDelete, setPolicyToDelete] = useState<{ id: string, name: string } | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'MANAGED' | 'INLINE'>('MANAGED');
  const [statements, setStatements] = useState<PolicyStatement[]>([
    { effect: 'ALLOW', actions: ['reports:Read'], resource: '*' }
  ]);

  const queryClient = useQueryClient();
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['policies', { page, limit, search }],
    queryFn: () => policiesApi.listPolicies({ page, limit, search }),
  });

  const createMutation = useMutation({
    mutationFn: policiesApi.createPolicy,
  });

  const deleteMutation = useMutation({
    mutationFn: policiesApi.deletePolicy,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedStatements = statements.map(stmt => ({
      ...stmt,
      actions: stmt.actions.map(a => a.trim()).filter(Boolean)
    }));
    createMutation.mutate({ name, description, type, statements: formattedStatements }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['policies'] });
        setIsCreating(false);
        setName('');
        setDescription('');
        setType('MANAGED');
        setStatements([{ effect: 'ALLOW', actions: ['reports:Read'], resource: '*' }]);
        toast.success('Policy created successfully', { id: 'policy-create-success' });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) return;
          const errorData = error.response?.data;
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            toast.error(errorData.errors[0]?.message || 'Validation failed. Check the form.', { id: 'policy-create-error' });
          } else {
            toast.error(errorData?.message || 'Failed to create policy', { id: 'policy-create-error' });
          }
        } else {
          toast.error('An unexpected error occurred', { id: 'policy-create-error' });
        }
      }
    });
  };

  const addStatement = () => {
    setStatements([...statements, { effect: 'ALLOW', actions: ['reports:Read'], resource: '*' }]);
  };

  const removeStatement = (index: number) => {
    setStatements(statements.filter((_, i) => i !== index));
  };

  const updateStatement = (index: number, field: keyof PolicyStatement, value: any) => {
    const newStatements = [...statements];
    if (field === 'actions') {
      newStatements[index][field] = value.split(',');
    } else {
      newStatements[index][field] = value;
    }
    setStatements(newStatements);
  };

  const policies = paginatedData?.data || [];
  const pagination = paginatedData?.pagination;

  return (
    <div className="space-y-6">
      <PageToolbar
        searchPlaceholder="Search Policies..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        primaryAction={
          <PermissionButton action="iam:CreatePolicy" onClick={() => setIsCreating(!isCreating)} tooltip="Create Policy">
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Create Policy
          </PermissionButton>
        }
      />

      {isCreating && (
        <Card className="border-blue-100 shadow-md shadow-blue-500/5 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle>Create New Policy</CardTitle>
            <CardDescription>
              Define access rules and permissions for users or groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Policy Name</label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. S3ReadOnlyAccess" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Policy Type</label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANAGED">Managed (Reusable)</SelectItem>
                      <SelectItem value="INLINE">Inline (Specific)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this policy grants..." />
                </div>
              </div>

              <div className="border rounded-lg bg-slate-50 p-3 space-y-3 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Policy Statements</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addStatement}>
                    <Plus className="h-4 w-4 mr-2" /> Add Statement
                  </Button>
                </div>

                {statements.map((stmt, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-white relative group dark:bg-slate-950">
                    {statements.length > 1 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeStatement(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove Statement</TooltipContent>
                      </Tooltip>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Effect</label>
                        <Select value={stmt.effect} onValueChange={(val: any) => updateStatement(index, 'effect', val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALLOW">ALLOW</SelectItem>
                            <SelectItem value="DENY">DENY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Actions (Comma-separated)</label>
                        <Input required value={stmt.actions.join(',')} onChange={e => updateStatement(index, 'actions', e.target.value)} placeholder="e.g. s3:GetObject, s3:ListBucket" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Resource</label>
                        <Input required value={stmt.resource as string} onChange={e => updateStatement(index, 'resource', e.target.value)} placeholder="e.g. arn:aws:s3:::my-bucket/* or *" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="button" variant="ghost" className="mr-2" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Policy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={policies}
        isLoading={isLoading}
        emptyMessage="No policies found."
        pagination={pagination}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
        columns={[
          {
            header: "Policy Name",
            cell: (p) => (
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{p.name}</span>
              </div>
            ),
          },
          {
            header: "Type",
            cell: (p) => p.type === 'MANAGED' ? (
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">MANAGED</Badge>
            ) : (
              <Badge variant="outline">INLINE</Badge>
            ),
          },
          {
            header: "Description",
            cell: (p) => <span className="text-slate-500 max-w-xs truncate">{p.description || '-'}</span>,
          },
          {
            header: "Actions",
            cell: (p) => (
              <DataTableRowActions
                viewAction="iam:GetPolicy"
                editAction="iam:UpdatePolicy"
                deleteAction="iam:DeletePolicy"
                onView={() => navigate(`/iam/policies/${p.id}`)}
                onEdit={() => navigate(`/iam/policies/${p.id}/edit`)}
                onDelete={() => {
                  setPolicyToDelete({ id: p.id, name: p.name });
                }}
              />
            ),
          }
        ]}
      />

      <ConfirmDialog
        open={!!policyToDelete}
        onOpenChange={(open) => !open && setPolicyToDelete(null)}
        title="Delete Policy"
        description={<>Are you sure you want to delete the policy <strong>{policyToDelete?.name}</strong>? This action cannot be undone.</>}
        confirmText="Delete"
        destructive={true}
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          if (policyToDelete) {
            deleteMutation.mutate(policyToDelete.id, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['policies'] });
                toast.success('Policy deleted successfully', { id: 'policy-delete-success' });
                setPolicyToDelete(null);
              },
              onError: (error) => {
                if (axios.isAxiosError(error)) {
                  if (error.response?.status === 403) {
                    setPolicyToDelete(null);
                    return;
                  }
                  toast.error(error.response?.data?.message || 'Failed to delete policy', { id: 'policy-delete-error' });
                } else {
                  toast.error('An unexpected error occurred', { id: 'policy-delete-error' });
                }
                setPolicyToDelete(null);
              }
            });
          }
        }}
      />
    </div>
  );
}
