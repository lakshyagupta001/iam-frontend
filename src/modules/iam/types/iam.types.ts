export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isRoot: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string | null;
  type: 'MANAGED' | 'INLINE';
  organizationId: string;
  statements: PolicyStatement[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyStatement {
  effect: 'ALLOW' | 'DENY';
  actions: string[];
  resource: string[] | string;
}

export interface UserDetails extends UserProfile {
  groupMemberships: { group: Group }[];
  directPolicies: { policy: Policy }[];
}

export interface GroupDetails extends Group {
  memberships: { user: UserProfile }[];
  policyAttachments: { policy: Policy }[];
}

export interface UserBoundary {
  userId: string;
  policyId: string;
  policy: Policy;
  createdAt: string;
  updatedAt: string;
}
