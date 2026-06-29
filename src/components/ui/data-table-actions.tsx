import { PermissionButton } from '@/modules/iam/components/PermissionButton';
import { Eye, Edit2, Trash2 } from "lucide-react";

interface DataTableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  // Let the caller specify the exact action needed, since it depends on the entity
  viewAction?: string | string[];
  editAction?: string | string[];
  deleteAction?: string | string[];
  editIcon?: React.ReactNode;
  editLabel?: string;
}

export function DataTableRowActions({
  onView,
  onEdit,
  onDelete,
  viewAction = "iam:GetResource", // Default or generic fallback
  editAction = "iam:UpdateResource",
  deleteAction = "iam:DeleteResource",
  editIcon,
  editLabel = "Edit",
}: DataTableRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {onView && (
        <PermissionButton
          action={viewAction}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
          onClick={(e: any) => {
            e.stopPropagation();
            onView();
          }}
          aria-label="View"
          tooltip="View"
        >
          <Eye className="h-4 w-4" />
        </PermissionButton>
      )}

      {onEdit && (
        <PermissionButton
          action={editAction}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
          onClick={(e: any) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={editLabel}
          tooltip={editLabel}
        >
          {editIcon ? editIcon : <Edit2 className="h-4 w-4" />}
        </PermissionButton>
      )}

      {onDelete && (
        <PermissionButton
          action={deleteAction}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
          onClick={(e: any) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete"
          tooltip="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </PermissionButton>
      )}
    </div>
  );
}
