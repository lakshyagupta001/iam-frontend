import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageToolbar } from '@/components/ui/page-toolbar';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';
import { Plus, FileText } from 'lucide-react';
import { useReports, useCreateReport, useDeleteReport } from '../hooks/useReports';
import { ReportForm } from '../components/ReportForm';
import { PermissionButton } from '@/modules/iam/components/PermissionButton';
import axios from 'axios';

export default function ReportsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);
  const [isCreating, setIsCreating] = useState(false);

  const { data: reportsResponse, isLoading } = useReports({ page, limit, search });
  const createMutation = useCreateReport();
  const deleteMutation = useDeleteReport();

  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Report created successfully');
      setIsCreating(false);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to create report');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Report deleted successfully');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to delete report');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  // Server-side filtering and pagination
  const paginatedReports = reportsResponse?.data || [];
  const totalPages = reportsResponse?.pagination.totalPages || 0;
  const totalItems = reportsResponse?.pagination.totalItems || 0;
  const hasNext = reportsResponse?.pagination.hasNext || false;
  const hasPrevious = reportsResponse?.pagination.hasPrevious || false;

  return (
    <div className="space-y-6">
      <PageToolbar
        searchPlaceholder="Search Reports..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        primaryAction={
          <PermissionButton
            action="reports:Create"
            onClick={() => setIsCreating(!isCreating)}
            tooltip="Create Report"
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            New Report
          </PermissionButton>
        }
      />

      {isCreating && (
        <Card className="border-blue-100 shadow-md shadow-blue-500/5 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle>Create New Report</CardTitle>
            <CardDescription>
              Create a new report in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportForm 
              onSubmit={handleCreate} 
              isSubmitting={createMutation.isPending} 
              onCancel={() => setIsCreating(false)}
            />
          </CardContent>
        </Card>
      )}

      <DataTable
        data={paginatedReports}
        isLoading={isLoading}
        emptyMessage="No reports found."
        pagination={{
          page,
          limit,
          totalItems,
          totalPages,
          hasNext,
          hasPrevious
        }}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
        columns={[
          {
            header: "Title",
            cell: (r) => (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{r.title}</span>
              </div>
            ),
          },
          {
            header: "Description",
            cell: (r) => <span className="text-slate-500 text-sm line-clamp-1">{r.description || '-'}</span>,
          },
          {
            header: "Status",
            cell: (r) => <Badge variant="outline">{r.status}</Badge>,
          },
          {
            header: "Created",
            cell: (r) => <span className="text-slate-500 text-sm">{new Date(r.createdAt).toLocaleDateString()}</span>,
          },
          {
            header: "Actions",
            cell: (r) => (
              <DataTableRowActions
                onView={() => navigate(`/reports/${r.id}`)}
                onEdit={() => navigate(`/reports/${r.id}/edit`)}
                onDelete={() => handleDelete(r.id)}
                viewAction="reports:Read"
                editAction="reports:Update"
                deleteAction="reports:Delete"
              />
            ),
          }
        ]}
      />
    </div>
  );
}
