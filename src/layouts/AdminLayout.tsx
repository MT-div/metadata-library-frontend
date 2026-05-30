import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  LayoutTemplate,
  Library,
  FilePlus,
  UploadCloud,
  Menu,
  X,
  LogOut,
  Globe,
} from "lucide-react";

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // قائمة الروابط في لوحة التحكم
  const adminLinks = [
    // مؤقتاً الدخول للوحة التحكم سيعرض إدارة الميتاداتا
    {
      title: "إدارة الميتاداتا",
      path: "/admin/metadata",
      icon: <Settings size={20} />,
    },
    {
      title: "إدارة القوالب",
      path: "/admin/templates",
      icon: <LayoutTemplate size={20} />,
    },
    {
      title: "إدارة المجموعات",
      path: "/admin/itemsets",
      icon: <Library size={20} />,
    },
    {
      title: "إضافة عنصر جديد",
      path: "/items/new",
      icon: <FilePlus size={20} />,
    },
    {
      title: "رفع وسائط (Media)",
      path: "/media/new",
      icon: <UploadCloud size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* ========================================== */}
      {/* 1. الشريط الجانبي (Sidebar) */}
      {/* ========================================== */}

      {/* خلفية داكنة تظهر في الشاشات الصغيرة عند فتح القائمة */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed lg:static inset-y-0 right-0 w-64 bg-slate-900 text-white z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* اللوجو */}
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
          <span className="font-bold text-xl flex items-center gap-2">
            <LayoutDashboard className="text-primary" /> لوحة الإدارة
          </span>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* الروابط */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            النظام الأساسي
          </p>
          {adminLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium
                ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {link.icon}
              {link.title}
            </NavLink>
          ))}
        </nav>

        {/* روابط سفلية (تصفح الموقع وتسجيل الخروج) */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => navigate("/browse")}
            className="flex items-center gap-3 w-full px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
          >
            <Globe size={20} /> تصفح المكتبة
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition">
            <LogOut size={20} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 2. منطقة المحتوى (Main Content) */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* الشريط العلوي (Navbar) */}
        <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-600 hover:text-primary p-1"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
              نظام إدارة الميتاداتا
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-gray-900">
                المدير العام (Admin)
              </p>
              <p className="text-xs text-gray-500">admin@library.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold border-2 border-primary">
              A
            </div>
          </div>
        </header>

        {/* محتوى الصفحة المتغير (Outlet) */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {/* هنا سيقوم React Router بحقن الصفحة المحددة من الشريط الجانبي */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
