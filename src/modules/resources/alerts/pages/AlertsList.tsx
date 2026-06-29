import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageToolbar } from '@/components/ui/page-toolbar';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';
import { Plus, Bell } from 'lucide-react';
import { useAlerts, useCreateAlert, useDeleteAlert } from '../hooks/useAlerts';
import { AlertForm } from '../components/AlertForm';
import { PermissionButton } from '@/modules/iam/components/PermissionButton';
import axios from 'axios';

const getSeverityColor = (severity: string) => {
  switch (severity.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200';
    case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
  }
};

export default function AlertsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);
  const [isCreating, setIsCreating] = useState(false);

  const { data: alertsResponse, isLoading } = useAlerts({ page, limit, search });
  const createMutation = useCreateAlert();
  const deleteMutation = useDeleteAlert();

  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Alert created successfully');
      setIsCreating(false);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to create alert');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Alert deleted successfully');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to delete alert');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const paginatedAlerts = alertsResponse?.data || [];
  const totalPages = alertsResponse?.pagination.totalPages || 0;
  const totalItems = alertsResponse?.pagination.totalItems || 0;
  const hasNext = alertsResponse?.pagination.hasNext || false;
  const hasPrevious = alertsResponse?.pagination.hasPrevious || false;

  return (
    <div className="space-y-6">
      <PageToolbar
        searchPlaceholder="Search Alerts..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        primaryAction={
          <PermissionButton
            action="alerts:Create"
            onClick={() => setIsCreating(!isCreating)}
            tooltip="Create Alert"
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            New Alert
          </PermissionButton>
        }
      />

      {isCreating && (
        <Card className="border-blue-100 shadow-md shadow-blue-500/5 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
            <CardDescription>
              Create a new alert in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertForm 
              onSubmit={handleCreate} 
              isSubmitting={createMutation.isPending} 
              onCancel={() => setIsCreating(false)}
            />
          </CardContent>
        </Card>
      )}

      <DataTable
        data={paginatedAlerts}
        isLoading={isLoading}
        emptyMessage="No alerts found."
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
            cell: (a) => (
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{a.title}</span>
              </div>
            ),
          },
          {
            header: "Message",
            cell: (a) => <span className="text-slate-500 text-sm line-clamp-1">{a.message || '-'}</span>,
          },
          {
            header: "Severity",
            cell: (a) => <Badge variant="outline" className={getSeverityColor(a.severity)}>{a.severity}</Badge>,
          },
          {
            header: "Created At",
            cell: (a) => <span className="text-slate-500 text-sm">{new Date(a.createdAt).toLocaleString()}</span>,
          },
          {
            header: "Actions",
            cell: (a) => (
              <DataTableRowActions
                onView={() => navigate(`/alerts/${a.id}`)}
                onEdit={() => navigate(`/alerts/${a.id}/edit`)}
                onDelete={() => handleDelete(a.id)}
                viewAction="alerts:Read"
                editAction="alerts:Update"
                deleteAction="alerts:Delete"
              />
            ),
          }
        ]}
      />
    </div>
  );
}
