// src/types/patron.types.ts

export interface PatronResponse {
  id: number;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  email?: string | null;
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
