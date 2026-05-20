import { useState, useRef, useEffect } from "react";
import type {
  CreateMediaCommand,
  CreateValueRequest,
} from "../../types/metadata";
import { UploadCloud, Save, Plus, Trash2, File } from "lucide-react";

interface PropertyOption {
  id: number;
  label: string;
}

export const CreateMediaPage = () => {
  // حالة الملف الفعلي المختار من الجهاز
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // حالة الـ ID الخاص بالعنصر الأب (الكتاب/المخطوطة)
  const [itemId, setItemId] = useState<number>(0);

  // حالة القيم الوصفية المرتبطة بالملف
  const [mediaValues, setMediaValues] = useState<CreateValueRequest[]>([]);

  // لجلب الخصائص المتاحة لوصف الملف
  const [availableProps, setAvailableProps] = useState<PropertyOption[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // جلب الخصائص لكي نختار منها لوصف الملف
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setAvailableProps(data);
        if (data.length > 0) setSelectedPropId(data[0].id);
      });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddValue = () => {
    if (selectedPropId === 0) return;
    const newReq: CreateValueRequest = {
      propertyId: selectedPropId,
      valueText: "",
      type: "literal",
      language: "ar",
    };
    setMediaValues([...mediaValues, newReq]);
  };

  const handleUpdateValueText = (index: number, text: string) => {
    const updated = [...mediaValues];
    updated[index].valueText = text;
    setMediaValues(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("الرجاء اختيار ملف أولاً!");
      return;
    }
    if (itemId <= 0) {
      alert("الرجاء إدخال رقم العنصر (Item ID) المرتبط بهذا الملف.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ==========================================
      // الخطوة 1: رفع الملف الفعلي (Binary Upload)
      // ==========================================
      const formData = new FormData();
      formData.append("file", selectedFile); // نفس اسم البارامتر (file) في الـ C# IFormFile

      const uploadResponse = await fetch("/api/files/upload", {
        method: "POST",
        // 💡 معلومة Senior: لا تقم أبداً بكتابة Content-Type مع الـ FormData
        // المتصفح سيقوم بوضعها تلقائياً مع الـ Boundary الخاص بالملف
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("فشل رفع الملف إلى الخادم");
      }

      // قراءة الرد القادم من الـ FilesController الخاص بك
      const uploadData = await uploadResponse.json();

      // ==========================================
      // الخطوة 2: ربط المسار بالميتاداتا وإرسال הـ Command
      // ==========================================
      const command: CreateMediaCommand = {
        itemId: itemId,
        storagePath: uploadData.storagePath, // المسار الذي استلمناه من السيرفر
        fileName: selectedFile.name, // الاسم الأصلي للملف
        values: mediaValues,
      };

      const mediaResponse = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (mediaResponse.ok) {
        alert("تم رفع الملف وربط الميتاداتا بنجاح!");
        setSelectedFile(null);
        setItemId(0);
        setMediaValues([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ أثناء العملية، راجع الـ Console");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white shadow-sm border rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 border-b pb-4 text-gray-900">
          <UploadCloud className="text-primary" size={28} /> رفع الوسائط
          والملفات
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* قسم ربط الملف بالعنصر */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">
                رقم العنصر (Item ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={itemId || ""}
                onChange={(e) => setItemId(Number(e.target.value))}
                className="w-full border rounded-lg p-3 outline-none focus:border-primary"
                placeholder="مثال: 101"
              />
              <p className="text-xs text-gray-500 mt-1">
                يجب أن يكون الملف تابعاً لعنصر (كتاب/مخطوطة) موجود مسبقاً.
              </p>
            </div>
          </div>

          {/* قسم رفع الملف الفعلي */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="bg-blue-50 p-4 rounded-full text-primary">
                {selectedFile ? <File size={32} /> : <UploadCloud size={32} />}
              </div>
              <span className="font-semibold text-gray-700">
                {selectedFile ? selectedFile.name : "اضغط لاختيار ملف من جهازك"}
              </span>
              <span className="text-sm text-gray-500">
                {selectedFile
                  ? `حجم الملف: ${(selectedFile.size / 1024 / 1024).toFixed(
                      2
                    )} MB`
                  : "PDF, JPG, PNG, MP4"}
              </span>
            </label>
          </div>

          {/* قسم الميتاداتا الخاصة بالملف (اختياري) */}
          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              البيانات الوصفية للملف (اختياري)
            </h2>

            <div className="flex gap-2 items-end bg-gray-50 p-4 rounded-lg border mb-4">
              <div className="flex-grow">
                <label className="block text-sm font-semibold mb-1">
                  إضافة خاصية لوصف الملف:
                </label>
                <select
                  className="w-full border rounded-lg p-2.5 bg-white outline-none"
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(Number(e.target.value))}
                >
                  {availableProps.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddValue}
                className="bg-gray-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-1 hover:bg-gray-900"
              >
                <Plus size={18} /> إضافة حقل
              </button>
            </div>

            {mediaValues.map((val, index) => {
              const propDetails = availableProps.find(
                (p) => p.id === val.propertyId
              );
              return (
                <div key={index} className="flex items-center gap-3 mb-3">
                  <label className="w-1/4 text-sm font-semibold text-gray-700">
                    {propDetails?.label}
                  </label>
                  <input
                    type="text"
                    required
                    value={val.valueText || ""}
                    onChange={(e) =>
                      handleUpdateValueText(index, e.target.value)
                    }
                    className="flex-grow border rounded-lg p-2 outline-none focus:border-primary"
                    placeholder="أدخل القيمة..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setMediaValues(mediaValues.filter((_, i) => i !== index))
                    }
                    className="text-red-500 p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* أزرار الحفظ */}
          <div className="pt-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-blue-700 flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <Save size={20} />{" "}
              {isSubmitting ? "جاري الرفع..." : "رفع وحفظ البيانات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
