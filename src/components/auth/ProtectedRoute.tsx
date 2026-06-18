import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export const ProtectedRoute = () => {
  // 1. جلب حالة الدخول والصلاحيات من المحفظة
  const { isAuthenticated, isAdmin, isLibrarian } = useAuthStore();

  // 2. التحقق من المصادقة (Authentication)
  if (!isAuthenticated) {
    // إذا لم يكن مسجلاً، اطرده لصفحة تسجيل الدخول
    return <Navigate to="/login" replace />;
  }

  // 3. التحقق من الصلاحيات (Authorization)
  const canAccessAdmin = isAdmin() || isLibrarian();

  if (!canAccessAdmin) {
    // إذا كان مستخدماً عادياً وحاول كتابة /admin في الرابط يدوياً،
    // نطرده فوراً إلى الصفحة الرئيسية (أو لصفحة 403 مخصصة).
    return <Navigate to="/" replace />;
  }

  // 4. إذا كان مسجل دخول + يملك الصلاحية ➔ تفضل بالدخول للوحة التحكم
  return <Outlet />;
};
