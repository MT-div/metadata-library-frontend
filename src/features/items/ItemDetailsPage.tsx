import { useState, useEffect } from "react";
//import { useParams, useNavigate, Link } from 'react-router-dom';
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Edit,
  FilePlus,
  Trash2,
  Tag,
  Folder,
  Image as ImageIcon,
  Book,
  FileText,
} from "lucide-react";
import type {
  ItemResponse,
  ResourceTemplateResponse,
  ItemSetResponse,
  MediaResponse,
} from "../../types/metadata";

export const ItemDetailsPage = () => {
  const { id } = useParams(); // استخراج الـ ID من الرابط
  const navigate = useNavigate();

  const [item, setItem] = useState<ItemResponse | null>(null);
  const [template, setTemplate] = useState<ResourceTemplateResponse | null>(
    null
  );
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [media, setMedia] = useState<MediaResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemRes = await fetch(`/api/items/${id}`);
        if (!itemRes.ok) throw new Error("Element not found");
        const itemData: ItemResponse = await itemRes.json();
        setItem(itemData);

        // جلب باقي البيانات بالتوازي
        //ملاحظة من عرابي : هون لازم كمان نجيب بس ال templete itemsets للعنصر مو جيب الكل بعديل فلتر
        const [templatesRes, setsRes, mediaRes] = await Promise.all([
          fetch("/api/templates"),
          fetch("/api/itemsets"),
          fetch(`/api/media?itemId=${id}`),
        ]);

        const templatesData =
          (await templatesRes.json()) as ResourceTemplateResponse[];
        setTemplate(
          templatesData.find((t) => t.id === itemData.templateId) || null
        );

        const setsData = (await setsRes.json()) as ItemSetResponse[];
        // تصفية المجموعات التي تحتوي على هذا العنصر
        setItemSets(
          setsData.filter((s) => s.items?.some((i) => i.id === itemData.id))
        );

        setMedia((await mediaRes.json()) as MediaResponse[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-20 text-primary animate-pulse">
        جاري تحميل البيانات...
      </div>
    );
  if (!item)
    return (
      <div className="text-center py-20 text-red-500 font-bold text-xl">
        العنصر غير موجود!
      </div>
    );

  // 1. استخراج العنوان والمؤلف
  const titleProps = ["عنوان", "Title"];
  const authorProps = ["مؤلف", "كاتب", "Author"];

  const title =
    item.metadataValues.find((v) =>
      titleProps.some((t) => v.propertyLabel.includes(t))
    )?.valueText || `عنصر بدون عنوان #${item.id}`;
  const author = item.metadataValues.find((v) =>
    authorProps.some((a) => v.propertyLabel.includes(a))
  )?.valueText;

  // 2. تصفية باقي الخصائص (استبعاد العنوان والمؤلف) وترتيبها حسب displayOrder من القالب
  const sortedMetadata = item.metadataValues
    .filter(
      (v) =>
        !titleProps.includes(v.propertyLabel) &&
        !authorProps.includes(v.propertyLabel)
    )
    .map((v) => {
      // البحث عن ترتيب هذه الخاصية داخل القالب
      const propDef = template?.properties?.find(
        (p) => p.propertyId === v.propertyId
      );
      return { ...v, displayOrder: propDef?.displayOrder ?? 999 };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // 3. دوال الانتقال الذكي (Clickable Badges)
  const handleFilterClick = (
    type: "template" | "itemSet",
    filterId: string
  ) => {
    // ننتقل لصفحة الاستعراض ونمرر الفلتر كـ State
    navigate("/browse", { state: { [type]: filterId } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* الأزرار العلوية */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-primary flex items-center gap-2 font-medium transition"
        >
          <ArrowRight size={20} /> عودة للقائمة
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-2 font-medium transition">
            <Edit size={18} /> تعديل
          </button>
          <button className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 font-medium transition">
            <Trash2 size={18} /> حذف
          </button>
        </div>
      </div>

      {/* منطقة الترويسة (Hero) */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
        <div className="flex items-start gap-6">
          <div className="bg-blue-50 p-6 rounded-2xl text-primary shrink-0">
            {template?.label.includes("صورة") ? (
              <ImageIcon size={48} />
            ) : (
              <Book size={48} />
            )}
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-mono border">
                ID: {item.id}
              </span>
              {template && (
                <button
                  onClick={() =>
                    handleFilterClick("template", template.id.toString())
                  }
                  className="bg-blue-50 text-primary border border-blue-200 px-3 py-1 rounded-full text-sm font-semibold hover:bg-blue-100 hover:shadow-sm transition flex items-center gap-1 cursor-pointer"
                >
                  <Tag size={14} /> {template.label}
                </button>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
              {title}
            </h1>
            {author && (
              <p className="text-lg text-gray-600 font-medium">
                بواسطة: {author}
              </p>
            )}
            {item.ownerName && (
              <p className="text-sm text-gray-400 mt-4">
                تم الإضافة بواسطة: {item.ownerName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* العمود الأيمن: البيانات الوصفية المرتبة */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 border-b p-4 px-6">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <FileText className="text-primary" size={20} /> البيانات الوصفية
                (Metadata)
              </h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {sortedMetadata.length > 0 ? (
                  sortedMetadata.map((val, idx) => (
                    <div key={idx} className="border-b border-dashed pb-3">
                      <dt className="text-sm font-semibold text-gray-500 mb-1">
                        {val.propertyLabel}
                      </dt>
                      <dd className="text-base text-gray-900 font-medium">
                        {val.valueText || "-"}
                      </dd>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    لا توجد تفاصيل إضافية لهذا العنصر.
                  </p>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* العمود الأيسر: الميديا والمجموعات */}
        <div className="space-y-8">
          {/* قسم المجموعات */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 border-b p-4 px-6">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Folder className="text-primary" size={20} /> المجموعات
                (Collections)
              </h2>
            </div>
            <div className="p-6">
              {itemSets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {itemSets.map((set) => (
                    <button
                      key={set.id}
                      onClick={() =>
                        handleFilterClick("itemSet", set.id.toString())
                      }
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition border flex items-center gap-2 cursor-pointer"
                    >
                      <Folder size={14} className="text-gray-500" /> {set.title}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  العنصر لا ينتمي لأي مجموعة.
                </p>
              )}
            </div>
          </div>

          {/* قسم الملفات */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 border-b p-4 px-6 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <ImageIcon className="text-primary" size={20} /> الوسائط المرفقة
              </h2>
              <button className="text-primary hover:text-blue-700 p-1">
                <FilePlus size={20} />
              </button>
            </div>
            <div className="p-6">
              {media.length > 0 ? (
                <div className="space-y-3">
                  {media.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="bg-blue-100 text-primary p-2 rounded-lg">
                        <FileText size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {m.fileName}
                        </p>
                        <p className="text-xs text-gray-500 font-mono truncate">
                          {m.storagePath}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد ملفات مرفقة.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
