import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Book,
  Tags,
  Plus,
  Edit,
  Trash2,
  Settings,
  ExternalLink,
} from "lucide-react";
import type {
  VocabularyResponse,
  PropertyResponse,
} from "../../types/metadata";

export const ManageMetadataPage = () => {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [selectedVocabId, setSelectedVocabId] = useState<number>(0);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب القواميس عند التحميل
  useEffect(() => {
    fetch("/api/vocabularies")
      .then((res) => res.json())
      .then((data) => {
        setVocabularies(data);
        if (data.length > 0) setSelectedVocabId(data[0].id);
        setLoading(false);
      });
  }, []);

  // 2. جلب الخصائص عند تغيير القاموس
  useEffect(() => {
    if (selectedVocabId === 0) return;

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/vocabularies/${selectedVocabId}/properties`
        );
        const data = await res.json();
        setProperties(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [selectedVocabId]);

  const selectedVocab = vocabularies.find((v) => v.id === selectedVocabId);

  // دالة مؤقتة لمحاكاة الأزرار التي ليس لها منطق بعد
  const handleNotImplemented = (action: string) => {
    alert(`سيتم برمجة وظيفة "${action}" لاحقاً عند الربط مع الباك اند!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* 1. ترويسة إدارة الميتاداتا والأزرار العلوية */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="text-primary" size={32} /> إدارة القواميس
            والخصائص
          </h1>
          <p className="text-gray-500 mt-2">
            إدارة المخطط الوصفي (Metadata Schema) الخاص بالمكتبة.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/vocabularies/new")}
            className="bg-white border-2 border-primary text-primary px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-50 transition"
          >
            <Plus size={18} /> قاموس جديد
          </button>
          <button
            onClick={() => navigate("/properties/new")}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 transition"
          >
            <Plus size={18} /> خاصية جديدة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. اللوحة الجانبية لاختيار القاموس (Master View) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4">
              <Book className="text-primary" size={20} /> القواميس
            </h2>
            <div className="flex flex-col gap-2">
              {vocabularies.map((vocab) => (
                <button
                  key={vocab.id}
                  onClick={() => setSelectedVocabId(vocab.id)}
                  className={`text-right px-4 py-3 rounded-lg border transition ${
                    selectedVocabId === vocab.id
                      ? "bg-blue-50 border-primary text-primary font-bold"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{vocab.label}</span>
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
                      {vocab.prefix}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* معلومات القاموس المحدد */}
            {selectedVocab && (
              <div className="mt-6 pt-4 border-t text-sm text-gray-600 space-y-2">
                <p>
                  <strong>الرابط العالمي:</strong>
                </p>
                <a
                  href={selectedVocab.namespaceUri}
                  target="_blank"
                  className="text-blue-500 hover:underline flex items-center gap-1 font-mono break-all"
                  dir="ltr"
                >
                  <ExternalLink size={14} /> {selectedVocab.namespaceUri}
                </a>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleNotImplemented("تعديل القاموس")}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleNotImplemented("حذف القاموس")}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. منطقة عرض الخصائص (Detail View) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 border-b p-5 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Tags className="text-primary" size={20} />
                خصائص القاموس المحدد ({properties.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500 animate-pulse">
                جاري تحميل الخصائص...
              </div>
            ) : properties.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                لا توجد خصائص في هذا القاموس. أضف خاصية جديدة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-4 font-semibold w-16">ID</th>
                      <th className="p-4 font-semibold">
                        الاسم المعروض (Label)
                      </th>
                      <th className="p-4 font-semibold">الاسم البرمجي</th>
                      <th className="p-4 font-semibold">URI</th>
                      <th className="p-4 font-semibold text-center w-24">
                        إجراء
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr
                        key={prop.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-4 text-gray-500 font-mono">
                          #{prop.id}
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          {prop.label}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded text-gray-800">
                            {prop.vocabularyPrefix}:{prop.localName}
                          </span>
                        </td>
                        <td className="p-4">
                          <a
                            href={prop.termUri}
                            target="_blank"
                            className="text-blue-500 hover:underline flex items-center gap-1 font-mono text-xs"
                            dir="ltr"
                          >
                            <ExternalLink size={12} /> {prop.termUri}
                          </a>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                handleNotImplemented("تعديل الخاصية")
                              }
                              className="text-blue-500 hover:text-blue-700 p-1"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleNotImplemented("حذف الخاصية")
                              }
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
