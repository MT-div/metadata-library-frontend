// src/hooks/useCreateMedia.ts
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { mediaService } from "../services/mediaService";
import { metadataService } from "../services/metadataService";
import type { CreateValueRequest } from "../types/item.types";

interface PropertyOption {
  id: number;
  label: string;
}

export const useCreateMedia = () => {
  const location = useLocation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [itemId, setItemId] = useState<number>(location.state?.media || 0);
  const [mediaValues, setMediaValues] = useState<CreateValueRequest[]>([]);
  const [availableProps, setAvailableProps] = useState<PropertyOption[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | number | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // جلب الخصائص عبر خدمة الميتاداتا الموحدة
    metadataService
      .getProperties()
      .then((res) => {
        setAvailableProps(res.data);
        if (res.data.length > 0) setSelectedPropId(res.data[0].id);
      })
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);

  const handleFileSelect = (file: File) => setSelectedFile(file);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleAddValue = () => {
    if (!selectedPropId) return;
    setMediaValues((prev) => [
      ...prev,
      {
        propertyId: selectedPropId,
        valueText: "",
        type: "literal",
        language: "en",
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    if (itemId <= 0) {
      alert("Please enter a valid Item ID.");
      return;
    }
    setIsSubmitting(true);

    try {
      const formattedValues = mediaValues.map((v) => ({
        propertyId: v.propertyId,
        valueText: v.valueText,
        type: "literal",
        language: "en",
      }));

      const fd = new FormData();
      fd.append("File", selectedFile);
      fd.append("ItemId", itemId.toString());
      fd.append("ValuesJson", JSON.stringify(formattedValues));

      // رفع الملف وحفظ ميتاداتا الوسائط عبر الخدمة الموحدة
      const res = await mediaService.uploadMediaWithMetadata(fd);
      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setSelectedFile(null);
          setItemId(0);
          setMediaValues([]);
          setSuccess(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }, 2200);
      }
    } catch (err) {
      console.error("Media upload error:", err);
      alert(
        "حدث خطأ أثناء رفع الملف أو حفظ البيانات. تأكد من أن الـ Item ID صحيح."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return {
    selectedFile,
    setSelectedFile,
    isDragging,
    setIsDragging,
    itemId,
    setItemId,
    mediaValues,
    setMediaValues,
    availableProps,
    selectedPropId,
    setSelectedPropId,
    isSubmitting,
    success,
    focusedField,
    setFocusedField,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleAddValue,
    handleSubmit,
    formatSize,
  };
};
