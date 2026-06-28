import { useState } from 'react';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { DataTable } from '@/components/ui/data-table';
import { Activity, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { useAuditLogs } from '../hooks/useAudit';

const getActionIcon = (action: string) => {
  if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('remove')) {
    return <ShieldAlert className="h-4 w-4 text-red-500" />;
  }
  if (action.toLowerCase().includes('create') || action.toLowerCase().includes('add')) {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
  return <Activity className="h-4 w-4 text-blue-500" />;
};

export default function AuditList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(15);

  const { data: auditResponse, isLoading } = useAuditLogs({ page, limit, search });

  const paginatedLogs = auditResponse?.data || [];
  const totalPages = auditResponse?.pagination.totalPages || 0;
  const totalItems = auditResponse?.pagination.totalItems || 0;
  const hasNext = auditResponse?.pagination.hasNext || false;
  const hasPrevious = auditResponse?.pagination.hasPrevious || false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-slate-500">Track and monitor all activities within your organization.</p>
        </div>
      </div>

      <PageToolbar
        searchPlaceholder="Search by action or user..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      <DataTable
        data={paginatedLogs}
        isLoading={isLoading}
        emptyMessage="No audit logs found."
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
            header: "Action",
            cell: (log) => (
              <div className="flex items-center gap-2">
                {getActionIcon(log.action)}
                <span className="font-medium text-slate-900 dark:text-slate-100">{log.action}</span>
              </div>
            ),
          },
          {
            header: "Performed By",
            cell: (log) => (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <User className="h-3 w-3" />
                <span className="text-sm">{log.performedBy}</span>
              </div>
            ),
          },
          {
            header: "Details",
            cell: (log) => (
              <span className="text-slate-500 text-sm line-clamp-1 max-w-md">
                {log.details || '-'}
              </span>
            ),
          },
          {
            header: "Timestamp",
            cell: (log) => (
              <span className="text-slate-500 text-sm whitespace-nowrap">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            ),
          }
        ]}
      />
    </div>
  );
}
