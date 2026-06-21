export interface ResourceTemplateResponse {
  id: number;
  label: string;
  description: string | null;
  properties: TemplatePropertyResponse[];
}

export interface CreateResourceTemplateCommand {
  label: string;
  description: string | null;
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
