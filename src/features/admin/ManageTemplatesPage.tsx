import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutTemplate,
  Plus,
  Save,
  ArrowUp,
  ArrowDown,
  Trash2,
  Settings2,
} from "lucide-react";
import type {
  ResourceTemplateResponse,
  TemplatePropertyRequest,
} from "../../types/metadata";

// نوع مساعد لجمع بيانات الخاصية الكاملة مع حالة الـ Request
type EditableProperty = TemplatePropertyRequest & { propertyLabel?: string };

export const ManageTemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );

  // الخصائص الخاصة بالقالب قيد التعديل
  const [editableProperties, setEditableProperties] = useState<
    EditableProperty[]
  >([]);

  type PropertyOption = {
    id: number;
    label: string;
    vocabularyPrefix: string;
    localName: string;
  };

  // الخصائص المتاحة في النظام (لإضافتها للقالب)
  const [allProperties, setAllProperties] = useState<PropertyOption[]>([]);
  const [propToAdd, setPropToAdd] = useState<number>(0);

  const [isSaving, setIsSaving] = useState(false);

  const selectTemplate = (
    templateId: number | null,
    templatesList: ResourceTemplateResponse[] = templates
  ) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setEditableProperties([]);
      return;
    }

    const template = templatesList.find((t) => t.id === templateId);
    if (template) {
      const mappedProps: EditableProperty[] = template.properties
        .map((p) => ({
          propertyId: p.propertyId,
          propertyLabel: p.propertyLabel,
          isRequired: p.isRequired,
          displayOrder: p.displayOrder,
          alternateLabel: "",
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);

      setEditableProperties(mappedProps);
    } else {
      setEditableProperties([]);
    }
  };

  // 1. جلب البيانات الأساسية
  useEffect(() => {
    Promise.all([
      fetch("/api/templates").then((res) => res.json()),
      fetch("/api/properties").then((res) => res.json()),
    ]).then(([templatesData, propsData]) => {
      setTemplates(templatesData);
      setAllProperties(propsData);
      if (templatesData.length > 0) {
        selectTemplate(templatesData[0].id, templatesData);
      }
    });
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // --- دوال التحكم في المحرر (Logic) ---

  // إضافة خاصية للقالب
  const handleAddProperty = () => {
    if (propToAdd === 0) return;
    if (editableProperties.some((p) => p.propertyId === propToAdd)) {
      alert("الخاصية موجودة مسبقاً في هذا القالب!");
      return;
    }

    const propDetails = allProperties.find((p) => p.id === propToAdd);
    const newProp: EditableProperty = {
      propertyId: propToAdd,
      propertyLabel: propDetails?.label || "خاصية جديدة",
      isRequired: false,
      displayOrder: editableProperties.length + 1,
    };

    setEditableProperties([...editableProperties, newProp]);
  };

  // إزالة خاصية
  const handleRemoveProperty = (indexToRemove: number) => {
    const updated = editableProperties.filter(
      (_, idx) => idx !== indexToRemove
    );
    // إعادة ترتيب الـ displayOrder بعد الحذف
    recalculateOrder(updated);
  };

  // تحريك لأعلى
  const moveUp = (index: number) => {
    if (index === 0) return; // هو الأول بالفعل
    const updated = [...editableProperties];
    // تبديل العناصر
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    recalculateOrder(updated);
  };

  // تحريك لأسفل
  const moveDown = (index: number) => {
    if (index === editableProperties.length - 1) return; // هو الأخير بالفعل
    const updated = [...editableProperties];
    // تبديل العناصر
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    recalculateOrder(updated);
  };

  // إعادة حساب الترتيب (displayOrder)
  const recalculateOrder = (list: EditableProperty[]) => {
    const orderedList = list.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
    }));
    setEditableProperties(orderedList);
  };

  // تغيير الإلزام (Required)
  const toggleRequired = (index: number) => {
    const updated = [...editableProperties];
    updated[index].isRequired = !updated[index].isRequired;
    setEditableProperties(updated);
  };

  // حفظ التعديلات وإرسال الـ Command
  const handleSave = async () => {
    if (!selectedTemplateId) return;
    setIsSaving(true);

    try {
      // تجهيز ה- Command كما يتوقعه ה- C# تماماً
      const command = {
        templateId: selectedTemplateId,
        properties: editableProperties.map((p) => ({
          propertyId: p.propertyId,
          isRequired: p.isRequired,
          displayOrder: p.displayOrder,
          alternateLabel: p.alternateLabel,
        })),
      };

      const response = await fetch(
        `/api/templates/${selectedTemplateId}/properties`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        }
      );

      if (response.ok) {
        alert("تم حفظ هيكل القالب بنجاح! راجع الكونسول لرؤية الـ Command");
        console.log("🚀 UpdateTemplatePropertiesCommand:", command);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* الترويسة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings2 className="text-primary" size={32} /> إدارة وتعديل
            القوالب
          </h1>
          <p className="text-gray-500 mt-2">
            قم بإدارة حقول النماذج وتغيير ترتيبها لتخصيص تجربة الإدخال.
          </p>
        </div>
        <button
          onClick={() => navigate("/templates/new")}
          className="bg-white border-2 border-primary text-primary px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-50 transition"
        >
          <Plus size={20} /> بناء قالب جديد كلياً
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* اللوحة الجانبية: قائمة القوالب */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4">
              <LayoutTemplate className="text-primary" size={20} /> القوالب
              المتاحة
            </h2>
            <div className="flex flex-col gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`text-right px-4 py-3 rounded-lg border transition text-sm font-semibold ${
                    selectedTemplateId === template.id
                      ? "bg-blue-50 border-primary text-primary"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* محرر القالب (Template Editor) */}
        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-full">
              {/* ترويسة المحرر */}
              <div className="bg-gray-50 border-b p-5 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-xl text-gray-800">
                    محرر الحقول: {selectedTemplate.label}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save size={20} />{" "}
                  {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>

              {/* أداة إضافة خاصية جديدة */}
              <div className="p-5 border-b bg-white">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  إضافة خاصية لهذا القالب:
                </label>
                <div className="flex gap-2">
                  <select
                    className="grow border rounded-lg p-2.5 outline-none bg-white focus:border-primary"
                    value={propToAdd}
                    onChange={(e) => setPropToAdd(Number(e.target.value))}
                  >
                    <option value={0}>-- اختر خاصية من القائمة --</option>
                    {allProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} ({p.vocabularyPrefix}:{p.localName})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddProperty}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 transition"
                  >
                    <Plus size={18} /> إضافة
                  </button>
                </div>
              </div>

              {/* جدول ترتيب وتعديل الخصائص */}
              <div className="p-5 grow">
                {editableProperties.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">
                    القالب فارغ، يرجى إضافة خصائص.
                  </p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="p-3 w-16 text-center">الترتيب</th>
                          <th className="p-3">اسم الخاصية</th>
                          <th className="p-3 text-center">إلزامي؟</th>
                          <th className="p-3 text-center w-32">تحريك</th>
                          <th className="p-3 text-center w-16">إزالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editableProperties.map((prop, idx) => (
                          <tr
                            key={prop.propertyId}
                            className="border-t hover:bg-gray-50 transition bg-white"
                          >
                            <td className="p-3 text-center font-bold text-gray-400">
                              {prop.displayOrder}
                            </td>
                            <td className="p-3 font-semibold text-primary text-base">
                              {prop.propertyLabel}
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={prop.isRequired}
                                onChange={() => toggleRequired(idx)}
                                className="w-4 h-4 text-primary cursor-pointer accent-primary"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => moveUp(idx)}
                                  disabled={idx === 0}
                                  className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                  title="تحريك للأعلى"
                                >
                                  <ArrowUp
                                    size={16}
                                    className="text-gray-700"
                                  />
                                </button>
                                <button
                                  onClick={() => moveDown(idx)}
                                  disabled={
                                    idx === editableProperties.length - 1
                                  }
                                  className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                  title="تحريك للأسفل"
                                >
                                  <ArrowDown
                                    size={16}
                                    className="text-gray-700"
                                  />
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleRemoveProperty(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
