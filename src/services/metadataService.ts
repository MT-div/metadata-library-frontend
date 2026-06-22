// src/services/metadataService.ts
import { api } from "./api";
import type {
  VocabularyResponse,
  CreateVocabularyCommand,
} from "../types/vocabulary.types";
import type {
  PropertyResponse,
  CreatePropertyCommand,
  SearchableFieldResponse,
  UpdatePropertyCommand,
} from "../types/property.types";
import type {
  ResourceTemplateResponse,
  CreateResourceTemplateCommand,
  UpdateResourceTemplateCommand,
  TemplatePropertyRequest,
} from "../types/template.types";

export const metadataService = {
  // ── Vocabularies ──
  getVocabularies: (withDeleted = false) => {
    const url = withDeleted
      ? "/api/vocabularies/WithDeleted"
      : "/api/vocabularies";
    return api.get<VocabularyResponse[]>(url);
  },

  createVocabulary: (command: CreateVocabularyCommand) => {
    return api.post<VocabularyResponse>("/api/vocabularies", command);
  },

  deleteVocabulary: (id: number) => {
    return api.delete(`/api/vocabularies/${id}`);
  },

  restoreVocabulary: (id: number) => {
    return api.put(`/api/vocabularies/Undelete/${id}`, { id });
  },

  // ── Properties ──
  getProperties: (withDeleted = false) => {
    const url = withDeleted ? "/api/properties/WithDeleted" : "/api/properties";
    return api.get<PropertyResponse[]>(url);
  },

  getPropertiesByVocabulary: (vocabId: number) => {
    return api.get<PropertyResponse[]>(
      `/api/properties/by-vocabulary/${vocabId}`
    );
  },

  createProperty: (command: CreatePropertyCommand) => {
    return api.post<PropertyResponse>("/api/properties", command);
  },

  deleteProperty: (id: number) => {
    return api.delete(`/api/properties/${id}`);
  },

  restoreProperty: (id: number) => {
    return api.put(`/api/properties/Undelete/${id}`, { id });
  },
  updateProperty: (id: number, command: UpdatePropertyCommand) => {
    return api.put(`/api/properties/${id}`, command);
  },

  getSearchableFields: () => {
    return api.get<SearchableFieldResponse[]>(
      "/api/properties/searchable-fields"
    );
  },
  // ── Resource Templates ──
  getTemplates: (withDeleted = false) => {
    const url = withDeleted
      ? "/api/resource-templates/WithDeleted"
      : "/api/resource-templates";
    return api.get<ResourceTemplateResponse[]>(url);
  },

  createTemplate: (command: CreateResourceTemplateCommand) => {
    return api.post<ResourceTemplateResponse>(
      "/api/resource-templates",
      command
    );
  },

  deleteTemplate: (id: number) => {
    return api.delete(`/api/resource-templates/${id}`);
  },

  restoreTemplate: (id: number) => {
    return api.put(`/api/resource-templates/Undelete/${id}`, { id });
  },

  updateTemplate: (id: number, command: UpdateResourceTemplateCommand) => {
    return api.put(`/api/resource-templates/${id}`, command);
  },
  saveTemplateProperties: (
    templateId: number,
    properties: TemplatePropertyRequest[]
  ) => {
    return api.put(`/api/resource-templates/${templateId}/properties`, {
      templateId,
      properties,
    });
  },
};
