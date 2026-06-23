// src/services/api.ts
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore"; // استيراد المخزن

export const api = axios.create({
  baseURL: "https://localhost:7206",
  //   baseURL: import.meta.env.VITE_API_BASE_URL ,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. معترض الطلبات (حقن التوكن)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // استثناء طلبات تسجيل الدخول والمصادقة
    const isAuthRequest =
      config.url?.includes("/api/Auth/login") ||
      config.url?.includes("/api/Auth/register") ||
      config.url?.includes("/api/Auth/login-google");

    if (token && !isAuthRequest) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 2. معترض الاستجابات (معالجة انتهاء الجلسة 401 بذكاء)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "انتهت الجلسة أو التوكن غير صالح! جاري اتخاذ الإجراء الأمني..."
      );

      // أ) تفريغ المخزن ومسح التوكن من الـ localStorage تلقائياً
      useAuthStore.getState().logout();

      // ب) التحقق من نوع المسار الحالي
      const currentPath = window.location.pathname;
      const isPrivateRoute =
        currentPath.startsWith("/admin") ||
        currentPath.startsWith("/librarian");

      if (isPrivateRoute) {
        // إذا كان مساراً محمياً، نوجهه لصفحة تسجيل الدخول فوراً
        window.location.href = "/login";
      } else {
        // إذا كان مساراً عاماً (مثل browse)، نعيد تحميل الصفحة لطلب البيانات كضيف وبدون توكن تالف
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// import axios from "axios";

// // 1. إنشاء نسخة مخصصة من Axios مع الرابط الأساسي للباك اند
// export const api = axios.create({
//   baseURL: "https://localhost:7206", // رابط السيرفر الخاص بك من الـ Swagger
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 2. إعداد الـ Interceptor (الجاسوس الذي يضيف الـ Token لكل طلب)
// api.interceptors.request.use(
//   (config) => {
//     // قراءة البطاقة الذكية (Token) من محفظة المتصفح
//     const token = localStorage.getItem("token");

//     // إذا كان التوكن موجوداً، أضفه في ترويسة الطلب
//     const isAuthRequest =
//       config.url?.includes("/api/Auth/login") ||
//       config.url?.includes("/api/Auth/register") ||
//       config.url?.includes("/api/Auth/login-google");

//     if (token && !isAuthRequest) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // 3. معالجة الأخطاء العالمية مثل انتهاء الجلسة 401
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // إذا رد السيرفر بأن التوكن منتهي أو غير صالح
//       console.error("انتهت الجلسة أو غير مصرح لك!");
//       // يمكننا لاحقاً تفريغ الـ Store وتوجيهه لصفحة الـ Login
//     }
//     return Promise.reject(error);
//   }
// );
