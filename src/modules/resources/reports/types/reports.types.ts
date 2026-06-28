export interface Report {
  id: string;
  title: string;
  description: string | null;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDTO {
  title: string;
  description?: string;
  status: string;
}

export interface UpdateReportDTO {
  title?: string;
  description?: string;
  status?: string;
}
