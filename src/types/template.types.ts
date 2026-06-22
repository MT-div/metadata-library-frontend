export interface ResourceTemplateResponse {
  id: number;
  label: string;
  description?: string | null;
  isBorrowable: boolean; // 👈 جديد
  defaultBorrowDays?: number | null; // 👈 جديد
  isDeleted?: boolean;
  properties: TemplatePropertyResponse[]; // (أو TemplatePropertyResponse[])
}

export interface CreateResourceTemplateCommand {
  label: string;
  description?: string | null;
  isBorrowable: boolean; // 👈 جديد
  defaultBorrowDays?: number | null; // 👈 جديد
}

// 👈 إضافة نوع جديد لتعديل القالب الأساسي
export interface UpdateResourceTemplateCommand {
  id: number;
  label: string;
  description?: string | null;
  isBorrowable: boolean;
  defaultBorrowDays?: number | null;
}

export interface TemplatePropertyResponse {
  propertyId: number;
  propertyLabel: string;
  isRequired: boolean;
  displayOrder: number;
}

export interface TemplatePropertyRequest {
  propertyId: number;
  isRequired: boolean;
  displayOrder: number;
  alternateLabel?: string | null;
}

export interface UpdateTemplatePropertiesCommand {
  templateId: number;
  properties: TemplatePropertyRequest[];
}
