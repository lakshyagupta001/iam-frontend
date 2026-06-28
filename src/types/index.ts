export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

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
  effect: 'Allow' | 'Deny';
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
