import { useState } from 'react';
import { PageToolbar } from '../../../components/ui/page-toolbar';
import { PrimaryButton } from '../../../components/ui/primary-button';
import { useQuery } from '@tanstack/react-query';
import { policiesApi } from '../../../api/policies.api';
import { Key, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../../components/ui/badge';
import { DataTable } from '../../../components/ui/data-table';
import { DataTableRowActions } from '../../../components/ui/data-table-actions';

export default function PoliciesList() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);

  const queryClient = useQueryClient();
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['policies', { page, limit, search }],
    queryFn: () => policiesApi.listPolicies({ page, limit, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: policiesApi.deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy deleted successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete policy');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const policies = paginatedData?.data || [];
  const pagination = paginatedData?.pagination;

  return (
    <div className="space-y-6">
      <PageToolbar
        searchPlaceholder="Search Policies..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        primaryAction={
          <PrimaryButton onClick={() => navigate('/iam/policies/new')} icon={Plus}>
            Create Policy
          </PrimaryButton>
        }
      />

      <DataTable
        data={policies}
        isLoading={isLoading}
        emptyMessage="No policies found."
        pagination={pagination}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
        columns={[
          {
            header: "Policy Name",
            cell: (p) => (
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{p.name}</span>
              </div>
            ),
          },
          {
            header: "Type",
            cell: (p) => p.type === 'MANAGED' ? (
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">MANAGED</Badge>
            ) : (
              <Badge variant="outline">INLINE</Badge>
            ),
          },
          {
            header: "Description",
            cell: (p) => <span className="text-slate-500 max-w-xs truncate">{p.description || '-'}</span>,
          },
          {
            header: "Actions",
            cell: (p) => (
              <DataTableRowActions
                onView={() => navigate(`/iam/policies/${p.id}`)}
                onEdit={() => navigate(`/iam/policies/${p.id}/edit`)}
                onDelete={() => {
                  if (window.confirm('Are you sure you want to delete this policy?')) {
                    deleteMutation.mutate(p.id);
                  }
                }}
              />
            ),
          }
        ]}
      />
    </div>
  );
}
