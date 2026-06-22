// src/hooks/useManageItemSets.ts
import { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import type { ItemSetResponse } from "../../types/itemSet.types";
import type { ItemResponse } from "../../types/item.types";

interface ExtendedItemSetResponse extends ItemSetResponse {
  isDeleted?: boolean;
}

export const useManageItemSets = () => {
  const [itemSets, setItemSets] = useState<ExtendedItemSetResponse[]>([]);
  const [allItems, setAllItems] = useState<ItemResponse[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);

  // Status Filter State
  const [filterStatus, setFilterStatus] = useState<
    "active" | "deleted" | "all"
  >("active");

  const [itemToAdd, setItemToAdd] = useState<number | string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeletingSet, setIsDeletingSet] = useState<number | null>(null);
  const [focusedSel, setFocusedSel] = useState(false);
  const getItemTitle = (item: ItemResponse) =>
    item.metadataValues.find(
      (v) =>
        v.propertyLabel.toLowerCase().includes("title") ||
        v.propertyLabel.includes("عنوان")
    )?.valueText ?? `Untitled #${item.id}`;
  useEffect(() => {
    Promise.all([
      // جلب المجموعات (مع المحذوفة) والعناصر عبر الخدمة الموحدة
      itemService.getItemSets(true).then((r) => r.data),
      itemService.getItems().then((r) => r.data),
    ])
      .then(([sets, items]) => {
        setItemSets(sets);
        setAllItems(items);
        if (sets.length > 0) setSelectedSetId(sets[0].id);
      })
      .catch((err) => console.error("Error loading ItemSets data:", err));
  }, []);

  const selectedSet = itemSets.find((s) => s.id === selectedSetId);
  const isSelectedSetDeleted = selectedSet?.isDeleted === true;

  // ── COLLECTION ACTIONS (SOFT DELETE & RESTORE) ──

  const handleDeleteSet = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this collection? (Soft Delete)")
    )
      return;

    setIsDeletingSet(id);
    try {
      await itemService.deleteItemSet(id);
      setItemSets((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isDeleted: true } : s))
      );

      // إذا قمنا بحذف المجموعة المفتوحة حالياً، نقوم بإلغاء تحديدها
      if (filterStatus === "active" && selectedSetId === id) {
        setSelectedSetId(null);
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("An error occurred while deleting the collection.");
    } finally {
      setIsDeletingSet(null);
    }
  };

  const handleRestoreSet = async (id: number) => {
    if (!confirm("Are you sure you want to restore this collection?")) return;

    setIsDeletingSet(id);
    try {
      await itemService.restoreItemSet(id);
      setItemSets((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isDeleted: false } : s))
      );
    } catch (error) {
      console.error("Error restoring collection:", error);
      alert("An error occurred while restoring the collection.");
    } finally {
      setIsDeletingSet(null);
    }
  };

  // ── ITEM LINKING ACTIONS ──

  const handleAdd = async () => {
    if (!selectedSetId || !itemToAdd || isSelectedSetDeleted) return;
    if (selectedSet?.items?.some((i) => i.id === Number(itemToAdd))) {
      alert("This item already exists in the collection.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await itemService.linkItemToSet(
        selectedSetId,
        Number(itemToAdd)
      );

      if (res.status === 200 || res.status === 204) {
        const added = allItems.find((i) => i.id === Number(itemToAdd));
        if (added) {
          setItemSets((prev) =>
            prev.map((s) =>
              s.id === selectedSetId
                ? {
                    ...s,
                    items: [
                      ...(s.items || []),
                      {
                        id: added.id,
                        type: "Item" as const,
                        templateId: added.templateId,
                        ownerId: null,
                      },
                    ],
                  }
                : s
            )
          );
        }
        setItemToAdd("");
      }
    } catch (e) {
      console.error("Add item error:", e);
      alert("An error occurred while linking the item.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (itemId: number) => {
    if (isSelectedSetDeleted) return;
    if (
      !selectedSetId ||
      !confirm(
        "Remove this item from the collection? (The item won't be deleted from the library)"
      )
    )
      return;

    setIsProcessing(true);
    try {
      const res = await itemService.unlinkItemFromSet(selectedSetId, itemId);

      if (res.status === 200 || res.status === 204) {
        setItemSets((prev) =>
          prev.map((s) =>
            s.id === selectedSetId
              ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
              : s
          )
        );
      }
    } catch (e) {
      console.error("Remove item error:", e);
      alert("An error occurred while removing the item.");
    } finally {
      setIsProcessing(false);
    }
  };

  // تصفية المجموعات بناءً على الفلتر النشط
  const filteredSets = itemSets.filter((set) => {
    if (filterStatus === "active") return !set.isDeleted;
    if (filterStatus === "deleted") return set.isDeleted;
    return true;
  });

  return {
    itemSets,
    setItemSets,
    allItems,
    selectedSetId,
    setSelectedSetId,
    filterStatus,
    setFilterStatus,
    itemToAdd,
    setItemToAdd,
    isProcessing,
    isDeletingSet,
    focusedSel,
    setFocusedSel,
    selectedSet,
    isSelectedSetDeleted,
    handleDeleteSet,
    handleRestoreSet,
    handleAdd,
    handleRemove,
    filteredSets,
    getItemTitle,
  };
};
