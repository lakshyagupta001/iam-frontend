export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: string;
  organizationId: string;
  createdAt: string;
}

export interface CreateAlertDTO {
  title: string;
  message: string;
  severity: string;
}

export interface UpdateAlertDTO {
  title?: string;
  message?: string;
  severity?: string;
}
