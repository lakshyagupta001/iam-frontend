import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { PolicyStatement } from '@/modules/iam/types/iam.types';

interface PolicyJsonPreviewProps {
  statements: PolicyStatement[];
}

export function PolicyJsonPreview({ statements }: PolicyJsonPreviewProps) {
  // Format statements to match backend payload (removing empty actions, trimming)
  const formattedStatements = statements.map(stmt => ({
    effect: stmt.effect,
    actions: stmt.actions.map(a => a.trim()).filter(Boolean),
    resource: stmt.resource
  }));

  const jsonString = JSON.stringify(formattedStatements, null, 2);

  return (
    <Card className="h-full flex flex-col border-slate-200 dark:border-slate-800 sticky top-6">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2">
          <span>Live JSON Preview</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Exact payload sent to the IAM Engine
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-[#1e1e1e] rounded-b-xl">
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-xs font-mono text-green-400">
            <code>{jsonString}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
