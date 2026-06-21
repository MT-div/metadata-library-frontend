// src/utils/helpers.ts
import type { ItemResponse } from "../types/item.types";

/**
 * تنسيق التواريخ العادية ISO Date بشكل مقروء
 */
export const formatDate = (isoString?: string | null): string => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * تنسيق تاريخي تفصيلي يشمل الوقت وساعات الإعارة
 */
export const formatDateWithTime = (isoString?: string | null): string => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * استخراج قيمة ميتاداتا معينة بناءً على مصفوفة تسميات محتملة
 */
export const extractMetadataValue = (
  item: ItemResponse,
  labels: string[]
): string | null => {
  if (!item || !item.metadataValues) return null;
  return (
    item.metadataValues.find((v) =>
      labels.some((l) =>
        v.propertyLabel?.toLowerCase().includes(l.toLowerCase())
      )
    )?.valueText ?? null
  );
};

/**
 * استخراج عنوان العنصر أو الكتاب بشكل آمن
 */
export const getItemTitle = (item: ItemResponse): string => {
  return (
    extractMetadataValue(item, ["title", "عنوان"]) ??
    `Untitled #${item?.id ?? ""}`
  );
};

/**
 * استخراج اسم كاتب أو مؤلف العنصر بشكل آمن
 */
export const getItemAuthor = (item: ItemResponse): string => {
  return (
    extractMetadataValue(item, ["author", "مؤلف", "كاتب"]) ?? "Unknown Author"
  );
};

/**
 * استخراج سنة النشر الفعلي كقيمة عددية
 */
export const extractYear = (item: ItemResponse): number | null => {
  const yearStr = extractMetadataValue(item, [
    "تاريخ",
    "سنة",
    "date",
    "year",
    "issued",
  ]);
  return yearStr ? parseInt(yearStr.replace(/\D/g, ""), 10) : null;
};

/**
 * محاكاة حساب التقييمات الافتراضية للعناصر بناءً على معرّف العنصر
 */
export const computeRating = (id: number): string => {
  return (3.5 + (id % 15) * 0.1).toFixed(1);
};

/**
 * استخراج رسائل الخطأ الآتية من طلبات Axios بشكل آمن
 */
export const getErrorMessage = (
  error: unknown,
  defaultMessage = "حدث خطأ أثناء المعالجة."
): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    // Narrow to an Axios-like shape without using `any`
    const maybeResponse = (error as { response?: { data?: unknown } }).response;
    if (typeof maybeResponse?.data === "string") {
      return maybeResponse.data;
    }
  }
  return defaultMessage;
};
