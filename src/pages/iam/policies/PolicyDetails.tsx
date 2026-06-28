import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { policiesApi } from '../../../api/policies.api';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Loader2, ArrowLeft, FileJson, Shield } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../components/ui/tooltip';

export default function PolicyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: policy, isLoading } = useQuery({
    queryKey: ['policies', id],
    queryFn: () => policiesApi.getPolicy(id!),
    enabled: !!id,
  });

  if (isLoading) {
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
          <h1 className="text-2xl font-bold tracking-tight">{policy.name}</h1>
          <p className="text-sm text-slate-500">{policy.description || 'No description provided'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {policy.type === 'MANAGED' ? (
            <Badge variant="default" className="bg-emerald-500">MANAGED</Badge>
          ) : (
            <Badge variant="outline">INLINE</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" /> Policy Document
              </CardTitle>
              <CardDescription>JSON representation of the statements</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm text-slate-50 font-mono">
              <pre>{JSON.stringify({ Version: "2012-10-17", Statement: policy.statements }, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Statements Overview
            </CardTitle>
            <CardDescription>Human-readable breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policy.statements.map((stmt, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={stmt.effect === 'Allow' ? 'default' : 'destructive'}>
                      {stmt.effect}
                    </Badge>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Statement {idx + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {stmt.actions.map(action => (
                          <Badge key={action} variant="secondary" className="font-mono text-xs">{action}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</span>
                      <div className="mt-1">
                        <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                          {Array.isArray(stmt.resource) ? stmt.resource.join(', ') : stmt.resource}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
