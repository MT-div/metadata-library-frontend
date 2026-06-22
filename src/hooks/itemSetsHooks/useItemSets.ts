// src/hooks/useItemSets.ts
import { useState, useEffect } from "react";
import { itemService } from "../services/itemService";
import type { ItemSetResponse } from "../types/itemSet.types";

export const useItemSets = () => {
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // جلب مجموعات الكتب عبر الخدمة الموحدة
    itemService
      .getItemSets()
      .then((res) => {
        setItemSets(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading item sets:", err);
        setLoading(false);
      });
  }, []);

  // حساب الفلترة والبحث المشتق
  const filtered = itemSets.filter(
    (s) =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
  );

  // حساب الإحصائيات ديناميكياً
  const publicCount = itemSets.filter((s) => s.isPublic).length;
  const privateCount = itemSets.length - publicCount;
  const totalItems = itemSets.reduce(
    (acc, s) => acc + (s.items?.length || 0),
    0
  );

  return {
    itemSets,
    loading,
    search,
    setSearch,
    filtered,
    publicCount,
    privateCount,
    totalItems,
  };
};
