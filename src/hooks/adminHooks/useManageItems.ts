// src/hooks/useManageItems.ts
import { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import { metadataService } from "../../services/metadataService";
import type { ItemResponse } from "../../types/item.types";
import type { ResourceTemplateResponse } from "../../types/template.types";
import { getItemTitle, getItemAuthor } from "../../utils/helpers";

interface ExtendedItemResponse extends ItemResponse {
  isDeleted?: boolean;
}

export const useManageItems = () => {
  const [items, setItems] = useState<ExtendedItemResponse[]>([]);
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filters State ──
  const [search, setSearch] = useState("");
  const [filterTpl, setFilterTpl] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "deleted"
  >("active");

  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      itemService.getItems(true).then((res) => res.data),
      metadataService.getTemplates().then((res) => res.data),
    ])
      .then(([itemsData, templatesData]) => {
        setItems(itemsData);
        setTemplates(templatesData);
      })
      .catch((err) => console.error("Error fetching items admin data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟ (سيتم نقله لسلة المهملات)"))
      return;

    setIsProcessing(id);
    try {
      await itemService.deleteItem(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isDeleted: true } : item
        )
      );
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("حدث خطأ أثناء محاولة الحذف.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUndelete = async (id: number) => {
    if (!confirm("هل تريد استرجاع هذا العنصر؟")) return;

    setIsProcessing(id);
    try {
      await itemService.restoreItem(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isDeleted: false } : item
        )
      );
    } catch (error) {
      console.error("Error restoring item:", error);
      alert("حدث خطأ أثناء محاولة الاسترجاع.");
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const title = getItemTitle(item).toLowerCase();
    const author = getItemAuthor(item).toLowerCase();
    const query = search.toLowerCase();

    // 1. Text Search
    const matchSearch =
      title.includes(query) ||
      author.includes(query) ||
      item.id.toString() === query;

    // 2. Template Filter
    const matchTpl =
      filterTpl === "all" || item.templateId?.toString() === filterTpl;

    // 3. Status Filter (Soft Delete Logic)
    let matchStatus = true;
    if (filterStatus === "active") matchStatus = !item.isDeleted;
    if (filterStatus === "deleted") matchStatus = item.isDeleted === true;

    return matchSearch && matchTpl && matchStatus;
  });

  return {
    items,
    templates,
    loading,
    search,
    setSearch,
    filterTpl,
    setFilterTpl,
    filterStatus,
    setFilterStatus,
    isProcessing,
    handleDelete,
    handleUndelete,
    filteredItems,
  };
};
