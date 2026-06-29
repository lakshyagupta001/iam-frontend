import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck, CircleX, ChevronDown, ChevronRight, FileText, Bell, Settings, ScrollText, Shield } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { OverviewCards } from '../components/OverviewCards';
import { MyEffectivePermissions } from '../components/MyEffectivePermissions';

type ResourceAction = 
  | 'reports:List' | 'reports:Read' | 'reports:Create' | 'reports:Update' | 'reports:Delete'
  | 'alerts:List' | 'alerts:Read' | 'alerts:Create' | 'alerts:Acknowledge' | 'alerts:Delete'
  | 'settings:Read' | 'settings:Update'
  | 'audit:List' | 'audit:Read'
  | 'iam:ListPolicies' | 'iam:GetPolicy' | 'iam:CreatePolicy' | 'iam:UpdatePolicy' | 'iam:DeletePolicy'
  | 'iam:ListGroups' | 'iam:GetGroup' | 'iam:CreateGroup' | 'iam:UpdateGroup' | 'iam:DeleteGroup'
  | 'iam:AddUserToGroup' | 'iam:RemoveUserFromGroup' | 'iam:AttachGroupPolicy' | 'iam:DetachGroupPolicy'
  | 'iam:ListUsers' | 'iam:GetUser' | 'iam:AttachUserPolicy' | 'iam:DetachUserPolicy'
  | 'iam:PutUserBoundary' | 'iam:DeleteUserBoundary';

const resourceGroups: { title: string; description: string; icon: any; actions: ResourceAction[] }[] = [
  {
    title: 'Reports',
    description: 'Test reports permissions',
    icon: FileText,
    actions: ['reports:List', 'reports:Read', 'reports:Create', 'reports:Update', 'reports:Delete'],
  },
  {
    title: 'Alerts',
    description: 'Test alerts permissions',
    icon: Bell,
    actions: ['alerts:List', 'alerts:Read', 'alerts:Create', 'alerts:Acknowledge', 'alerts:Delete'],
  },
  {
    title: 'Settings',
    description: 'Test settings permissions',
    icon: Settings,
    actions: ['settings:Read', 'settings:Update'],
  },
  {
    title: 'Audit',
    description: 'Test audit permissions',
    icon: ScrollText,
    actions: ['audit:List', 'audit:Read'],
  },
  {
    title: 'IAM',
    description: 'Test all IAM permissions',
    icon: Shield,
    actions: [
      'iam:ListPolicies', 'iam:GetPolicy', 'iam:CreatePolicy', 'iam:UpdatePolicy', 'iam:DeletePolicy',
      'iam:ListGroups', 'iam:GetGroup', 'iam:CreateGroup', 'iam:UpdateGroup', 'iam:DeleteGroup',
      'iam:AddUserToGroup', 'iam:RemoveUserFromGroup', 'iam:AttachGroupPolicy', 'iam:DetachGroupPolicy',
      'iam:ListUsers', 'iam:GetUser', 'iam:AttachUserPolicy', 'iam:DetachUserPolicy',
      'iam:PutUserBoundary', 'iam:DeleteUserBoundary'
    ],
  },
];

