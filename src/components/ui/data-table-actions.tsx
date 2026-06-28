import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Eye, Edit2, Trash2 } from "lucide-react";

interface DataTableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DataTableRowActions({
  onView,
  onEdit,
  onDelete,
}: DataTableRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {onView && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              aria-label="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View</TooltipContent>
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
