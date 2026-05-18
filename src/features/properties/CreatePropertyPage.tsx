import { useState, useEffect } from "react";
import type {
  CreatePropertyCommand,
  VocabularyResponse,
} from "../../types/metadata";
import { Save, Tags } from "lucide-react";

export const CreatePropertyPage = () => {
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [formData, setFormData] = useState<CreatePropertyCommand>({
    vocabularyId: 0,
    localName: "",
    label: "",
    termUri: "",
  });

  // جلب القواميس لتعبئة القائمة المنسدلة
  useEffect(() => {
    fetch("/api/vocabularies")
      .then((res) => res.json())
      .then((data) => {
        setVocabularies(data);
        if (data.length > 0)
          setFormData((prev) => ({ ...prev, vocabularyId: data[0].id }));
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      alert("تم الحفظ!");
      setFormData({
        vocabularyId: vocabularies[0]?.id || 0,
        localName: "",
        label: "",
        termUri: "",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white shadow-sm border rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
          <Tags className="text-primary" /> إضافة خاصية جديدة
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              القاموس التابع له
            </label>
            <select
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-white"
              value={formData.vocabularyId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vocabularyId: Number(e.target.value),
                })
              }
            >
              {vocabularies.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} ({v.prefix})
                </option>
              ))}
            </select>
          </div>
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
              placeholder="مثال: العنوان الرئيسي"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              الاسم البرمجي (Local Name)
            </label>
            <input
              type="text"
              required
              value={formData.localName}
              onChange={(e) =>
                setFormData({ ...formData, localName: e.target.value })
              }
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
              placeholder="مثال: title"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              الرابط العالمي (Term URI)
            </label>
            <input
              type="url"
              required
              value={formData.termUri}
              onChange={(e) =>
                setFormData({ ...formData, termUri: e.target.value })
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
              <Save size={20} /> حفظ الخاصية
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
