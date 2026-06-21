import type { CreateValueRequest, ItemValueResponse } from "./item.types";

export interface CreateMediaCommand {
  itemId: number;
  storagePath: string;
  fileName: string;
  values: CreateValueRequest[];
}

export interface MediaResponse {
  id: number;
  itemId: number;
  storagePath: string;
  fileName: string;
  metadataValues: ItemValueResponse[];
}
