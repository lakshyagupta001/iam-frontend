import { useParams, useNavigate } from 'react-router-dom';
import { useReport, useUpdateReport } from '../hooks/useReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ReportForm } from '../components/ReportForm';
import { toast } from 'sonner';
import axios from 'axios';

export default function ManageReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: report, isLoading } = useReport(id!);
  const updateMutation = useUpdateReport();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const handleUpdate = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data });
      toast.success('Report updated successfully');
      navigate('/reports');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to update report');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to Reports</TooltipContent>
        </Tooltip>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Report</h1>
          <p className="text-sm text-slate-500">Edit report details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Report</CardTitle>
          <CardDescription>
            Update the title, description, and status of this report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-2xl">
            <ReportForm 
              initialData={{
                title: report.title,
                description: report.description || undefined,
                status: report.status,
              }}
              onSubmit={handleUpdate}
              isSubmitting={updateMutation.isPending}
              isUpdate
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
