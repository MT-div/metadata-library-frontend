import { useState, useEffect } from "react";
import {
  Search,
  Grid,
  List as ListIcon,
  Book,
  Image as ImageIcon,
  FileText,
  ChevronLeft,
  Filter,
} from "lucide-react";
import type {
  ItemResponse,
  ResourceTemplateResponse,
  ItemSetResponse,
} from "../../types/metadata";

export const BrowseItemsPage = () => {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);

  // حالات الفلترة والبحث
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("all");
  const [selectedItemSetId, setSelectedItemSetId] = useState<string>("all");

  // حالة طريقة العرض
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // جلب البيانات الثلاثة بالتوازي (Performance Optimization)
    Promise.all([
      fetch("/api/items").then((res) => res.json()),
      fetch("/api/templates").then((res) => res.json()),
      fetch("/api/itemsets").then((res) => res.json()),
    ]).then(([itemsData, templatesData, itemSetsData]) => {
      setItems(itemsData);
      setTemplates(templatesData);
      setItemSets(itemSetsData);
    });
  }, []);

  // دالة الخوارزمية الذكية لاستخراج العنوان أو المؤلف من الميتاداتا
  const extractValue = (item: ItemResponse, possibleLabels: string[]) => {
    const found = item.metadataValues.find((v) =>
      possibleLabels.some((label) => v.propertyLabel.includes(label))
    );
    return found?.valueText || null;
  };
  //ملاحظة من عرابي : بدنا نبدلها بالغلاف ، بس لسه ما حددنا كيف رح نعمل الغلاف الافتراضي لكل نوع (كتاب، مخطوطة، صورة، خريطة...) فخليتها مؤقتاً ترجع null لو ما في عنوان.
  // دالة لاختيار الأيقونة المناسبة حسب اسم القالب
  const getIconForTemplate = (templateId: number | null) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return <FileText className="text-gray-400" size={24} />;
    if (tpl.label.includes("صورة") || tpl.label.includes("خريطة"))
      return <ImageIcon className="text-purple-500" size={24} />;
    return <Book className="text-primary" size={24} />;
  };

  // تطبيق الفلاتر والبحث
  const filteredItems = items.filter((item) => {
    // 1. فلتر البحث النصي (يبحث داخل كل قيم الميتاداتا)
    const matchesSearch = item.metadataValues.some((v) =>
      v.valueText?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. فلتر القالب
    const matchesTemplate =
      selectedTemplateId === "all" ||
      item.templateId?.toString() === selectedTemplateId;

    // 3. فلتر المجموعة (Item Set) - حسب اقتراحك الذكي!
    let matchesItemSet = true;
    if (selectedItemSetId !== "all") {
      const selectedSet = itemSets.find(
        (s) => s.id.toString() === selectedItemSetId
      );
      // نتحقق إذا كان الـ ID الخاص بالعنصر موجود ضمن قائمة عناصر هذه المجموعة
      matchesItemSet =
        selectedSet?.items?.some((i) => i.id === item.id) || false;
    }

    return matchesSearch && matchesTemplate && matchesItemSet;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">استعراض العناصر</h1>
          <p className="text-gray-500 mt-1">
            تصفح {filteredItems.length} عنصر متوفر في المكتبة
          </p>
        </div>
      </div>

      {/* شريط البحث والفلاتر (Search & Filters Bar) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-3/4">
          {/* مربع البحث */}
          <div className="relative flex-grow">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="ابحث في العناوين، المؤلفين، الكلمات المفتاحية..."
              className="w-full pl-4 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* فلتر القوالب */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter size={18} className="text-gray-500" />
            <select
              className="w-full border rounded-lg py-2.5 px-3 outline-none bg-white"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              <option value="all">جميع القوالب</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* فلتر المجموعات (Item Sets) */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <select
              className="w-full border rounded-lg py-2.5 px-3 outline-none bg-white"
              value={selectedItemSetId}
              onChange={(e) => setSelectedItemSetId(e.target.value)}
            >
              <option value="all">جميع المجموعات</option>
              {itemSets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* أزرار التبديل بين الشبكة والجدول */}
        <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition ${
              viewMode === "list"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {/* منطقة عرض البيانات */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700">لا توجد نتائج</h3>
          <p className="text-gray-500 mt-2">
            حاول تغيير كلمات البحث أو الفلاتر المستخدمة.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        // =======================
        // 1. وضع البطاقات (Grid)
        // =======================
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const title =
              extractValue(item, ["عنوان", "Title"]) ||
              `عنصر بدون عنوان #${item.id}`;
            const author = extractValue(item, ["مؤلف", "كاتب", "Author"]);
            const template = templates.find((t) => t.id === item.templateId);

            return (
              <div
                key={item.id}
                className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <div className="h-32 bg-gray-50 flex items-center justify-center border-b group-hover:bg-blue-50 transition">
                  {getIconForTemplate(item.templateId)}
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-1 rounded w-fit mb-3">
                    {template?.label || "قالب غير معروف"}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2">
                    {title}
                  </h3>
                  {author && (
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      بواسطة: {author}
                    </p>
                  )}

                  <button className="mt-auto pt-4 border-t w-full text-left text-sm font-semibold text-gray-500 hover:text-primary flex items-center justify-between transition">
                    عرض التفاصيل <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // =======================
        // 2. وضع الجدول (List)
        // =======================
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="p-4 font-semibold w-16">ID</th>
                <th className="p-4 font-semibold">العنوان</th>
                <th className="p-4 font-semibold">المؤلف/المنشئ</th>
                <th className="p-4 font-semibold">القالب</th>
                <th className="p-4 font-semibold text-center">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const title =
                  extractValue(item, ["عنوان", "Title"]) ||
                  `عنصر بدون عنوان #${item.id}`;
                const author =
                  extractValue(item, ["مؤلف", "كاتب", "Author"]) || "-";
                const template = templates.find(
                  (t) => t.id === item.templateId
                );

                return (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 text-gray-500 font-mono">#{item.id}</td>
                    <td className="p-4 font-bold text-gray-900">{title}</td>
                    <td className="p-4 text-gray-600">{author}</td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-1 rounded">
                        {template?.label || "غير معروف"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-primary hover:underline text-sm font-semibold">
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
