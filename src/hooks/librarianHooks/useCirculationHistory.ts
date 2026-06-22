// src/hooks/useCirculationHistory.ts
import { useState, useEffect } from "react";
import { circulationService } from "../../services/circulationService";
import { AxiosError } from "axios";
import type { CirculationRecordResponse } from "../../types/circulation.types";

export const useCirculationHistory = () => {
  const [records, setRecords] = useState<CirculationRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    // جلب سجلات التداول عبر الخدمة الموحدة
    circulationService
      .getHistory()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setRecords(
          data.sort(
            (a, b) =>
              new Date(b.borrowDate).getTime() -
              new Date(a.borrowDate).getTime()
          )
        );
      })
      .catch((err: unknown) => {
        console.error("Error fetching circulation history:", err);
        if (err instanceof AxiosError && err.response?.status === 404)
          setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getComputedStatus = (r: CirculationRecordResponse) => {
    if (r.status) return r.status.toLowerCase();
    if (r.returnDate) return "returned";
    if (r.isOverdue) return "overdue";
    return "active";
  };

  const hasFilters = Boolean(
    search || statusFilter !== "all" || dateFrom || dateTo
  );

  // حساب منطق الفلترة والبحث والتطابق التاريخي بشكل مشتق
  const filtered = records.filter((r) => {
    const computedStatus = getComputedStatus(r);
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (r.patronName?.toLowerCase() || "").includes(q) ||
      (r.itemTitle?.toLowerCase() || "").includes(q) ||
      (r.copyBarcode?.toLowerCase() || "").includes(q) ||
      r.recordId?.toString() === q; // يدعم معرّفات السجلات الاحتياطية

    const matchStatus =
      statusFilter === "all" || computedStatus === statusFilter.toLowerCase();

    let matchDate = true;
    const bDate = new Date(r.borrowDate).getTime();
    if (dateFrom)
      matchDate = matchDate && bDate >= new Date(dateFrom).getTime();
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      matchDate = matchDate && bDate <= to.getTime();
    }
    return matchSearch && matchStatus && matchDate;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return {
    records,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    getComputedStatus,
    hasFilters,
    filtered,
    clearFilters,
  };
};
