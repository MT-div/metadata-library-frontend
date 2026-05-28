import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  Plus,
  Trash2,
  Library,
  Globe,
  Lock,
  Link as LinkIcon,
  Search,
} from "lucide-react";
import type { ItemSetResponse, ItemResponse } from "../../types/metadata";

export const ManageItemSetsPage = () => {
  const navigate = useNavigate();
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [allItems, setAllItems] = useState<ItemResponse[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);

  // حالة لاختيار عنصر لإضافته للمجموعة
  const [itemToAdd, setItemToAdd] = useState<number | string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // جلب المجموعات وكل العناصر
    Promise.all([
      fetch("/api/itemsets").then((res) => res.json()),
      fetch("/api/items").then((res) => res.json()),
    ]).then(([setsData, itemsData]) => {
      setItemSets(setsData);
      setAllItems(itemsData);
      if (setsData.length > 0) setSelectedSetId(setsData[0].id);
    });
  }, []);

  const selectedSet = itemSets.find((s) => s.id === selectedSetId);

  // دالة استخراج عنوان العنصر لعرضه في القائمة بشكل جميل
  const getItemTitle = (item: ItemResponse) => {
    const titleObj = item.metadataValues.find(
      (v) =>
        v.propertyLabel.includes("عنوان") || v.propertyLabel.includes("Title")
    );
    return titleObj?.valueText || `عنصر بدون عنوان #${item.id}`;
  };

  // --- دوال الـ Commands ---

  // 1. إضافة عنصر للمجموعة (AddItemToItemSetCommand)
  const handleAddItemToSet = async () => {
    if (!selectedSetId || !itemToAdd) return;

    // التحقق إذا كان العنصر موجوداً مسبقاً في المجموعة
    const alreadyExists = selectedSet?.items?.some(
      (i) => i.id === Number(itemToAdd)
    );
    if (alreadyExists) {
      alert("هذا العنصر موجود مسبقاً في هذه المجموعة!");
      return;
    }

    setIsProcessing(true);
    try {
      // إرسال الـ Command كما ينتظره الـ C#
      const command = { itemSetId: selectedSetId, itemId: Number(itemToAdd) };

      const response = await fetch(`/api/itemsets/${selectedSetId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (response.ok) {
        // تحديث الـ UI محلياً ليظهر العنصر الجديد فوراً
        const updatedSets = itemSets.map((set) => {
          if (set.id === selectedSetId) {
            const addedItem = allItems.find((i) => i.id === Number(itemToAdd));
            if (!addedItem) return set;
            const newSetItem = {
              id: addedItem.id,
              type: "Item" as const,
              templateId: addedItem.templateId,
              ownerId: null,
            };
            return { ...set, items: [...(set.items || []), newSetItem] };
          }
          return set;
        });
        setItemSets(updatedSets);
        setItemToAdd("");
        alert("تم ربط العنصر بالمجموعة بنجاح!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. إزالة عنصر من المجموعة (RemoveItemFromItemSetCommand)
  const handleRemoveItemFromSet = async (itemId: number) => {
    if (!selectedSetId) return;
    if (
      !confirm(
        "هل أنت متأكد من إزالة هذا العنصر من المجموعة؟ (لن يتم حذف العنصر من المكتبة)"
      )
    )
      return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/itemsets/${selectedSetId}/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // تحديث الـ UI محلياً
        const updatedSets = itemSets.map((set) => {
          if (set.id === selectedSetId) {
            return { ...set, items: set.items.filter((i) => i.id !== itemId) };
          }
          return set;
        });
        setItemSets(updatedSets);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Library className="text-primary" size={32} /> إدارة المجموعات
            والعناصر
          </h1>
          <p className="text-gray-500 mt-2">
            قم بإدارة محتوى المجموعات (Item Sets) وإضافة أو إزالة العناصر منها.
          </p>
        </div>
        <button
          onClick={() => navigate("/itemsets/new")}
          className="bg-white border-2 border-primary text-primary px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-50 transition"
        >
          <Plus size={20} /> إنشاء مجموعة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* اللوحة الجانبية: قائمة المجموعات */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4">
              <Folder className="text-primary" size={20} /> المجموعات المتوفرة
            </h2>
            <div className="flex flex-col gap-2">
              {itemSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSetId(set.id)}
                  className={`text-right px-4 py-3 rounded-lg border transition text-sm font-semibold flex justify-between items-center ${
                    selectedSetId === set.id
                      ? "bg-blue-50 border-primary text-primary"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate max-w-[80%]">{set.title}</span>
                  <span className="bg-white border px-2 py-0.5 rounded text-xs text-gray-500">
                    {set.items?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* لوحة التحكم بالمجموعة المحددة */}
        <div className="lg:col-span-3">
          {selectedSet ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-full">
              {/* تفاصيل المجموعة */}
              <div className="bg-gray-50 border-b p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-bold text-2xl text-gray-900">
                    {selectedSet.title}
                  </h2>
                  {selectedSet.isPublic ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                      <Globe size={14} /> عامة للزوار
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full">
                      <Lock size={14} /> خاصة
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  {selectedSet.description || "لا يوجد وصف."}
                </p>
              </div>

              {/* أداة إضافة عنصر للمجموعة */}
              <div className="p-6 border-b bg-white">
                <label className="block text-sm font-bold mb-3 text-gray-800 flex items-center gap-2">
                  <LinkIcon size={18} className="text-primary" /> إضافة عنصر
                  لهذه المجموعة:
                </label>
                <div className="flex gap-3">
                  <select
                    className="flex-grow border border-gray-300 rounded-lg p-3 outline-none bg-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                    value={itemToAdd}
                    onChange={(e) => setItemToAdd(e.target.value)}
                  >
                    <option value="">-- ابحث واختر عنصراً من المكتبة --</option>
                    {allItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        ID: {item.id} | {getItemTitle(item)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddItemToSet}
                    disabled={isProcessing || !itemToAdd}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <Plus size={18} /> ربط بالمجموعة
                  </button>
                </div>
              </div>

              {/* قائمة العناصر الموجودة داخل المجموعة */}
              <div className="p-6 flex-grow bg-gray-50">
                <h3 className="font-bold text-gray-800 mb-4">
                  العناصر المرتبطة حالياً ({selectedSet.items?.length || 0}):
                </h3>

                {!selectedSet.items || selectedSet.items.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                    <Search className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">
                      المجموعة فارغة. اختر عنصراً من الأعلى لإضافته.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSet.items.map((setItem) => {
                      const fullItemDetails = allItems.find(
                        (i) => i.id === setItem.id
                      );
                      return (
                        <div
                          key={setItem.id}
                          className="bg-white border rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-lg">
                              {fullItemDetails
                                ? getItemTitle(fullItemDetails)
                                : `عنصر #${setItem.id}`}
                            </span>
                            <span className="text-sm text-gray-500 font-mono mt-1">
                              Item ID: {setItem.id}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveItemFromSet(setItem.id)}
                            disabled={isProcessing}
                            className="text-red-500 hover:text-white hover:bg-red-500 p-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 size={18} /> إزالة من المجموعة
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
