// src/services/mediaService.ts
import { api } from "./api";
import type { MediaResponse } from "../types/media.types";

export const mediaService = {
  getMedia: (withDeleted = false) => {
    const url = withDeleted ? "/api/media/WithDeleted" : "/api/media";
    return api.get<MediaResponse[]>(url);
  },

  getMediaByItem: (itemId: number) => {
    return api.get<MediaResponse[]>(`/api/media/by-item/${itemId}`);
  },

  uploadMediaWithMetadata: (formData: FormData) => {
    return api.post<MediaResponse>(
      "/api/media/upload-with-metadata",
      formData,
      {
        headers: {
          "Content-Type": undefined, // يضمن ترك تهيئة نوع الطلب لـ Axios تلقائياً لملفات FormData
        },
      }
    );
  },

  deleteMedia: (id: number) => {
    return api.delete(`/api/media/${id}`);
  },

  restoreMedia: (id: number) => {
    return api.put(`/api/media/Undelet/${id}`, { id });
  },
};
