// src/features/items/CreateItemPage.tsx
import { useEffect, useState } from "react";
import type {
  ResourceTemplateResponse,
  CreateItemCommand,
} from "../../types/metadata";
import { Save, Loader2 } from "lucide-react";

export const CreateItemPage = () => {
  const [template, setTemplate] = useState<ResourceTemplateResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. هنا السحر: State ديناميكي يحفظ البيانات بناءً على الـ propertyId
  // شكل البيانات سيكون هكذا مثلاً: { 101: "كتاب البداية", 102: "ابن كثير" }
  const [formData, setFormData] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch("/api/templates/1");
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, []);

  // 2. دالة لتحديث الـ State عند الكتابة في أي حقل
  const handleInputChange = (propertyId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [propertyId]: value,
    }));
  };

  // 3. دالة الإرسال (تغليف البيانات لتطابق الـ C# Command)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setIsSubmitting(true);

    // تحويل الـ formData (القاموس) إلى مصفوفة تطابق CreateItemCommand
    const command: CreateItemCommand = {
      templateId: template.id,
      ownerId: 1, // مؤقتاً نفترض أن الـ ID للمستخدم الحالي هو 1
      values: Object.entries(formData).map(([propId, valueText]) => ({
        propertyId: Number(propId),
        valueText: valueText,
        valueUri: null,
        valueResourceId: null,
        type: "literal", // كما هو محدد في C# كنص عادي
        language: "ar", // اللغة الافتراضية
      })),
    };

    try {
      // إرسال الطلب (والذي سيلتقطه الجاسوس MSW)
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (response.ok) {
        // تنظيف الحقول بعد النجاح
        setFormData({});
        alert("تم إرسال البيانات بنجاح! راجع الـ Console.");

        // طباعة الـ Command في الكونسول لتتأكد أنه يطابق الـ C# 100%
        console.log("🚀 Payload sent to C# Backend (Command):", command);
      }
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (!template)
    return (
      <div className="text-center mt-10 text-red-500">القالب غير موجود!</div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white shadow-sm border rounded-xl p-6 md:p-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            إضافة عنصر جديد: {template.label}
          </h1>
          {template.description && (
            <p className="text-gray-500 mt-2">{template.description}</p>
          )}
        </div>

        {/* 4. ربط الـ Form بدالة handleSubmit */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {template.properties
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
                    // 5. ربط القيمة والحدث بالـ State
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

          <div className="mt-8 pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormData({})} // زر لإلغاء وتفريغ الحقول
              className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-50 font-medium"
            >
              مسح الحقول
            </button>
            <button
              type="submit"
              disabled={isSubmitting} // منع الضغط المزدوج أثناء الإرسال
              className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-blue-700 flex items-center gap-2 font-medium transition disabled:opacity-50"
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
      </div>
    </div>
  );
};
