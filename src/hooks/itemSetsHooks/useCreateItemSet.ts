// src/hooks/useCreateItemSet.ts
import { useState } from "react";
import { itemService } from "../../services/itemService";
import type { CreateItemSetCommand } from "../../types/itemSet.types";

export const useCreateItemSet = (ownerId = 1) => {
  const [formData, setFormData] = useState<CreateItemSetCommand>({
    title: "",
    description: "",
    isPublic: true,
    ownerId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, onFinish?: () => void) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // استدعاء الخدمة الموحدة لإنشاء المجموعة
      const res = await itemService.createItemSet(formData);

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({
            title: "",
            description: "",
            isPublic: true,
            ownerId,
          });
          setSuccess(false);
          if (onFinish) onFinish(); // كولباك اختياري بعد نجاح العملية
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating item set:", err);
      alert("حدث خطأ أثناء إنشاء المجموعة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    success,
    focusedField,
    setFocusedField,
    handleSubmit,
  };
};
