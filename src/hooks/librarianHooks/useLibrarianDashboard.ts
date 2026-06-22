// src/hooks/useLibrarianDashboard.ts
import { useState, useEffect } from "react";
import { itemService } from "../../services/itemService";
import { patronService } from "../../services/patronService";
import { circulationService } from "../../services/circulationService";

interface LibrarianStats {
  totalItems: number;
  totalPatrons: number;
  activeLoans: number;
  overdueLoans: number;
}

export const useLibrarianDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LibrarianStats>({
    totalItems: 0,
    totalPatrons: 0,
    activeLoans: 0,
    overdueLoans: 0,
  });

  useEffect(() => {
    // جلب الإحصائيات بالتوازي عبر الخدمات الموحدة
    Promise.all([
      itemService
        .getItems()
        .then((r) => r.data)
        .catch(() => []),
      patronService
        .getPatrons()
        .then((r) => r.data)
        .catch(() => []),
      circulationService
        .getActiveLoans()
        .then((r) => r.data)
        .catch(() => []),
      circulationService
        .getOverdueLoans()
        .then((r) => r.data)
        .catch(() => []),
    ])
      .then(([items, patrons, active, overdue]) => {
        setStats({
          totalItems: items.length,
          totalPatrons: patrons.length,
          activeLoans: active.length,
          overdueLoans: overdue.length,
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
