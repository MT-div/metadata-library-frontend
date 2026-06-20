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

// --- Users ---
export interface UserResponse {
  id: number;
  externalId: string; // غالباً سيكون هو الإيميل أو الـ ID الخاص بـ Identity
  fullName: string;
  bio?: string | null;
  profilePicturePath?: string | null;
  roles?: string[]; // قائمة الأدوار القادمة من الباك اند
}

export interface CreateSystemUserCommand {
  externalId: string;
  fullName: string;
  bio?: string | null;
  profilePicturePath?: string | null;
}

export interface BookmarksResponse {
  id: number;
}

// ==========================================
// ── Item Copies (النسخ الفيزيائية) ──
// ==========================================

export interface ItemCopyResponse {
  id: number;
  itemId: number;
  barcode: string;
  status: number; // 0=Available, 1=Borrowed, 2=Reference, 3=Maintenance
  notes?: string | null;
}

export interface CreateCopyCommand {
  itemId: number;
  barcode: string;
  notes?: string | null;
}

export interface UpdateCopyCommand {
  id: number;
  barcode: string;
  status: number;
  notes?: string | null;
}

// ==========================================
// ── Patrons (المستعيرون) ──
// ==========================================

export interface PatronResponse {
  id: number;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  email?: string | null;
  // قد يرسل الباك اند حقولاً إحصائية إضافية لاحقاً
}

export interface CreatePatronCommand {
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  email?: string | null;
}

export interface UpdatePatronCommand {
  id: number;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
}

// ==========================================
// ── Circulation (الإعارة والإرجاع) ──
// ==========================================

export interface CheckoutRequest {
  barcode: string;
  patronId: number;
  customDueDate?: string | null; // ISO Date String
}

export interface ReturnRequest {
  barcode: string;
}

// هذا الرد المتوقع من Active و History و Overdue
export interface CirculationRecordResponse {
  id: number;
  copyId: number;
  patronId: number;
  patronName: string; // للسهولة في العرض
  itemTitle: string; // للسهولة في العرض
  barcode: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: string; // "Active", "Returned", "Overdue"
}

// ==========================================
// ── Settings & Search ──
// ==========================================

export interface SearchableFieldResponse {
  propertyId: number;
  label: string;
  localName: string;
  vocabularyPrefix: string;
}
