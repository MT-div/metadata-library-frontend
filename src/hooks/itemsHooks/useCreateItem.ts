// src/hooks/useCreateItem.ts
import { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import { metadataService } from "../../services/metadataService";
import type { ResourceTemplateResponse } from "../../types/template.types";
import type { CreateItemCommand } from "../../types/item.types";

export const useCreateItem = (ownerId = 1) => {
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<number, string>>({});
  const [focusedField, setFocusedField] = useState<number | string | null>(
    null
  );

  useEffect(() => {
    metadataService
      .getTemplates()
      .then((res) => {
        setTemplates(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching templates:", err);
        setLoading(false);
      });
  }, []);

  const handleTemplateChange = (val: string) => {
    setSelectedTemplateId(val === "" ? "" : Number(val));
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) return;
    setIsSubmitting(true);

    const command: CreateItemCommand = {
      templateId: Number(selectedTemplateId),
      ownerId,
      values: Object.entries(formData).map(([propId, valueText]) => ({
        propertyId: Number(propId),
        valueText,
        type: "literal",
        language: "ar",
      })),
    };

    try {
      const res = await itemService.createItem(command);
      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({});
          setSuccess(false);
        }, 2200);
      }
    } catch (e) {
      console.error("Error creating item:", e);
      alert("حدث خطأ أثناء حفظ العنصر.");
    } finally {
      setIsSubmitting(true); // نتركها true لحين انتهاء العملية أو إعادة التهيأة
      setIsSubmitting(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const sortedProps =
    selectedTemplate?.properties
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder) ?? [];
  const filledCount = Object.values(formData).filter((v) => v.trim()).length;
  const totalRequired = sortedProps.filter((p) => p.isRequired).length;

  return {
    templates,
    selectedTemplateId,
    loading,
    isSubmitting,
    success,
    formData,
    setFormData,
    focusedField,
    setFocusedField,
    handleTemplateChange,
    handleSubmit,
    selectedTemplate,
    sortedProps,
    filledCount,
    totalRequired,
  };
};
