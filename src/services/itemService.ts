// src/services/itemService.ts
import { api } from "./api";
import type { ItemResponse, CreateItemCommand } from "../types/item.types";
import type {
  ItemCopyResponse,
  CreateCopyCommand,
  UpdateCopyCommand,
} from "../types/itemCopy.types";
import type {
  ItemSetResponse,
  CreateItemSetCommand,
} from "../types/itemSet.types";
import type { BookmarksResponse } from "../types/item.types";

export const itemService = {
  // ── Items ──
  getItems: (withDeleted = false) => {
    const url = withDeleted ? "/api/items/withDeleted" : "/api/items";
    return api.get<ItemResponse[]>(url);
  },

  getItemById: (id: number) => {
    return api.get<ItemResponse>(`/api/items/${id}`);
  },

  createItem: (command: CreateItemCommand) => {
    return api.post<ItemResponse>("/api/items", command);
  },

  deleteItem: (id: number) => {
    return api.delete(`/api/items/${id}`);
  },

  restoreItem: (id: number) => {
    return api.put(`/api/items/Undelete/${id}`, { id });
  },

  // ── Item Copies ──
  getCopiesByItemId: (itemId: number) => {
    return api.get<ItemCopyResponse[]>(`/api/item-copies?itemId=${itemId}`);
  },

  addCopy: (command: CreateCopyCommand) => {
    return api.post<ItemCopyResponse>("/api/item-copies", command);
  },

  updateCopy: (id: number, command: UpdateCopyCommand) => {
    return api.put<ItemCopyResponse>(`/api/item-copies/${id}`, command);
  },

  deleteCopy: (id: number) => {
    return api.delete(`/api/item-copies/${id}`);
  },

  // ── Item Sets (Collections) ──
  getItemSets: (withDeleted = false) => {
    const url = withDeleted ? "/api/item-sets/WithDeleted" : "/api/item-sets";
    return api.get<ItemSetResponse[]>(url);
  },

  createItemSet: (command: CreateItemSetCommand) => {
    return api.post<ItemSetResponse>("/api/item-sets", command);
  },

  deleteItemSet: (id: number) => {
    return api.delete(`/api/item-sets/${id}`);
  },

  restoreItemSet: (id: number) => {
    return api.put(`/api/item-sets/Undelete/${id}`, { id });
  },

  linkItemToSet: (setId: number, itemId: number) => {
    return api.post(`/api/item-sets/${setId}/items/${itemId}`, {
      itemSetId: setId,
      itemId,
    });
  },

  unlinkItemFromSet: (setId: number, itemId: number) => {
    return api.delete(`/api/item-sets/${setId}/items/${itemId}`);
  },

  // ── Bookmarks (Favorites) ──
  getBookmarks: () => {
    return api.get<BookmarksResponse[]>("/api/bookmarks");
  },

  addBookmark: (itemId: number) => {
    return api.post(`/api/bookmarks/${itemId}`);
  },

  removeBookmark: (itemId: number) => {
    return api.delete(`/api/bookmarks/${itemId}`);
  },
};
