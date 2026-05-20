// src/types/metadata.ts

// --- Responses (البيانات القادمة من الباك اند) ---
// --- Commands/Requests (البيانات التي سنرسلها للباك اند) ---

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

export interface ItemValueResponse {
  propertyId: number;
  propertyLabel: string;
  valueText?: string | null;
  language?: string | null;
}

export interface ItemResponse {
  id: number;
  type: string;
  templateId: number | null;
  ownerId: number | null;
  ownerName?: string | null;
  metadataValues: ItemValueResponse[];
}

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

// --- Vocabularies ---
export interface VocabularyResponse {
  id: number;
  prefix: string;
  namespaceUri: string;
  label: string;
}

export interface CreateVocabularyCommand {
  prefix: string;
  namespaceUri: string;
  label: string;
}

// --- Properties ---
export interface CreatePropertyCommand {
  vocabularyId: number;
  localName: string;
  label: string;
  termUri: string;
}

// --- Resource Templates ---
export interface CreateResourceTemplateCommand {
  label: string;
  description: string | null;
}
// --- Template Properties ---

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

// --- Item Sets ---

export interface CreateItemSetCommand {
  title: string;
  description?: string | null;
  isPublic: boolean;
  ownerId?: number | null;
}

export interface AddItemToItemSetCommand {
  itemSetId: number;
  itemId: number;
}

export interface ItemSetItemResponse {
  id: number;
  type: string;
  templateId: number | null;
  ownerId: number | null;
}

export interface ItemSetResponse {
  id: number;
  type: string;
  ownerId: number | null;
  ownerName: string | null;
  title: string;
  description: string | null;
  isPublic: boolean;
  items: ItemSetItemResponse[];
}

// --- Media ---
export interface CreateMediaCommand {
  itemId: number;
  storagePath: string;
  fileName: string;
  values: CreateValueRequest[]; // نعيد استخدام نفس الـ Request
}

export interface MediaResponse {
  id: number;
  itemId: number;
  storagePath: string;
  fileName: string;
  metadataValues: ItemValueResponse[];
}
