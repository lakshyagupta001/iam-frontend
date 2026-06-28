import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '@/modules/iam/features/policies/services/policies.service';
import { Button } from '@/components/ui/button';
import { PermissionButton } from '@/modules/iam/components/PermissionButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { PolicyStatement } from '@/modules/iam/types/iam.types';
import axios from 'axios';

export default function PolicyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: policy, isLoading: isFetching } = useQuery({
    queryKey: ['policies', id],
    queryFn: () => policiesApi.getPolicy(id!),
    enabled: !!id,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'MANAGED' | 'INLINE'>('MANAGED');
  const [statements, setStatements] = useState<PolicyStatement[]>([]);

  useEffect(() => {
    if (policy) {
      setName(policy.name);
      setDescription(policy.description || '');
      setType(policy.type);
      setStatements(policy.statements || []);
    }
  }, [policy]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => policiesApi.updatePolicy(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policies', id] });
      toast.success('Policy updated successfully');
      navigate('/iam/policies');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        const errorData = error.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          toast.error(errorData.errors[0]?.message || 'Validation failed. Check the form.');
        } else {
          toast.error(errorData?.message || 'Failed to update policy');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedStatements = statements.map(stmt => ({
      ...stmt,
      actions: stmt.actions.map(a => a.trim()).filter(Boolean)
    }));
    updateMutation.mutate({ name, description, type, statements: formattedStatements });
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

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!policy) {
    return <div>Policy not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => navigate('/iam/policies')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to Policies</TooltipContent>
        </Tooltip>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Policy</h1>
          <p className="text-sm text-slate-500">Modify access rules and permissions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Policy</CardTitle>
            <CardDescription>Basic information about this policy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Policy Name</label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. S3ReadOnlyAccess" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Policy Type</label>
                <Select disabled value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANAGED">Managed (Reusable)</SelectItem>
                    <SelectItem value="INLINE">Inline (Specific)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this policy grants..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Policy Statements</CardTitle>
              <CardDescription>Define the exact permissions.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addStatement}>
              <Plus className="h-4 w-4 mr-2" /> Add Statement
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {statements.map((stmt, index) => (
              <div key={index} className="p-4 border rounded-lg bg-slate-50 relative group dark:bg-slate-900">
                {statements.length > 1 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-0 group-hover:opacity-100 transition-opacity"
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
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/iam/policies')}>Cancel</Button>
          <PermissionButton action="iam:UpdatePolicy" type="submit" disabled={updateMutation.isPending} tooltip="Save Policy">
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </PermissionButton>
        </div>
      </form>
    </div>
  );
}
