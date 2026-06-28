import { useState } from 'react';
import { PermissionStatusBadge } from './PermissionStatusBadge';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PermissionRow {
  action: string;
  isAllowed: boolean;
}

interface PermissionNamespaceGroupProps {
  namespace: string;
  permissions: PermissionRow[];
}

export function PermissionNamespaceGroup({ namespace, permissions }: PermissionNamespaceGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const allowedCount = permissions.filter(p => p.isAllowed).length;
  const deniedCount = permissions.length - allowedCount;

  return (
    <div className="border rounded-md mb-2 overflow-hidden bg-white">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-slate-50 px-4 py-3 border-b flex items-center justify-between hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          <h3 className="font-semibold text-sm text-slate-800 capitalize">{namespace}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          {allowedCount > 0 && <span className="text-emerald-600">{allowedCount} Allowed</span>}
          {deniedCount > 0 && <span className="text-red-600">{deniedCount} Denied</span>}
        </div>
      </button>

      {isExpanded && (
        <div className="divide-y">
          {permissions.map((perm) => (
            <div key={perm.action} className="px-4 py-3 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
              <span className="text-sm font-medium text-slate-600 font-mono pl-6">{perm.action}</span>
              <PermissionStatusBadge isAllowed={perm.isAllowed} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
