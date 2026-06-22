// src/services/patronService.ts
import { api } from "./api";
import type {
  PatronResponse,
  CreatePatronCommand,
  UpdatePatronCommand,
} from "../types/patron.types";

export const patronService = {
  getPatrons: () => {
    return api.get<PatronResponse[]>("/api/Patrons");
  },

  searchPatrons: (query: string) => {
    return api.get<PatronResponse[]>(`/api/Patrons?search=${query}`);
  },

  createPatron: (command: CreatePatronCommand) => {
    return api.post<PatronResponse>("/api/Patrons", command);
  },

  updatePatron: (id: number, command: UpdatePatronCommand) => {
    return api.put<PatronResponse>(`/api/Patrons/${id}`, command);
  },

  deletePatron: (id: number) => {
    return api.delete(`/api/Patrons/${id}`);
  },
};
