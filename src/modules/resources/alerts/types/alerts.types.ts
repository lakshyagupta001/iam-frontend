export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: string;
  organizationId: string;
  createdAt: string;
  isAcknowledged: boolean;
  acknowledgedAt: string | null;
}

export interface CreateAlertDTO {
  title: string;
  message: string;
  severity: string;
}
