import { useState } from 'react';
import { toast } from 'sonner';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Settings, Save, Loader2 } from 'lucide-react';
import { useSettings, useUpdateSetting } from '../hooks/useSettings';
import { PermissionButton } from '@/modules/iam/components/PermissionButton';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import axios from 'axios';
import type { Setting } from '../types/settings.types';

export default function SettingsList() {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission('settings:Update');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: settingsResponse, isLoading } = useSettings({ page, limit, search });
  const updateMutation = useUpdateSetting();

  const handleEditClick = (setting: Setting) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
  };

  const handleSave = async (key: string) => {
    try {
      await updateMutation.mutateAsync({ key, value: editValue });
      toast.success('Setting updated successfully');
      setEditingKey(null);
      setEditValue('');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return;
        toast.error(error.response?.data?.message || 'Failed to update setting');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const paginatedSettings = settingsResponse?.data || [];
  const totalPages = settingsResponse?.pagination.totalPages || 0;
  const totalItems = settingsResponse?.pagination.totalItems || 0;
  const hasNext = settingsResponse?.pagination.hasNext || false;
  const hasPrevious = settingsResponse?.pagination.hasPrevious || false;

  return (
    <div className="space-y-6">
      <PageToolbar
        searchPlaceholder="Search Settings..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      <DataTable
        data={paginatedSettings}
        isLoading={isLoading}
        emptyMessage="No settings found."
        pagination={{
          page,
          limit,
          totalItems,
          totalPages,
          hasNext,
          hasPrevious
        }}
        onPageChange={setPage}
        keyExtractor={(item) => item.key}
        columns={[
          {
            header: "Setting Key",
            cell: (s) => (
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{s.key}</span>
              </div>
            ),
          },
          {
            header: "Value",
            cell: (s) => {
              if (editingKey === s.key) {
                return (
                  <div className="flex items-center gap-2 max-w-sm">
                    <Input 
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)} 
                      disabled={updateMutation.isPending || !canUpdate}
                    />
                    <PermissionButton 
                      action="settings:Update"
                      size="icon"
                      variant="ghost" 
                      onClick={() => handleSave(s.key)}
                      disabled={updateMutation.isPending || !editValue}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      tooltip="Save Changes"
                    >
                      {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </PermissionButton>
                    <Button 
                      size="sm"
                      variant="ghost" 
                      onClick={() => setEditingKey(null)}
                      disabled={updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                );
              }
              return <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{s.value}</span>;
            },
          },
          {
            header: "Last Updated",
            cell: (s) => <span className="text-slate-500 text-sm">{new Date(s.updatedAt).toLocaleString()}</span>,
          },
          {
            header: "Actions",
            cell: (s) => {
              if (editingKey === s.key) return null;
              return (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(s)}
                >
                  Edit
                </Button>
              );
            },
          }
        ]}
      />
    </div>
  );
}
