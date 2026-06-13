import axios from "axios";

// 1. إنشاء نسخة مخصصة من Axios مع الرابط الأساسي للباك اند
export const api = axios.create({
  baseURL: "http://localhost:5022", // رابط السيرفر الخاص بك من الـ Swagger
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. إعداد الـ Interceptor (الجاسوس الذي يضيف الـ Token لكل طلب)
api.interceptors.request.use(
  (config) => {
    // قراءة البطاقة الذكية (Token) من محفظة المتصفح
    const token = localStorage.getItem("token");

    // إذا كان التوكن موجوداً، أضفه في ترويسة الطلب
    const isAuthRequest =
      config.url?.includes("/api/Auth/login") ||
      config.url?.includes("/api/Auth/register") ||
      config.url?.includes("/api/Auth/login-google");

    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. معالجة الأخطاء العالمية مثل انتهاء الجلسة 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إذا رد السيرفر بأن التوكن منتهي أو غير صالح
      console.error("انتهت الجلسة أو غير مصرح لك!");
      // يمكننا لاحقاً تفريغ الـ Store وتوجيهه لصفحة الـ Login
    }
    return Promise.reject(error);
  }
);

// import axios from "axios";

// // 1. إنشاء نسخة مخصصة من Axios مع إضافة withCredentials
// export const api = axios.create({
//   baseURL: "http://localhost:5022",
//   withCredentials: true, // 👈 حرج جداً! ليطابق سياسة الـ AllowCredentials في الباك اند
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 2. إعداد الـ Interceptor (مع استثناء طلبات تسجيل الدخول)
// api.interceptors.request.use(
//   (config) => {
//     // 🚀 استثناء: إذا كان الطلب متوجهاً إلى مسار يحتوي على Auth (مثل login أو register) فلا تضع توكن أبداً!
//     if (config.url?.includes("/api/Auth/")) {
//       return config;
//     }

//     const token = localStorage.getItem("token");

//     // نتحقق أن التوكن موجود وفعلي وليس مجرد كلمة نصية فارغة
//     if (token && token !== "null" && token !== "undefined") {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // 3. معالجة الأخطاء العالمية (كما هي بدون تغيير)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.error("انتهت الجلسة أو غير مصرح لك!");
//     }
//     return Promise.reject(error);
//   }
// );
