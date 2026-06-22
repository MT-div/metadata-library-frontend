// src/services/circulationService.ts
import { api } from "./api";
import type {
  CheckoutRequest,
  ReturnRequest,
  CirculationRecordResponse,
} from "../types/circulation.types";

export const circulationService = {
  getActiveLoans: () => {
    return api.get<CirculationRecordResponse[]>("/api/Circulation/active");
  },

  getOverdueLoans: () => {
    return api.get<CirculationRecordResponse[]>("/api/Circulation/overdue");
  },

  getHistory: () => {
    return api.get<CirculationRecordResponse[]>("/api/Circulation/history");
  },

  checkout: (request: CheckoutRequest) => {
    return api.post("/api/Circulation/checkout", request);
  },

  returnItem: (request: ReturnRequest) => {
    return api.post("/api/Circulation/return", request);
  },

  undoOperation: (recordId: number) => {
    return api.post(`/api/Circulation/undo/${recordId}`);
  },
};
