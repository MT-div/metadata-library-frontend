// src/services/metadataService.ts
import { api } from "./api";
import type {
  VocabularyResponse,
  CreateVocabularyCommand,
} from "../types/vocabulary.types";
import type {
  PropertyResponse,
  CreatePropertyCommand,
} from "../types/property.types";
import type {
  ResourceTemplateResponse,
  CreateResourceTemplateCommand,
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
    return api.put(`/api/vocabularies/Undelet/${id}`, { id });
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
    return api.put(`/api/properties/Undelet/${id}`, { id });
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
    return api.put(`/api/resource-templates/Undelet/${id}`, { id });
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
