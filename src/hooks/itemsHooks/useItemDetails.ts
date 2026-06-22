// src/hooks/useItemDetails.ts
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { itemService } from "../../services/itemService";
import { metadataService } from "../../services/metadataService";
import { mediaService } from "../../services/mediaService";
import type { ItemResponse } from "../../types/item.types";
import type { ResourceTemplateResponse } from "../../types/template.types";
import type { ItemSetResponse } from "../../types/itemSet.types";
import type { MediaResponse } from "../../types/media.types";

export const useItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [template, setTemplate] = useState<ResourceTemplateResponse | null>(
    null
  );
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [media, setMedia] = useState<MediaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        // استخدام الخدمات الموحدة لجلب البيانات
        const itemRes = await itemService.getItemById(Number(id));
        const itemData = itemRes.data;
        setItem(itemData);

        const [tplRes, setsRes, mediaRes] = await Promise.all([
          metadataService.getTemplates(),
          itemService.getItemSets(),
          mediaService.getMediaByItem(Number(id)),
        ]);

        const tpls = tplRes.data;
        setTemplate(tpls.find((t) => t.id === itemData.templateId) || null);

        const sets = setsRes.data;
        setItemSets(
          sets.filter((s) => s.items?.some((i) => i.id === itemData.id))
        );

        setMedia(mediaRes.data);
      } catch (e) {
        console.error("Error loading item details:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;

    setIsDeleting(true);
    try {
      await itemService.deleteItem(Number(id));
      alert("تم حذف العنصر بنجاح.");
      navigate("/browse", { replace: true });
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("حدث خطأ أثناء محاولة حذف العنصر.");
      setIsDeleting(false);
    }
  };

  return {
    id,
    item,
    template,
    itemSets,
    media,
    loading,
    isDeleting,
    handleDelete,
  };
};
