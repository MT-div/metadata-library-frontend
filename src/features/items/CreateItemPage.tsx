import { useEffect, useState } from "react";
import type {
  ResourceTemplateResponse,
  CreateItemCommand,
} from "../../types/metadata";
import { Save, Loader2, FileText } from "lucide-react";

export const CreateItemPage = () => {
  // 1. حالات القوالب
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. حالة الفورم الديناميكي
  const [formData, setFormData] = useState<Record<number, string>>({});

  // 3. جلب جميع القوالب عند فتح الصفحة
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // 4. دالة مسح الحقول عند تغيير القالب
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTemplateId(val === "" ? "" : Number(val));
    setFormData({}); // تفريغ البيانات القديمة عند تغيير القالب
  };

  const handleInputChange = (propertyId: number, value: string) => {
    setFormData((prev) => ({ ...prev, [propertyId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      alert("الرجاء اختيار قالب أولاً!");
      return;
    }

    setIsSubmitting(true);

    const command: CreateItemCommand = {
      templateId: Number(selectedTemplateId),
      ownerId: 1,
      values: Object.entries(formData).map(([propId, valueText]) => ({
        propertyId: Number(propId),
        valueText: valueText,
        type: "literal",
        language: "ar",
      })),
    };

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (response.ok) {
        setFormData({});
        alert("تم حفظ العنصر بنجاح!");
        console.log("🚀 Command Sent:", command);
      }
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // إيجاد القالب المحدد لرسم حقوله
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white shadow-sm border rounded-xl p-6 md:p-8">
        {/* ترويسة الصفحة واختيار القالب */}
        <div className="mb-8 border-b pb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FileText className="text-primary" /> إضافة عنصر جديد للمكتبة
          </h1>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              1. اختر القالب الوصفي (Template):
            </label>
            <select
              className="w-full border rounded-lg p-3 outline-none bg-white focus:border-primary focus:ring-1 focus:ring-primary"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
            >
              <option value="">-- اختر قالباً للبدء --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            {selectedTemplate?.description && (
              <p className="text-sm text-gray-500 mt-2">
                الوصف: {selectedTemplate.description}
              </p>
            )}
          </div>
        </div>

        {/* الفورم الديناميكي (لا يظهر إلا إذا تم اختيار قالب) */}
        {selectedTemplate ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
              2. تعبئة بيانات: {selectedTemplate.label}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {selectedTemplate.properties
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((prop) => (
                  <div key={prop.propertyId} className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      {prop.propertyLabel}
                      {prop.isRequired && (
                        <span className="text-red-500 mr-1">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData[prop.propertyId] || ""}
                      onChange={(e) =>
                        handleInputChange(prop.propertyId, e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                      placeholder={`أدخل ${prop.propertyLabel}...`}
                      required={prop.isRequired}
                    />
                  </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormData({})}
                className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-50 font-medium"
              >
                تفريغ الحقول
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-blue-700 flex items-center gap-2 font-medium transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                {isSubmitting ? "جاري الحفظ..." : "حفظ العنصر"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-10 text-gray-400 font-medium">
            يرجى اختيار قالب من القائمة أعلاه لإظهار حقول الإدخال.
          </div>
        )}
      </div>
    </div>
  );
};
