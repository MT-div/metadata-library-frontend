// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export const ProtectedRoute = () => {
  // قراءة حالة الدخول من الـ Store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // إذا لم يكن مسجلاً، اطرده لصفحة الدخول
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // إذا كان مسجلاً، اسمح له بالمرور (رندرة المكونات الأبناء)
  return <Outlet />;
};
