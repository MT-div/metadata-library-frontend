// src/types/auth.ts

export interface LoginRequest {
  email: string;
  password?: string; // اختياري في الفرونت اند لأننا قد نستخدم جوجل
}

export interface AuthResponse {
  userName: string;
  email: string;
  token: string;
}

// يمكننا إضافة الباقي (Register, Google) لاحقاً عند بناء شاشاتهم
