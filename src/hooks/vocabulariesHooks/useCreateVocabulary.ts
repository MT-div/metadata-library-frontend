// src/hooks/useCreateVocabulary.ts
import { useState } from "react";
import { metadataService } from "../../services/metadataService";
import type { CreateVocabularyCommand } from "../../types/vocabulary.types";

export const useCreateVocabulary = () => {
  const [formData, setFormData] = useState<CreateVocabularyCommand>({
    prefix: "",
    namespaceUri: "",
    label: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  // حساب فضاء التسمية المقترح تلقائياً من البادئة (Prefix)
  const uriPreview = formData.prefix
    ? `https://purl.org/${formData.prefix.toLowerCase()}/terms/`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // إنشاء القاموس عبر خدمة الميتاداتا الموحدة
      const res = await metadataService.createVocabulary(formData);

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({ prefix: "", namespaceUri: "", label: "" });
          setSuccess(false);
        }, 2200);
      }
    } catch (e) {
      console.error("Error creating vocabulary:", e);
      alert("حدث خطأ أثناء حفظ القاموس، تأكد من الكونسول.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    success,
    focused,
    setFocused,
    uriPreview,
    handleSubmit,
  };
};
