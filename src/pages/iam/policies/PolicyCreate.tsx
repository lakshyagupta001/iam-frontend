import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '../../../api/policies.api';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import type { PolicyStatement } from '../../../types';
import axios from 'axios';

export default function PolicyCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'MANAGED' | 'INLINE'>('MANAGED');
  const [statements, setStatements] = useState<PolicyStatement[]>([
    { effect: 'Allow', actions: ['reports:Read'], resource: '*' }
  ]);

  const createMutation = useMutation({
    mutationFn: policiesApi.createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy created successfully');
      navigate('/iam/policies');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          // If Zod validation errors, extract the first one or show generic validation failure
          toast.error(errorData.errors[0]?.message || 'Validation failed. Check the form.');
        } else {
          toast.error(errorData?.message || 'Failed to create policy');
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
    createMutation.mutate({ name, description, type, statements: formattedStatements });
  };

  const addStatement = () => {
    setStatements([...statements, { effect: 'Allow', actions: ['reports:Read'], resource: '*' }]);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/iam/policies')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Policy</h1>
          <p className="text-slate-500">Define access rules and permissions.</p>
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
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeStatement(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Effect</label>
                    <Select value={stmt.effect} onValueChange={(val: any) => updateStatement(index, 'effect', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Allow">Allow</SelectItem>
                        <SelectItem value="Deny">Deny</SelectItem>
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
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Policy
          </Button>
        </div>
      </form>
    </div>
  );
}
