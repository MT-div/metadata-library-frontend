export interface PropertyResponse {
  id: number;
  vocabularyId: number;
  vocabularyPrefix: string;
  localName: string;
  label: string;
  termUri: string;
  isSearchable: boolean; // 👈 جديد
  isDeleted?: boolean;
}

export interface CreatePropertyCommand {
  vocabularyId: number;
  localName: string;
  label: string;
  termUri: string;
  isSearchable: boolean; // 👈 جديد
}

export interface UpdatePropertyCommand {
  id: number;
  vocabularyId: number;
  localName: string;
  label: string;
  termUri: string;
  isSearchable: boolean; // 👈 جديد
}

export interface SearchableFieldResponse {
  propertyId: number;
  label: string;
  localName: string;
  vocabularyPrefix: string;
}
