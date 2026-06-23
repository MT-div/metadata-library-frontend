// src/hooks/useFavorites.ts
import { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import { metadataService } from "../../services/metadataService";
import type { ItemResponse } from "../../types/item.types";
import type { ResourceTemplateResponse } from "../../types/template.types";

export const useFavorites = () => {
  const [favoriteItems, setFavoriteItems] = useState<ItemResponse[]>([]);
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    Promise.all([
      itemService.getBookmarks().then((r) => r.data),
      itemService.getItems().then((r) => r.data),
      metadataService.getTemplates().then((r) => r.data),
    ])
      .then(([bookmarkIds, allItems, tpls]) => {
        // فلترة العناصر لعرض المحفوظة فقط محلياً
        const userFavorites = allItems.filter((item) =>
          bookmarkIds.some((bookmark) => bookmark.itemId === item.id)
        );
        setFavoriteItems(userFavorites);
        setTemplates(tpls);
      })
      .catch((err) => {
        console.error("Error loading favorites:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const removeBookmark = async (e: React.MouseEvent, itemId: number) => {
    e.preventDefault();

    // تحديث متفائل للواجهة لإزالة العنصر فوراً
    setFavoriteItems((prev) => prev.filter((item) => item.id !== itemId));

    try {
      await itemService.removeBookmark(itemId);
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  };

  // منطق الفلترة والبحث المشتق
  const filtered = favoriteItems.filter((item) => {
    return (
      !search ||
      item.metadataValues.some((v) =>
        v.valueText?.toLowerCase().includes(search.toLowerCase())
      ) ||
      item.id.toString() === search
    );
  });

  return {
    templates,
    loading,
    search,
    setSearch,
    view,
    setView,
    removeBookmark,
    filtered,
  };
};
