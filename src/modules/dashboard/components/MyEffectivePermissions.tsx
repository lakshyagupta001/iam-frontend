import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { usersApi } from '@/modules/iam/features/users/services/users.service';
import { ShieldCheck, Loader2, FileText, Users } from 'lucide-react';

export function MyEffectivePermissions() {
  const { user } = useAuth();

  const { data: myDetails, isLoading } = useQuery({
    queryKey: ['dashboard', 'my-details', user?.id],
    queryFn: () => usersApi.getUser(user!.id),
    enabled: !!user?.id,
  });

  if (!user) return null;

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm mt-4">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          My Assigned Policies
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : user.isRoot ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800/50">
              Root Privileges (All Policies)
            </div>
            <p className="text-sm text-slate-500 mt-3">
              As a Root user, you automatically inherit all available policies and permissions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Direct Policies */}
            {myDetails?.directPolicies && myDetails.directPolicies.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" /> Direct Policies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {myDetails.directPolicies.map((p: any) => (
                    <div 
                      key={p.policy.id} 
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700"
                    >
                      {p.policy.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group Policies */}
            {myDetails?.groupMemberships && myDetails.groupMemberships.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" /> Inherited from Groups
                </h3>
                <div className="space-y-3">
                  {myDetails.groupMemberships.map((gm: any) => {
                    const groupPolicies = gm.group.policies || [];
                    if (groupPolicies.length === 0) return null;

                    return (
                      <div key={gm.group.id} className="pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 mb-2 font-medium">{gm.group.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {groupPolicies.map((p: any) => (
                            <div 
                              key={p.policy.id} 
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700"
                            >
                              {p.policy.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(!myDetails?.directPolicies?.length && !myDetails?.groupMemberships?.length) && (
              <div className="text-center p-6 text-slate-500 text-sm">
                You do not have any policies assigned.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
