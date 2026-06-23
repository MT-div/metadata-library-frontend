// src/types/item.types.ts

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
  type: "literal" | "uri" | "resource";
  language: string;
}

export interface CreateItemCommand {
  templateId: number | null;
  ownerId: number | null;
  values: CreateValueRequest[];
}

export interface BookmarksResponse {
  itemId: number;
}
