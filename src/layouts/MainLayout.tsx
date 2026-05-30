import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { Library, Search, Home, FolderOpen, LogIn } from "lucide-react";

export const MainLayout = () => {
  const navigate = useNavigate();

  // روابط الزوار العاديين
  const publicLinks = [
    { title: "الرئيسية", path: "/", icon: <Home size={18} /> },
    { title: "تصفح العناصر", path: "/browse", icon: <Search size={18} /> },
    { title: "المجموعات", path: "/itemsets", icon: <FolderOpen size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans" dir="rtl">
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* اللوجو */}
            <Link
              to="/"
              className="flex items-center gap-2 text-primary hover:opacity-80 transition"
            >
              <Library size={28} />
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                المكتبة الرقمية
              </span>
            </Link>

            {/* روابط التنقل (Desktop) */}
            <nav className="hidden md:flex gap-6">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `
                    flex items-center gap-1.5 text-sm font-semibold transition-colors pb-1 border-b-2
                    ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-600 hover:text-primary"
                    }
                  `}
                >
                  {link.icon} {link.title}
                </NavLink>
              ))}
            </nav>

            {/* زر تسجيل الدخول (سينقلنا مستقبلاً لصفحة Auth، حالياً ينقلنا للـ Admin للتجربة) */}
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              <LogIn size={18} /> دخول الإدارة
            </button>
          </div>
        </div>

        {/* روابط التنقل (Mobile) - تظهر فقط في الشاشات الصغيرة */}
        <div className="md:hidden flex justify-around border-t py-2 bg-gray-50">
          {publicLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                  flex flex-col items-center gap-1 text-xs font-semibold p-2 rounded-lg
                  ${isActive ? "text-primary bg-blue-50" : "text-gray-500"}
                `}
            >
              {link.icon} {link.title}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Dynamic Content (Pages will render here) */}
      <main className="grow bg-gray-50">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            © {new Date().getFullYear()} Metadata Library System. جميع الحقوق
            محفوظة.
          </p>
          <div className="flex gap-4">
            <Link to="/browse" className="hover:text-white transition">
              البحث
            </Link>
            <Link to="/itemsets" className="hover:text-white transition">
              المجموعات
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
