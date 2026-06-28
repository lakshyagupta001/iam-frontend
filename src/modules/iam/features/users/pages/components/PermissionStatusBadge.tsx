import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PermissionStatusBadgeProps {
  isAllowed: boolean;
}

export function PermissionStatusBadge({ isAllowed }: PermissionStatusBadgeProps) {
  if (isAllowed) {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
        <Check className="w-3 h-3 mr-1" /> Allowed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
      <X className="w-3 h-3 mr-1" /> Denied
    </Badge>
  );
}
