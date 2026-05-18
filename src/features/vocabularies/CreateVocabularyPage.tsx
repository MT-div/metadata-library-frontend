import { useState } from "react";
import type { CreateVocabularyCommand } from "../../types/metadata";
import { Save, BookOpen } from "lucide-react";

export const CreateVocabularyPage = () => {
  const [formData, setFormData] = useState<CreateVocabularyCommand>({
    prefix: "",
    namespaceUri: "",
    label: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/vocabularies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      alert("تم الحفظ!");
      setFormData({ prefix: "", namespaceUri: "", label: "" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white shadow-sm border rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
          <BookOpen className="text-primary" /> إضافة قاموس جديد
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              الاسم المعروض (Label)
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
              placeholder="مثال: Dublin Core"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              الـ Prefix
            </label>
            <input
              type="text"
              required
              value={formData.prefix}
              onChange={(e) =>
                setFormData({ ...formData, prefix: e.target.value })
              }
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
              placeholder="مثال: dc"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              الرابط العالمي (Namespace URI)
            </label>
            <input
              type="url"
              required
              value={formData.namespaceUri}
              onChange={(e) =>
                setFormData({ ...formData, namespaceUri: e.target.value })
              }
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
              placeholder="http://..."
              dir="ltr"
            />
          </div>
          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={20} /> حفظ القاموس
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
