import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Library, Lock, Mail, Loader2, LogIn } from "lucide-react";
import type { LoginRequest, AuthResponse } from "../../types/auth";

export const LoginPage = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // استدعاء دالة الحفظ من المحفظة

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }

      const data: AuthResponse = await response.json();

      // 1. حفظ البيانات في الـ Store والـ LocalStorage
      login(data);

      // 2. توجيه المستخدم لغرفة الـ Admin!
      navigate("/admin/metadata");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "حدث خطأ غير متوقع. حاول مرة أخرى.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Library className="mx-auto h-16 w-16 text-primary" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          تسجيل الدخول للنظام
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          لوحة الإدارة مخصصة للمسؤولين فقط
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg py-2.5 pr-10 pl-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="admin@library.com"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg py-2.5 pr-10 pl-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                  dir="ltr"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <LogIn className="ml-2 h-5 w-5" /> تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* زر تسجيل الدخول بواسطة جوجل (للتصميم فقط حالياً) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">أو</span>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => alert("سيتم تفعيل Google Auth لاحقاً")}
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <img
                  className="h-5 w-5 ml-2"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                />
                الدخول بواسطة حساب جوجل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
