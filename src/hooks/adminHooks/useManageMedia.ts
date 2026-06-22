// src/hooks/useManageMedia.ts
import { useState, useEffect } from "react";
import { mediaService } from "../../services/mediaService";
import type { MediaResponse } from "../../types/media.types";

interface ExtendedMediaResponse extends MediaResponse {
  isDeleted?: boolean;
}

export const useManageMedia = () => {
  const [mediaList, setMediaList] = useState<ExtendedMediaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "deleted"
  >("active");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  useEffect(() => {
    mediaService
      .getMedia(true) // نمرر true لجلب الملفات المحذوفة من الخدمة
      .then((res) => {
        setMediaList(res.data);
      })
      .catch((err) => {
        console.error("Error fetching media:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file? (Soft Delete)"))
      return;

    setIsProcessing(id);
    try {
      await mediaService.deleteMedia(id);
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isDeleted: true } : m))
      );
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("حدث خطأ أثناء الحذف.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm("Are you sure you want to restore this file?")) return;

    setIsProcessing(id);
    try {
      await mediaService.restoreMedia(id);
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isDeleted: false } : m))
      );
    } catch (error) {
      console.error("Error restoring media:", error);
      alert("حدث خطأ أثناء الاسترجاع.");
    } finally {
      setIsProcessing(null);
    }
  };

  const filtered = mediaList.filter((m) => {
    const matchSearch =
      !search ||
      m.fileName.toLowerCase().includes(search.toLowerCase()) ||
      m.itemId.toString() === search;

    let matchStatus = true;
    if (filterStatus === "active") matchStatus = !m.isDeleted;
    if (filterStatus === "deleted") matchStatus = m.isDeleted === true;

    return matchSearch && matchStatus;
  });

  // حساب الإحصائيات (للعناصر النشطة فقط)
  const activeMedia = mediaList.filter((m) => !m.isDeleted);
  const imageCount = activeMedia.filter((m) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(m.fileName)
  ).length;
  const videoCount = activeMedia.filter((m) =>
    /\.(mp4|mov|avi|mkv)$/i.test(m.fileName)
  ).length;
  const docCount = activeMedia.filter((m) =>
    /\.(pdf|doc|docx|txt)$/i.test(m.fileName)
  ).length;

  return {
    mediaList,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    isProcessing,
    handleDelete,
    handleRestore,
    filtered,
    activeMedia,
    imageCount,
    videoCount,
    docCount,
  };
};
