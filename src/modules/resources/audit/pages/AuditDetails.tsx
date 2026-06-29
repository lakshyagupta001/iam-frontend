import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Calendar, User, Activity } from 'lucide-react';
import { useAuditLog } from '../hooks/useAudit';

export default function AuditDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: log, isLoading, error } = useAuditLog(id as string);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-slate-500">Failed to load audit record details or record not found.</p>
        <Button onClick={() => navigate('/audit')} variant="outline">
          Back to Audit Logs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Button variant="outline" size="sm" onClick={() => navigate('/audit')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Audit Record Details</h1>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg">General Information</CardTitle>
          <CardDescription>Basic details about the action performed.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500">Timestamp</p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <User className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500">Performed By</p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">{log.performedBy}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Activity className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-500">Action</p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">{log.action}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-500">Details</p>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-4 text-sm font-mono whitespace-pre-wrap overflow-auto border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              {log.details || 'No additional details provided.'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
