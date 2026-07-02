import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { PolicyStatement } from '@/modules/iam/types/iam.types';

const MODULES = [
  {
    id: 'IAM',
    label: 'IAM',
    sections: [
      {
        title: 'Users',
        actions: ['iam:ListUsers', 'iam:GetUser']
      },
      {
        title: 'Groups',
        actions: ['iam:ListGroups', 'iam:GetGroup', 'iam:CreateGroup', 'iam:UpdateGroup', 'iam:DeleteGroup']
      },
      {
        title: 'Policies',
        actions: ['iam:ListPolicies', 'iam:GetPolicy', 'iam:CreatePolicy', 'iam:UpdatePolicy', 'iam:DeletePolicy']
      },
      {
        title: 'Membership',
        actions: ['iam:AddUserToGroup', 'iam:RemoveUserFromGroup']
      },
      {
        title: 'Policy Attachments',
        actions: ['iam:AttachUserPolicy', 'iam:DetachUserPolicy', 'iam:AttachGroupPolicy', 'iam:DetachGroupPolicy']
      },
      {
        title: 'Permission Boundaries',
        actions: ['iam:PutUserBoundary', 'iam:DeleteUserBoundary']
      }
    ]
  },
  {
    id: 'REPORTS',
    label: 'Reports',
    sections: [
      {
        title: 'Reports',
        actions: ['reports:List', 'reports:Read', 'reports:Create', 'reports:Update', 'reports:Delete']
      }
    ]
  },
  {
    id: 'ALERTS',
    label: 'Alerts',
    sections: [
      {
        title: 'Alerts',
        actions: ['alerts:List', 'alerts:Read', 'alerts:Create', 'alerts:Acknowledge', 'alerts:Delete']
      }
    ]
  },
  {
    id: 'SETTINGS',
    label: 'Settings',
    sections: [
      {
        title: 'Settings',
        actions: ['settings:Read', 'settings:Update']
      }
    ]
  },
  {
    id: 'AUDIT',
    label: 'Audit',
    sections: [
      {
        title: 'Audit',
        actions: ['audit:List', 'audit:Read']
      }
    ]
  }
];

// Flat list of all predefined actions for easy checking
const ALL_PREDEFINED_ACTIONS = new Set(MODULES.flatMap(m => m.sections.flatMap(s => s.actions)));

interface PolicyStatementBuilderProps {
  statement: PolicyStatement;
  onChange: (updatedStatement: PolicyStatement) => void;
  onRemove?: () => void;
  isRemovable: boolean;
}

export function PolicyStatementBuilder({ statement, onChange, onRemove, isRemovable }: PolicyStatementBuilderProps) {
  const [customActionsStr, setCustomActionsStr] = useState('');
  const [activeModule, setActiveModule] = useState(MODULES[0].id);

  // Sync incoming actions to local state
  useEffect(() => {
    const customActions = statement.actions.filter(a => !ALL_PREDEFINED_ACTIONS.has(a) && a.trim() !== '');
    setCustomActionsStr(customActions.join(', '));
  }, [statement.actions]);

  const handleEffectChange = (effect: 'ALLOW' | 'DENY') => {
    onChange({ ...statement, effect });
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...statement, resource: e.target.value });
  };

  const handleCheckboxChange = (action: string, checked: boolean) => {
    let newActions = [...statement.actions];
    if (checked) {
      if (!newActions.includes(action)) newActions.push(action);
    } else {
      newActions = newActions.filter(a => a !== action);
    }
    onChange({ ...statement, actions: newActions });
  };

  const handleCustomActionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setCustomActionsStr(rawVal);

    const typedActions = rawVal
      .split(',')
      .map(a => a.trim())
      .filter(a => a !== '');

    const checkedPredefined = statement.actions.filter(a => ALL_PREDEFINED_ACTIONS.has(a));
    const mergedActions = Array.from(new Set([...checkedPredefined, ...typedActions]));
    
    onChange({ ...statement, actions: mergedActions });
  };

  const currentModule = MODULES.find(m => m.id === activeModule) || MODULES[0];

  return (
    <div className="p-4 border rounded-lg bg-white relative group shadow-sm">
      {isRemovable && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={onRemove}
          title="Remove Statement"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="space-y-4">
        {/* Top row: Effect and Resource */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Effect</label>
            <Select value={statement.effect} onValueChange={handleEffectChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALLOW">ALLOW</SelectItem>
                <SelectItem value="DENY">DENY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Resource</label>
            <Input 
              required 
              value={statement.resource as string} 
              onChange={handleResourceChange} 
              placeholder="e.g. arn:aws:s3:::my-bucket/* or *" 
            />
          </div>
        </div>

        {/* Permissions Module Selector and Custom Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-1.5 flex-1">
            <label className="text-sm font-semibold text-slate-700 block">Permissions</label>
            <div className="flex flex-wrap items-center gap-1 bg-slate-100/50 p-1 rounded-md border border-slate-200/60 w-fit h-8">
              {MODULES.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveModule(mod.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-all duration-200 ${
                    activeModule === mod.id 
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {mod.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5 w-full md:w-72">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-700">Custom Actions</label>
              <span className="text-xs text-slate-400">Comma-separated</span>
            </div>
            <Input
              value={customActionsStr}
              onChange={handleCustomActionsChange}
              placeholder="e.g. custom:GenerateInvoice"
            />
          </div>
        </div>

        {/* Permissions Checkboxes */}
        <div className="bg-slate-50 p-4 rounded-md border border-slate-100 max-h-60 overflow-y-auto">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {currentModule.sections.map((section) => (
              <div key={section.title} className="space-y-2.5 break-inside-avoid mb-6 last:mb-0">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">{section.title}</h4>
                <div className="space-y-2">
                  {section.actions.map((action) => (
                    <label key={action} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900 group/label">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                        checked={statement.actions.includes(action)}
                        onChange={(e) => handleCheckboxChange(action, e.target.checked)}
                      />
                      <span className="group-hover/label:font-medium transition-all">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
