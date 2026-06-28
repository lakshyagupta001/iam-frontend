export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  organizationId: string;
  timestamp: string;
}
