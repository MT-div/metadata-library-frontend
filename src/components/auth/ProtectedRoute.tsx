import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

// حارس مخصص للمدراء (Admin)
export const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin()) {
    alert("Access Denied: Admins Only");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

// حارس مخصص لأمناء المكتبة (Librarian)
export const LibrarianRoute = () => {
  const { isAuthenticated, isLibrarian, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // السينيور: نسمح للمدير بالدخول للوحة الـ Librarian أيضاً!
  if (!isLibrarian() && !isAdmin()) {
    alert("Access Denied: Librarians Only");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
