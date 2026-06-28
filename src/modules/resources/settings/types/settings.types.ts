export interface Setting {
  id: string;
  key: string;
  value: string;
  organizationId: string;
  updatedAt: string;
}

export interface UpdateSettingDTO {
  key: string;
  value: string;
}
