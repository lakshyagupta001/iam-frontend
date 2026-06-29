import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck, CircleX } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

type ResourceAction = 
  | 'reports:List' | 'reports:Read' | 'reports:Create' | 'reports:Update' | 'reports:Delete'
  | 'alerts:List' | 'alerts:Read' | 'alerts:Create' | 'alerts:Acknowledge' | 'alerts:Delete'
  | 'settings:Read' | 'settings:Update'
  | 'audit:List' | 'audit:Read';

const resourceGroups: { title: string; description: string; actions: ResourceAction[] }[] = [
  {
    title: 'Reports',
    description: 'Test reports permissions',
    actions: ['reports:List', 'reports:Read', 'reports:Create', 'reports:Update', 'reports:Delete'],
  },
  {
    title: 'Alerts',
    description: 'Test alerts permissions',
    actions: ['alerts:List', 'alerts:Read', 'alerts:Create', 'alerts:Acknowledge', 'alerts:Delete'],
  },
  {
    title: 'Settings',
    description: 'Test settings permissions',
    actions: ['settings:Read', 'settings:Update'],
  },
  {
    title: 'Audit',
    description: 'Test audit permissions',
    actions: ['audit:List', 'audit:Read'],
  },
];

export default function Dashboard() {
  const { hasPermission } = useAuth();
  const [activeActions, setActiveActions] = useState<Set<ResourceAction>>(new Set());

  const toggleAction = (action: ResourceAction) => {
    setActiveActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) {
        next.delete(action);
      } else {
        next.add(action);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Resource Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-slate-500">
          Click the buttons below to test and reveal your exact effective IAM permissions.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {resourceGroups.map((group) => (
          <Card key={group.title} className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl">{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {group.actions.map((action) => {
                  const isActive = activeActions.has(action);
                  const isAllowed = hasPermission(action);
                  
                  return (
                    <Button
                      key={action}
                      variant={isActive ? (isAllowed ? 'default' : 'destructive') : 'outline'}
                      onClick={() => toggleAction(action)}
                      className={`active:scale-95 transition-all duration-200 ${
                        isActive 
                          ? isAllowed 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                          : ''
                      }`}
                    >
                      {isActive && isAllowed && <CircleCheck className="mr-2 h-4 w-4" />}
                      {isActive && !isAllowed && <CircleX className="mr-2 h-4 w-4" />}
                      {action.split(':')[1]}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
