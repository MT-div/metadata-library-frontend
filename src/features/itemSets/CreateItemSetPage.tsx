import { useState } from "react";
import type { CreateItemSetCommand } from "../../types/metadata";
import { Save, FolderPlus, Info } from "lucide-react";

export const CreateItemSetPage = () => {
  // حالة الفورم (تطابق الـ C# Command تماماً)
  const [formData, setFormData] = useState<CreateItemSetCommand>({
    title: "",
    description: "",
    isPublic: true,
    ownerId: 1, // مؤقتاً نفترض أن المستخدم الحالي رقمه 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/itemsets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("تم إنشاء المجموعة بنجاح! راجع الـ Console.");
        // تفريغ الحقول بعد النجاح
        setFormData({ title: "", description: "", isPublic: true, ownerId: 1 });
      }
    } catch (error) {
      console.error("Error creating Item Set:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white shadow-sm border rounded-xl p-6 md:p-8">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <FolderPlus className="text-primary" size={28} /> إنشاء مجموعة جديدة
            (Item Set)
          </h1>
          <p className="text-gray-500 mt-2 text-sm flex items-center gap-1">
            <Info size={16} /> المجموعات تستخدم لتنظيم العناصر في تصنيفات أو
            حاويات منطقية.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* حقل العنوان */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              عنوان المجموعة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              placeholder="مثال: المخطوطات الأندلسية"
            />
          </div>

          {/* حقل الوصف */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              الوصف
            </label>
            <textarea
              rows={4}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none"
              placeholder="وصف تفصيلي لمحتوى هذه المجموعة..."
            />
          </div>

          {/* حقل الرؤية (IsPublic) */}
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData({ ...formData, isPublic: e.target.checked })
              }
              className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="isPublic"
              className="text-sm font-semibold text-gray-700 cursor-pointer"
            >
              مجموعة عامة (Is Public)
              <span className="block text-xs text-gray-500 font-normal mt-0.5">
                إذا تم تفعيل هذا الخيار، ستكون المجموعة مرئية لجميع زوار
                المكتبة.
              </span>
            </label>
          </div>

          {/* أزرار الحفظ */}
          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-blue-700 flex items-center gap-2 font-medium disabled:opacity-50 transition"
            >
              <Save size={20} />{" "}
              {isSubmitting ? "جاري الحفظ..." : "حفظ المجموعة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
