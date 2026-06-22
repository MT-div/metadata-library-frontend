// src/services/settingsService.ts
import { api } from "./api";
import type { SearchableFieldResponse } from "../types/property.types";

export const settingsService = {
  getSearchableFields: () => {
    return api.get<SearchableFieldResponse[]>(
      "/api/settings/searchable-fields"
    );
  },
};
