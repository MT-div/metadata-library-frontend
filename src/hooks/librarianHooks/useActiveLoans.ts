// src/hooks/useActiveLoans.ts
import { useState, useEffect } from "react";
import { circulationService } from "../../services/circulationService";
import { AxiosError } from "axios";
import type { CirculationRecordResponse } from "../../types/circulation.types";

export const useActiveLoans = () => {
  const [records, setRecords] = useState<CirculationRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentTab, setCurrentTab] = useState<"active" | "overdue">("active");

  useEffect(() => {
    // تبديل دالة الخدمة بناءً على التبويب المحدد
    const fetchLoans =
      currentTab === "overdue"
        ? circulationService.getOverdueLoans
        : circulationService.getActiveLoans;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchLoans()
      .then((res) => {
        if (!cancelled) {
          setRecords(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch((error: unknown) => {
        console.error("Error fetching circulation records:", error);
        if (!cancelled) {
          if (error instanceof AxiosError && error.response?.status === 404) {
            setRecords([]);
          } else {
            alert("Failed to load records from server.");
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentTab]);

  // فلترة السجلات بناءً على الاستعلام المدخل
  const filteredRecords = records.filter((r) => {
    const query = search.toLowerCase();
    const pName = r.patronName?.toLowerCase() || "";
    const iTitle = r.itemTitle?.toLowerCase() || "";
    const bcode = (r.copyBarcode || r.barcode)?.toLowerCase() || ""; // يدعم كلا النموذجين بأمان
    return (
      pName.includes(query) || iTitle.includes(query) || bcode.includes(query)
    );
  });

  return {
    records,
    loading,
    search,
    setSearch,
    currentTab,
    setCurrentTab,
    filteredRecords,
  };
};
