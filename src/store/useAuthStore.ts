// src/store/useAuthStore.ts
import { create } from 'zustand';
import type { AuthResponse } from '../types/auth';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (userData: AuthResponse) => void;
  logout: () => void;
}

// إنشاء المحفظة (Store)
export const useAuthStore = create<AuthState>((set) => ({
  // عند فتح الموقع، نحاول قراءة البيانات من المتصفح (localStorage)
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('user'),

  // دالة تسجيل الدخول: تحفظ البيانات في الـ State وفي الـ localStorage
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token); // لحفظ البطاقة الذكية
    set({ user: userData, isAuthenticated: true });
  },

  // دالة تسجيل الخروج: تمسح البيانات
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));