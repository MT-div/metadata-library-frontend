import { create } from "zustand";
import type { AuthResponse } from "../types/auth";

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (userData: AuthResponse) => void;
  logout: () => void;

  // 👈 دوال الـ Senior المساعدة
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isLibrarian: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  isAuthenticated: !!localStorage.getItem("user"),

  login: (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },

  // 👈 التحقق مما إذا كان المستخدم يملك دوراً معيناً
  hasRole: (role: string) => {
    const user = get().user;
    return user?.roles?.includes(role) || false;
  },

  // 👈 التحقق السريع من المدراء
  isAdmin: () => {
    return get().hasRole("Admin");
  },

  // 👈 التحقق السريع من أمناء المكتبة
  isLibrarian: () => {
    return get().hasRole("Librarian");
  },
}));
