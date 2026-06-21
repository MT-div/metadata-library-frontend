export interface PropertyResponse {
  id: number;
  vocabularyId: number;
  vocabularyPrefix: string;
  localName: string;
  label: string;
  termUri: string;
}

export interface CreatePropertyCommand {
  vocabularyId: number;
  localName: string;
  label: string;
  termUri: string;
}

export interface SearchableFieldResponse {
  propertyId: number;
  label: string;
  localName: string;
  vocabularyPrefix: string;
}
