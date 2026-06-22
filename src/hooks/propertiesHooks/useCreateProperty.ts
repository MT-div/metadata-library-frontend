// src/hooks/useCreateProperty.ts
import { useState, useEffect } from "react";
import { metadataService } from "../../services/metadataService";
import type { CreatePropertyCommand } from "../../types/property.types";
import type { VocabularyResponse } from "../../types/vocabulary.types";

export const useCreateProperty = () => {
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [formData, setFormData] = useState<CreatePropertyCommand>({
    vocabularyId: 0,
    localName: "",
    label: "",
    termUri: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    // جلب القواميس عبر خدمة الميتاداتا الموحدة
    metadataService
      .getVocabularies()
      .then((res) => {
        const data = res.data;
        setVocabularies(data);
        if (data.length > 0)
          setFormData((p) => ({ ...p, vocabularyId: data[0].id }));
      })
      .catch((err) => console.error("Error fetching vocabularies:", err));
  }, []);

  const selectedVocab = vocabularies.find(
    (v) => v.id === formData.vocabularyId
  );

  // حساب الـ URI التلقائي بناءً على القاموس المحدد والاسم المحلي
  const autoUri =
    selectedVocab && formData.localName
      ? `${selectedVocab.namespaceUri}${formData.localName}`
      : "";

  const handleLocalNameChange = (val: string) => {
    setFormData((p) => ({
      ...p,
      localName: val,
      termUri: selectedVocab
        ? `${selectedVocab.namespaceUri}${val}`
        : p.termUri,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // إنشاء الخاصية عبر خدمة الميتاداتا الموحدة
      const res = await metadataService.createProperty(formData);

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({
            vocabularyId: vocabularies[0]?.id || 0,
            localName: "",
            label: "",
            termUri: "",
          });
          setSuccess(false);
        }, 2200);
      }
    } catch (e) {
      console.error("Error creating property:", e);
      alert("حدث خطأ أثناء حفظ الخاصية. تأكد من الكونسول.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    vocabularies,
    formData,
    setFormData,
    isSubmitting,
    success,
    focused,
    setFocused,
    selectedVocab,
    autoUri,
    handleLocalNameChange,
    handleSubmit,
  };
};
