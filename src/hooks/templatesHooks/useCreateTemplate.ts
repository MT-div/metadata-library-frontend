// src/hooks/useCreateTemplate.ts
import { useState, useEffect } from "react";
import { metadataService } from "../../services/metadataService";
import type {
  CreateResourceTemplateCommand,
  TemplatePropertyRequest,
} from "../../types/template.types";
import type { VocabularyResponse } from "../../types/vocabulary.types";

type AvailableProperty = {
  id: number;
  label: string;
  vocabularyPrefix: string;
  localName: string;
};

export const useCreateTemplate = () => {
  const [templateData, setTemplateData] =
    useState<CreateResourceTemplateCommand>({
      label: "",
      description: "",
      isBorrowable: true, // افتراضياً مسموح إعارته
      defaultBorrowDays: null, // فارغ يعني يعتمد على الإعداد العام
    });
  const [selectedProperties, setSelectedProperties] = useState<
    TemplatePropertyRequest[]
  >([]);
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [selectedVocabId, setSelectedVocabId] = useState<number>(0);
  const [availableProps, setAvailableProps] = useState<AvailableProperty[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [propCache, setPropCache] = useState<Record<number, string>>({});

  useEffect(() => {
    // جلب القواميس عبر الخدمة الموحدة
    metadataService
      .getVocabularies()
      .then((res) => {
        const data = res.data;
        setVocabularies(data);
        if (data.length > 0) setSelectedVocabId(data[0].id);
      })
      .catch((err) => console.error("Error fetching vocabularies:", err));
  }, []);

  useEffect(() => {
    if (!selectedVocabId) return;

    // جلب الخصائص المرتبطة بالقاموس المختار عبر الخدمة الموحدة
    metadataService
      .getPropertiesByVocabulary(selectedVocabId)
      .then((res) => {
        const data = res.data as AvailableProperty[];
        setAvailableProps(data);
        setSelectedPropId(data.length > 0 ? data[0].id : 0);

        // تحديث الذاكرة المؤقتة لعناوين الخصائص المضافة
        const entries: Record<number, string> = {};
        data.forEach((p) => {
          entries[p.id] = p.label;
        });
        setPropCache((prev) => ({ ...prev, ...entries }));
      })
      .catch((err) => console.error("Error fetching properties:", err));
  }, [selectedVocabId]);

  const handleAddProperty = () => {
    if (!selectedPropId) return;
    if (selectedProperties.some((p) => p.propertyId === selectedPropId)) {
      alert("This property is already added.");
      return;
    }
    setSelectedProperties((prev) => [
      ...prev,
      {
        propertyId: selectedPropId,
        isRequired: false,
        displayOrder: prev.length + 1,
        alternateLabel: "",
      },
    ]);
  };

  const handleRemove = (id: number) =>
    setSelectedProperties((prev) =>
      prev
        .filter((p) => p.propertyId !== id)
        .map((p, i) => ({ ...p, displayOrder: i + 1 }))
    );

  const handleToggle = (id: number) =>
    setSelectedProperties((prev) =>
      prev.map((p) =>
        p.propertyId === id ? { ...p, isRequired: !p.isRequired } : p
      )
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProperties.length === 0) {
      alert("Add at least one property to the template.");
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. إنشاء القالب وحفظه والحصول على معرّفه عبر الخدمة الموحدة
      const createRes = await metadataService.createTemplate(templateData);
      const createdId = createRes.data.id ?? createRes.data;

      // 2. ربط وحفظ مصفوفة الخصائص بالقالب المختار
      await metadataService.saveTemplateProperties(
        createdId,
        selectedProperties
      );

      setSuccess(true);
      setTimeout(() => {
        setTemplateData({
          label: "",
          description: "",
          isBorrowable: true,
          defaultBorrowDays: null,
        });
        setSelectedProperties([]);
        setSuccess(false);
      }, 2200);
    } catch (err) {
      console.error("Error creating template:", err);
      alert("حدث خطأ أثناء حفظ القالب. راجع الكونسول.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    templateData,
    setTemplateData,
    selectedProperties,
    vocabularies,
    selectedVocabId,
    setSelectedVocabId,
    availableProps,
    selectedPropId,
    setSelectedPropId,
    isSubmitting,
    success,
    focused,
    setFocused,
    propCache,
    handleAddProperty,
    handleRemove,
    handleToggle,
    handleSubmit,
  };
};
