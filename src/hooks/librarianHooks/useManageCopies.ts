// src/hooks/useManageCopies.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { itemService } from "../../services/itemService";
import { AxiosError } from "axios";
import type { ItemResponse } from "../../types/item.types";
import type { ItemCopyResponse } from "../../types/itemCopy.types";
import { getItemTitle } from "../../utils/helpers";

export const useManageCopies = () => {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [copies, setCopies] = useState<ItemCopyResponse[]>([]);

  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");

  // Add Copy Form State
  const [newBarcode, setNewBarcode] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // ── Inline Edit State ──
  const [editingCopyId, setEditingCopyId] = useState<number | null>(null);
  const [editBarcode, setEditBarcode] = useState("");
  const [editStatus, setEditStatus] = useState<number>(0);
  const [editNotes, setEditNotes] = useState("");

  const handleSelectItem = useCallback(async (itemId: number) => {
    setSelectedItemId(itemId);
    setEditingCopyId(null); // إلغاء أي تعديل مفتوح عند تغيير الكتاب
    setLoadingCopies(true);
    try {
      const res = await itemService.getCopiesByItemId(itemId);
      setCopies(Array.isArray(res.data) ? res.data : []);
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error fetching copies:", error);
      setCopies([]);
    } finally {
      setLoadingCopies(false);
    }
  }, []);

  useEffect(() => {
    itemService
      .getItems()
      .then((res) => {
        const fetchedItems = res.data || [];
        setItems(fetchedItems);
        if (fetchedItems.length > 0) {
          handleSelectItem(fetchedItems[0].id);
        }
      })
      .catch((err) => console.error("Error fetching items:", err))
      .finally(() => setLoadingItems(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSelectItem]);

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !newBarcode.trim()) return;

    if (
      Array.isArray(copies) &&
      copies.some(
        (c) => c.barcode?.toLowerCase() === newBarcode.trim().toLowerCase()
      )
    ) {
      alert("This barcode is already registered for this item!");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        itemId: selectedItemId,
        barcode: newBarcode.trim(),
        notes: newNotes.trim() || null,
      };

      await itemService.addCopy(payload);
      const copiesRes = await itemService.getCopiesByItemId(selectedItemId);
      setCopies(Array.isArray(copiesRes.data) ? copiesRes.data : []);

      setNewBarcode("");
      setNewNotes("");
      barcodeInputRef.current?.focus();
    } catch (error: unknown) {
      console.error("Error adding copy:", error);
      if (error instanceof AxiosError && error.response) {
        alert(error.response.data || "Failed to add copy.");
      } else {
        alert("Network error. Failed to add copy.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCopy = async (copyId: number) => {
    if (!confirm("Are you sure you want to delete this physical copy?")) return;

    setIsProcessing(true);
    try {
      await itemService.deleteCopy(copyId);
      setCopies((prev) => prev.filter((c) => c.id !== copyId));
    } catch (error: unknown) {
      console.error("Error deleting copy:", error);
      if (error instanceof AxiosError && error.response) {
        alert(
          error.response.data ||
            "Failed to delete copy. It might be currently borrowed."
        );
      } else {
        alert("Network error. Failed to delete copy.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startEditing = (copy: ItemCopyResponse) => {
    setEditingCopyId(copy.id);
    setEditBarcode(copy.barcode);
    setEditStatus(copy.status);
    setEditNotes(copy.notes || "");
  };

  const cancelEditing = () => {
    setEditingCopyId(null);
  };

  const saveEdit = async (copyId: number) => {
    if (!editBarcode.trim()) return;
    setIsProcessing(true);
    try {
      const payload = {
        id: copyId,
        barcode: editBarcode.trim(),
        status: editStatus,
        notes: editNotes.trim() || null,
      };

      await itemService.updateCopy(copyId, payload);

      setCopies((prev) =>
        prev.map((c) => (c.id === copyId ? { ...c, ...payload } : c))
      );
      setEditingCopyId(null);
    } catch (error: unknown) {
      console.error("Error updating copy:", error);
      alert("Failed to update copy. Check barcode uniqueness.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const title = getItemTitle(item).toLowerCase();
    const query = search.toLowerCase();
    return title.includes(query) || item.id.toString() === query;
  });

  const selectedItem = items.find((i) => i.id === selectedItemId);

  return {
    selectedItemId,
    copies,
    loadingItems,
    loadingCopies,
    isProcessing,
    search,
    setSearch,
    newBarcode,
    setNewBarcode,
    newNotes,
    setNewNotes,
    barcodeInputRef,
    editingCopyId,
    editBarcode,
    setEditBarcode,
    editStatus,
    setEditStatus,
    editNotes,
    setEditNotes,
    handleSelectItem,
    handleAddCopy,
    handleDeleteCopy,
    startEditing,
    cancelEditing,
    saveEdit,
    filteredItems,
    selectedItem,
  };
};
