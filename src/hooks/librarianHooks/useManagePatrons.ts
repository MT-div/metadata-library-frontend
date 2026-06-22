// src/hooks/useManagePatrons.ts
import { useState, useEffect } from "react";
import { patronService } from "../../services/patronService";
import type { PatronResponse } from "../../types/patron.types";

export const useManagePatrons = () => {
  const [patrons, setPatrons] = useState<PatronResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    // جلب المشتركين عبر خدمة المشتركين الموحدة
    patronService
      .getPatrons()
      .then((res) => setPatrons(res.data))
      .catch((err: unknown) => console.error("Error fetching patrons:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this patron?")) return;

    setIsDeleting(id);
    try {
      // حذف المشترك عبر الخدمة الموحدة
      await patronService.deletePatron(id);
      setPatrons((prev) => prev.filter((p) => p.id !== id));
    } catch (error: unknown) {
      console.error("Error deleting patron:", error);
      alert("Error deleting patron. They might have active loans.");
    } finally {
      setIsDeleting(null);
    }
  };

  // تصفية المشتركين بناءً على البحث
  const filteredPatrons = patrons.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(query) ||
      p.nationalId.toLowerCase().includes(query) ||
      p.phoneNumber.includes(query) ||
      p.id.toString() === query
    );
  });

  return {
    patrons,
    loading,
    search,
    setSearch,
    isDeleting,
    handleDelete,
    filteredPatrons,
  };
};
