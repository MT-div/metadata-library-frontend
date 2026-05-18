// src/features/items/CreateItemPage.tsx
import { useEffect, useState } from "react";
import type { ResourceTemplateResponse } from "../../types/metadata";
import { Save, Loader2 } from "lucide-react";

export const CreateItemPage = () => {
  // حالات المكون (State)
  const [template, setTemplate] = useState<ResourceTemplateResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // جلب القالب بمجرد تحميل الصفحة (سنستخدم القالب رقم 1 كمثال)
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
        {/* ترويسة النموذج */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            إضافة عنصر جديد: {template.label}
          </h1>
          {template.description && (
            <p className="text-gray-500 mt-2">{template.description}</p>
          )}
        </div>

        {/* النموذج الديناميكي */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 
              هنا السحر الحقيقي! 
              نقوم بترتيب الخصائص حسب displayOrder 
              ثم نقوم برسم حقل إدخال لكل خاصية موجودة في القالب
            */}
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
                    className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    placeholder={`أدخل ${prop.propertyLabel}...`}
                    required={prop.isRequired}
                  />
                </div>
              ))}
          </div>

          {/* أزرار الحفظ */}
          <div className="mt-8 pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-50 font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-blue-700 flex items-center gap-2 font-medium transition"
            >
              <Save size={20} />
              حفظ العنصر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
