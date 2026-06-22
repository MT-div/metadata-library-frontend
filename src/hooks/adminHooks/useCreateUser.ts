// src/hooks/useCreateUser.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { getErrorMessage } from "../utils/helpers";

export const useCreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // استنتاج اسم المستخدم (UserName) تلقائياً من الإيميل لتسهيل العمل
  const handleEmailChange = (email: string) => {
    const autoUserName = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      email,
      userName: prev.userName || autoUserName, // نملأه فقط إذا كان فارغاً
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // نستخدم رابط الـ Register لأنه ينشئ حساباً قابلاً لتسجيل الدخول (Identity)
      const res = await authService.register(formData);

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/admin/users"); // العودة لجدول المستخدمين بعد النجاح
        }, 2000);
      }
    } catch (err: unknown) {
      console.error("Error creating user:", err);
      setErrorMsg(getErrorMessage(err, "حدث خطأ أثناء إنشاء المستخدم."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    success,
    focusedField,
    setFocusedField,
    errorMsg,
    handleEmailChange,
    handleSubmit,
  };
};