export default function Dashboard() {
  const { hasPermission } = useAuth();
  const [activeActions, setActiveActions] = useState<Set<ResourceAction>>(new Set());
  const [activeGroup, setActiveGroup] = useState<string>('Reports');

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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Organization Overview</h2>
        <OverviewCards />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">IAM Playground</h2>
        <p className="text-sm text-slate-500">
          Click the buttons below to test and reveal your exact effective IAM permissions for the current organization.
        </p>
        <div className="flex flex-col space-y-2">
          {resourceGroups.map((group) => {
            const isOpen = activeGroup === group.title;
            const Icon = group.icon;

            return (
              <Card 
                key={group.title} 
                className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => setActiveGroup(isOpen ? '' : group.title)}
                  className="flex items-center justify-between py-2.5 px-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{group.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{group.actions.length} Permissions</span>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* Accordion Body */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800/50">
                      {group.title === 'IAM' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                          {/* Policies Column */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Policies</h4>
                            <div className="flex flex-wrap gap-2">
                              {group.actions.filter(a => a.includes('Policy') || a.includes('Policies')).map((action) => {
                                const isActive = activeActions.has(action);
                                const isAllowed = hasPermission(action);
                                return (
                                  <Button
                                    key={action}
                                    variant={isActive ? (isAllowed ? 'default' : 'destructive') : 'outline'}
                                    size="sm"
                                    onClick={() => toggleAction(action)}
                                    className={`h-7 px-2.5 text-xs font-medium active:scale-95 transition-all duration-200 ${
                                      isActive ? (isAllowed ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm' : 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm') : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {isActive && isAllowed && <CircleCheck className="mr-1 h-3.5 w-3.5" />}
                                    {isActive && !isAllowed && <CircleX className="mr-1 h-3.5 w-3.5" />}
                                    {action.split(':')[1]}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          {/* Groups Column */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Groups</h4>
                            <div className="flex flex-wrap gap-2">
                              {group.actions.filter(a => a.includes('Group') && !a.includes('GroupPolicy')).map((action) => {
                                const isActive = activeActions.has(action);
                                const isAllowed = hasPermission(action);
                                return (
                                  <Button
                                    key={action}
                                    variant={isActive ? (isAllowed ? 'default' : 'destructive') : 'outline'}
                                    size="sm"
                                    onClick={() => toggleAction(action)}
                                    className={`h-7 px-2.5 text-xs font-medium active:scale-95 transition-all duration-200 ${
                                      isActive ? (isAllowed ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm' : 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm') : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {isActive && isAllowed && <CircleCheck className="mr-1 h-3.5 w-3.5" />}
                                    {isActive && !isAllowed && <CircleX className="mr-1 h-3.5 w-3.5" />}
                                    {action.split(':')[1]}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          {/* Users Column */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Users</h4>
                            <div className="flex flex-wrap gap-2">
                              {group.actions.filter(a => a.includes('User') && !a.includes('UserToGroup') && !a.includes('UserFromGroup') && !a.includes('UserPolicy')).map((action) => {
                                const isActive = activeActions.has(action);
                                const isAllowed = hasPermission(action);
                                return (
                                  <Button
                                    key={action}
                                    variant={isActive ? (isAllowed ? 'default' : 'destructive') : 'outline'}
                                    size="sm"
                                    onClick={() => toggleAction(action)}
                                    className={`h-7 px-2.5 text-xs font-medium active:scale-95 transition-all duration-200 ${
                                      isActive ? (isAllowed ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm' : 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm') : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {isActive && isAllowed && <CircleCheck className="mr-1 h-3.5 w-3.5" />}
                                    {isActive && !isAllowed && <CircleX className="mr-1 h-3.5 w-3.5" />}
                                    {action.split(':')[1]}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-3">
                          {group.actions.map((action) => {
                            const isActive = activeActions.has(action);
                            const isAllowed = hasPermission(action);
                            
                            return (
                              <Button
                                key={action}
                                variant={isActive ? (isAllowed ? 'default' : 'destructive') : 'outline'}
                                size="sm"
                                onClick={() => toggleAction(action)}
                                className={`h-7 px-2.5 text-xs font-medium active:scale-95 transition-all duration-200 ${
                                  isActive 
                                    ? isAllowed 
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm' 
                                      : 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                                }`}
                              >
                                {isActive && isAllowed && <CircleCheck className="mr-1 h-3.5 w-3.5" />}
                                {isActive && !isAllowed && <CircleX className="mr-1 h-3.5 w-3.5" />}
                                {action.split(':')[1]}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <MyEffectivePermissions />
      </section>
    </div>
  );
}
