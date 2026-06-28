import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAlert, useUpdateAlert } from '../hooks/useAlerts';
import { AlertForm } from '../components/AlertForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';

export default function ManageAlert() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: alert, isLoading, error } = useAlert(id!);
  const updateMutation = useUpdateAlert();

  useEffect(() => {
    if (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        // 403 is handled globally by axios interceptor
        navigate('/alerts');
      } else {
        toast.error('Failed to load alert details');
      }
    }
  }, [error, navigate]);

  const handleUpdate = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data });
      toast.success('Alert updated successfully');
      navigate('/alerts');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to update alert');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!alert) {
    return null; // Handled by useEffect error
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/alerts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Alert</h1>
          <p className="text-sm text-slate-500">Update alert details.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert Information</CardTitle>
          <CardDescription>
            Modify the title, message, or severity of the alert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertForm 
            defaultValues={alert} 
            onSubmit={handleUpdate} 
            isSubmitting={updateMutation.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
