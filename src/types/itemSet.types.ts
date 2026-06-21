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
