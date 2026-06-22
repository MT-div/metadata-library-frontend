// src/hooks/useAdminDashboard.ts
import { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import { authService } from "../../services/authService";
import { mediaService } from "../../services/mediaService";
import { metadataService } from "../../services/metadataService";
import type { ItemResponse } from "../../types/item.types";
import type { ResourceTemplateResponse } from "../../types/template.types";

interface SystemStats {
  items: number;
  users: number;
  collections: number;
  media: number;
  templatesDist: { label: string; count: number; percentage: number }[];
}

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    items: 0,
    users: 0,
    collections: 0,
    media: 0,
    templatesDist: [],
  });

  useEffect(() => {
    // جلب كافة إحصائيات النظام بالتوازي عبر الخدمات الموحدة
    Promise.all([
      itemService.getItems().then((r) => r.data),
      authService.getUsers().then((r) => r.data),
      itemService.getItemSets().then((r) => r.data),
      mediaService.getMedia().then((r) => r.data),
      metadataService.getTemplates().then((r) => r.data),
    ])
      .then(([itemsData, usersData, setsData, mediaData, templatesData]) => {
        const items = itemsData as ItemResponse[];
        const templates = templatesData as ResourceTemplateResponse[];

        // حساب توزيع تصنيفات القوالب الأربعة الأكثر استخداماً
        const dist = templates
          .map((tpl) => {
            const count = items.filter((i) => i.templateId === tpl.id).length;
            const percentage =
              items.length === 0 ? 0 : Math.round((count / items.length) * 100);
            return { label: tpl.label, count, percentage };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);

        setStats({
          items: items.length,
          users: usersData.length,
          collections: setsData.length,
          media: mediaData.length,
          templatesDist: dist,
        });
      })
      .catch((err) => console.error("Error loading dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  return {
    loading,
    stats,
  };
};
