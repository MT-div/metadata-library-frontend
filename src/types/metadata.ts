// src/types/metadata.ts

// --- Responses (البيانات القادمة من الباك اند) ---

export interface TemplatePropertyResponse {
  propertyId: number;
  propertyLabel: string;
  isRequired: boolean;
  displayOrder: number;
}

export interface ResourceTemplateResponse {
  id: number;
  label: string;
  description: string | null;
  properties: TemplatePropertyResponse[];
}

export interface PropertyResponse {
  id: number;
  vocabularyId: number;
  vocabularyPrefix: string;
  localName: string;
  label: string;
  termUri: string;
}

// --- Commands/Requests (البيانات التي سنرسلها للباك اند) ---

export interface CreateValueRequest {
  propertyId: number;
  valueText?: string | null;
  valueUri?: string | null;
  valueResourceId?: number | null;
  type: "literal" | "uri" | "resource"; // Default in C# is "literal"
  language: string; // Default in C# is "ar"
}

export interface CreateItemCommand {
  templateId: number | null;
  ownerId: number | null;
  values: CreateValueRequest[];
}
