import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  FolderOpen,
  Globe,
  Lock,
  ChevronLeft,
  Plus,
} from "lucide-react";
import type { ItemSetResponse } from "../../types/metadata";

export const BrowseItemSetsPage = () => {
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/itemsets")
      .then((res) => res.json())
      .then((data) => {
        setItemSets(data);
        setLoading(false);
      });
  }, []);

  // دالة الانتقال إلى صفحة الاستعراض مع تفعيل الفلتر الذكي
  const handleOpenSet = (setId: number) => {
    navigate("/browse", { state: { itemSet: setId.toString() } });
  };

  if (loading)
    return (
      <div className="text-center py-20 text-primary animate-pulse">
        جاري تحميل المجموعات...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* ترويسة الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FolderOpen className="text-primary" size={32} /> المجموعات
            والتصنيفات (Collections)
          </h1>
          <p className="text-gray-500 mt-2">
            استعرض {itemSets.length} مجموعة تنظيمية في المكتبة.
          </p>
        </div>
        <button
          onClick={() => navigate("/itemsets/new")}
          className="bg-primary text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 transition"
        >
          <Plus size={20} /> إنشاء مجموعة جديدة
        </button>
      </div>

      {/* عرض المجموعات كبطاقات (Grid) */}
      {itemSets.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
          <Folder className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">لا توجد مجموعات حتى الآن.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {itemSets.map((set) => (
            <div
              key={set.id}
              className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col group cursor-pointer"
              onClick={() => handleOpenSet(set.id)}
            >
              {/* رأس البطاقة */}
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <Folder size={28} />
                </div>
                {set.isPublic ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                    <Globe size={14} /> عامة
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                    <Lock size={14} /> خاصة
                  </span>
                )}
              </div>

              {/* محتوى البطاقة */}
              <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">
                {set.title}
              </h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2 grow">
                {set.description || "لا يوجد وصف لهذه المجموعة."}
              </p>

              {/* ذيل البطاقة (إحصائيات وزر الدخول) */}
              <div className="pt-4 border-t flex justify-between items-center mt-auto">
                <div className="text-sm font-semibold text-gray-600">
                  <span className="text-primary font-bold">
                    {set.items?.length || 0}
                  </span>{" "}
                  عناصر
                </div>
                <div className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  تصفح المحتوى <ChevronLeft size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
