// src/services/settingsService.ts
import { api } from "./api";

export const settingsService = {
  // جلب إعداد معين بواسطة الـ Key (مثل "GlobalBorrowDays")
  getSetting: (key: string) => {
    return api.get(`/api/system-settings/${key}`);
  },

  // تحديث إعداد معين
  updateSetting: (key: string, value: string) => {
    return api.put(`/api/system-settings/${key}`, JSON.stringify(value), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
