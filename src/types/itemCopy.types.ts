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
