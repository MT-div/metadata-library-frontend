// src/types/circulation.types.ts

export interface CheckoutRequest {
  barcode: string;
  patronId: number;
  customDueDate?: string | null;
}

export interface ReturnRequest {
  barcode: string;
}

export interface CirculationRecordResponse {
  id: number;
  copyId: number;
  patronId: number;
  patronName: string;
  itemTitle: string;
  barcode: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: string; // "Active", "Returned", "Overdue"

  // حقول دعم احتياطية متوافقة مع الأنواع القديمة ببعض الصفحات
  recordId?: number;
  copyBarcode?: string | null;
  isOverdue?: boolean;
}
