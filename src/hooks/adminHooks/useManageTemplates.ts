// src/hooks/useManageTemplates.ts
import { useState, useEffect } from "react";
import { metadataService } from "../../services/metadataService";
import type {
  ResourceTemplateResponse,
  TemplatePropertyRequest,
} from "../../types/template.types";

interface ExtendedTemplateResponse extends ResourceTemplateResponse {
  isDeleted?: boolean;
}

type EditableProperty = TemplatePropertyRequest & { propertyLabel?: string };
type PropertyOption = {
  id: number;
  label: string;
  vocabularyPrefix: string;
  localName: string;
};

export const useManageTemplates = () => {
  const [templates, setTemplates] = useState<ExtendedTemplateResponse[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );

  // Status Filter State
  const [filterStatus, setFilterStatus] = useState<
    "active" | "deleted" | "all"
  >("active");

  const [editableProps, setEditableProps] = useState<EditableProperty[]>([]);
  // 👇 حفظ النسخة الأصلية للمقارنة الحيوية والتأكد من وجود تغييرات غير محفوظة
  const [originalProps, setOriginalProps] = useState<EditableProperty[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyOption[]>([]);

  // حساب هل يوجد تغييرات يدوية مقارنة بالنسخة الأصلية لحفظ الزر تفاعلياً
  const hasChanges =
    JSON.stringify(originalProps) !== JSON.stringify(editableProps);
  const [propToAdd, setPropToAdd] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessingTpl, setIsProcessingTpl] = useState<number | null>(null);

  const selectTemplate = (
    id: number | null,
    list: ExtendedTemplateResponse[] = templates
  ) => {
    setSelectedTemplateId(id);
    if (!id) {
      setEditableProps([]);
      setOriginalProps([]); // تصفير النسخة الأصلية
      return;
    }
    const tpl = list.find((t) => t.id === id);
    if (tpl) {
      const mapped = [...tpl.properties]
        .map((p) => ({
          propertyId: p.propertyId,
          propertyLabel: p.propertyLabel,
          isRequired: p.isRequired,
          displayOrder: p.displayOrder,
          alternateLabel: "",
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);

      setEditableProps(mapped);
      // أخذ نسخة عميقة لحفظها من أي تعديلات لاحقة حتى نضغط حفظ
      setOriginalProps(JSON.parse(JSON.stringify(mapped)));
    }
  };

  useEffect(() => {
    Promise.all([
      metadataService.getTemplates(true).then((r) => r.data),
      metadataService.getProperties().then((r) => r.data),
    ])
      .then(([tpls, props]) => {
        setTemplates(tpls);
        setAllProperties(props);
        if (tpls.length > 0) selectTemplate(tpls[0].id, tpls);
      })
      .catch((err) => console.error("Error loading builder data:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const isSelectedTplDeleted = selectedTemplate?.isDeleted === true;

  // ── TEMPLATE ACTIONS (SOFT DELETE & RESTORE) ──

  const handleDeleteTemplate = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this template? (Soft Delete)")
    )
      return;

    setIsProcessingTpl(id);
    try {
      await metadataService.deleteTemplate(id);
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDeleted: true } : t))
      );

      if (filterStatus === "active" && selectedTemplateId === id) {
        setSelectedTemplateId(null);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("An error occurred while deleting the template.");
    } finally {
      setIsProcessingTpl(null);
    }
  };

  const handleRestoreTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to restore this template?")) return;

    setIsProcessingTpl(id);
    try {
      await metadataService.restoreTemplate(id);
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDeleted: false } : t))
      );
    } catch (error) {
      console.error("Error restoring template:", error);
      alert("An error occurred while restoring the template.");
    } finally {
      setIsProcessingTpl(null);
    }
  };

  // ── EDITOR LOGIC ──

  const recalc = (list: EditableProperty[]) =>
    setEditableProps(list.map((p, i) => ({ ...p, displayOrder: i + 1 })));

  const handleAdd = () => {
    if (!propToAdd || isSelectedTplDeleted) return;
    if (editableProps.some((p) => p.propertyId === propToAdd)) {
      alert("Property already exists in this template.");
      return;
    }
    const pd = allProperties.find((p) => p.id === propToAdd);
    recalc([
      ...editableProps,
      {
        propertyId: propToAdd,
        propertyLabel: pd?.label ?? "New Property",
        isRequired: false,
        displayOrder: editableProps.length + 1,
        alternateLabel: "",
      },
    ]);
    setPropToAdd(0);
  };

  const handleRemove = (i: number) => {
    if (isSelectedTplDeleted) return;
    recalc(editableProps.filter((_, idx) => idx !== i));
  };

  const moveUp = (i: number) => {
    if (i === 0 || isSelectedTplDeleted) return;
    const a = [...editableProps];
    [a[i - 1], a[i]] = [a[i], a[i - 1]];
    recalc(a);
  };

  const moveDown = (i: number) => {
    if (i === editableProps.length - 1 || isSelectedTplDeleted) return;
    const a = [...editableProps];
    [a[i + 1], a[i]] = [a[i], a[i + 1]];
    recalc(a);
  };

  const toggleReq = (i: number) => {
    if (isSelectedTplDeleted) return;
    const a = [...editableProps];
    a[i].isRequired = !a[i].isRequired;
    setEditableProps(a);
  };

  const handleSave = async () => {
    if (!selectedTemplateId || isSelectedTplDeleted) return;
    setIsSaving(true);
    try {
      const propertiesCommand = editableProps.map((p) => ({
        propertyId: p.propertyId,
        isRequired: p.isRequired,
        displayOrder: p.displayOrder,
        alternateLabel: p.alternateLabel,
      }));

      const res = await metadataService.saveTemplateProperties(
        selectedTemplateId,
        propertiesCommand
      );

      if (res.status === 200 || res.status === 204) {
        setSaveSuccess(true);
        setOriginalProps(JSON.parse(JSON.stringify(editableProps)));
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("حدث خطأ أثناء الحفظ. تأكد من الكونسول.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    if (filterStatus === "active") return !tpl.isDeleted;
    if (filterStatus === "deleted") return tpl.isDeleted;
    return true;
  });

  return {
    templates,
    selectedTemplateId,
    filterStatus,
    setFilterStatus,
    editableProps,
    allProperties,
    hasChanges,
    propToAdd,
    setPropToAdd,
    isSaving,
    saveSuccess,
    isProcessingTpl,
    selectedTemplate,
    isSelectedTplDeleted,
    selectTemplate,
    handleDeleteTemplate,
    handleRestoreTemplate,
    handleAdd,
    handleRemove,
    moveUp,
    moveDown,
    toggleReq,
    handleSave,
    filteredTemplates,
  };
};
