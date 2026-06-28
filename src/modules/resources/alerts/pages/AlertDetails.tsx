import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Calendar, Edit, Loader2 } from 'lucide-react';
import { PermissionButton } from '@/modules/iam/components/PermissionButton';

const getSeverityColor = (severity: string) => {
  switch (severity.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200';
    case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
  }
};

export default function AlertDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: alert, isLoading } = useAlert(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-900">Alert not found</h2>
        <p className="text-slate-500 mt-2">The alert you are looking for does not exist.</p>
        <Button className="mt-4" onClick={() => navigate('/alerts')}>Back to Alerts</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/alerts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alert Details</h1>
          <p className="text-sm text-slate-500">View detailed information about this alert.</p>
        </div>
        <div className="ml-auto">
          <PermissionButton 
            action="alerts:Update"
            onClick={() => navigate(`/alerts/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" /> Edit Alert
          </PermissionButton>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="h-5 w-5 text-slate-500" />
                {alert.title}
              </CardTitle>
              <CardDescription>ID: {alert.id}</CardDescription>
            </div>
            <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Message</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 text-sm whitespace-pre-wrap">
              {alert.message}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>Created on {new Date(alert.createdAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
