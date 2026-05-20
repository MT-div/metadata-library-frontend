import { useState, useEffect } from "react";
import type {
  CreateResourceTemplateCommand,
  TemplatePropertyRequest,
  VocabularyResponse,
} from "../../types/metadata";
import { Save, LayoutTemplate, Plus, Trash2 } from "lucide-react";

type AvailableProperty = {
  id: number;
  label: string;
  vocabularyPrefix: string;
  localName: string;
};

export const CreateTemplatePage = () => {
  const [templateData, setTemplateData] =
    useState<CreateResourceTemplateCommand>({ label: "", description: "" });
  const [selectedProperties, setSelectedProperties] = useState<
    TemplatePropertyRequest[]
  >([]);

  // --- الحالات الجديدة لدعم القوائم المترابطة (Cascading Dropdowns) ---
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [selectedVocabId, setSelectedVocabId] = useState<number>(0);

  const [availableProps, setAvailableProps] = useState<AvailableProperty[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<number>(0);

  // 1. جلب القواميس عند تحميل الصفحة
  useEffect(() => {
    fetch("/api/vocabularies")
      .then((res) => res.json())
      .then((data) => {
        setVocabularies(data);
        if (data.length > 0) setSelectedVocabId(data[0].id);
      });
  }, []);

  // 2. جلب الخصائص "فقط" عندما يتغير القاموس المختار (تطبيق ملاحظتك!)
  useEffect(() => {
    if (selectedVocabId === 0) return;

    fetch(`/api/vocabularies/${selectedVocabId}/properties`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableProps(data);
        if (data.length > 0) {
          setSelectedPropId(data[0].id);
        } else {
          setSelectedPropId(0); // إذا كان القاموس فارغاً
        }
      });
  }, [selectedVocabId]);

  // إضافة خاصية للقالب (محلياً في الـ UI)
  const handleAddProperty = () => {
    if (selectedPropId === 0) return;

    // منع تكرار نفس الخاصية
    if (selectedProperties.some((p) => p.propertyId === selectedPropId)) {
      alert("هذه الخاصية مضافة مسبقاً!");
      return;
    }

    const newProp: TemplatePropertyRequest = {
      propertyId: selectedPropId,
      isRequired: false,
      displayOrder: selectedProperties.length + 1, // الترتيب التلقائي
      alternateLabel: "",
    };

    setSelectedProperties([...selectedProperties, newProp]);
  };

  // إزالة خاصية من القالب
  const handleRemoveProperty = (propId: number) => {
    setSelectedProperties(
      selectedProperties.filter((p) => p.propertyId !== propId)
    );
  };

  // تغيير حالة (مطلوب/غير مطلوب) لخاصية معينة
  const handleToggleRequired = (propId: number) => {
    setSelectedProperties(
      selectedProperties.map((p) =>
        p.propertyId === propId ? { ...p, isRequired: !p.isRequired } : p
      )
    );
  };

  // عملية الحفظ (التي ستعكس الباك اند الخاص بك بخطوتين)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // الدفاع الأمامي (Frontend Validation) يحاكي الـ FluentValidation الخاص بك
    if (selectedProperties.length === 0) {
      alert("الـ Validator يقول: يجب إضافة خاصية واحدة على الأقل للقالب!");
      return;
    }

    try {
      // الخطوة الأولى: إنشاء القالب
      const createRes = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      const createdData = await createRes.json();
      const newTemplateId = createdData.id;

      // الخطوة الثانية: ربط الخصائص بالقالب الجديد
      const updateCommand = {
        templateId: newTemplateId,
        properties: selectedProperties,
      };

      await fetch(`/api/templates/${newTemplateId}/properties`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateCommand),
      });

      alert("تم بناء القالب وربط الخصائص بنجاح! راجع الـ Console.");
      // إعادة تعيين النموذج
      setTemplateData({ label: "", description: "" });
      setSelectedProperties([]);
    } catch (error) {
      console.error("حدث خطأ:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white shadow-sm border rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
          <LayoutTemplate className="text-primary" /> بناء قالب جديد
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* قسم بيانات القالب الأساسية */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              1. المعلومات الأساسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  اسم القالب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={templateData.label}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, label: e.target.value })
                  }
                  className="w-full border rounded-lg p-2.5 outline-none focus:border-primary"
                  placeholder="مثال: كتاب مطبوع"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  الوصف
                </label>
                <input
                  type="text"
                  value={templateData.description || ""}
                  onChange={(e) =>
                    setTemplateData({
                      ...templateData,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2.5 outline-none focus:border-primary"
                  placeholder="وصف اختياري..."
                />
              </div>
            </div>
          </div>

          {/* قسم الخصائص الديناميكية */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-lg font-semibold text-gray-800">
              2. حقول القالب (الخصائص)
            </h2>
            {/* أداة إضافة خاصية (بعد التحديث) */}
            <div className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-lg border">
              <div className="grow w-full md:w-auto">
                <label className="block text-sm font-semibold mb-1">
                  1. اختر القاموس:
                </label>
                <select
                  className="w-full border rounded-lg p-2.5 bg-white outline-none"
                  value={selectedVocabId}
                  onChange={(e) => setSelectedVocabId(Number(e.target.value))}
                >
                  {vocabularies.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} ({v.prefix})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grow w-full md:w-auto">
                <label className="block text-sm font-semibold mb-1">
                  2. اختر الخاصية:
                </label>
                <select
                  className="w-full border rounded-lg p-2.5 bg-white outline-none disabled:bg-gray-200"
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(Number(e.target.value))}
                  disabled={availableProps.length === 0}
                >
                  {availableProps.length === 0 ? (
                    <option>لا يوجد خصائص في هذا القاموس</option>
                  ) : (
                    availableProps.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} ({p.vocabularyPrefix}:{p.localName})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddProperty}
                disabled={selectedPropId === 0}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-1 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} /> إضافة
              </button>
            </div>

            {/* عرض الخصائص المضافة */}
            {selectedProperties.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-3">الترتيب</th>
                      <th className="p-3">اسم الخاصية</th>
                      <th className="p-3 text-center">إلزامي؟ (Required)</th>
                      <th className="p-3 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProperties.map((prop, index) => {
                      const propDetails = availableProps.find(
                        (p) => p.id === prop.propertyId
                      );
                      return (
                        <tr
                          key={prop.propertyId}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="p-3 font-mono">{index + 1}</td>
                          <td className="p-3 font-semibold text-primary">
                            {propDetails?.label}
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={prop.isRequired}
                              onChange={() =>
                                handleToggleRequired(prop.propertyId)
                              }
                              className="w-4 h-4 text-primary cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveProperty(prop.propertyId)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                لم يتم إضافة أي خصائص بعد.
              </p>
            )}
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-blue-700 flex items-center gap-2 font-medium"
            >
              <Save size={20} /> حفظ القالب بالكامل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
