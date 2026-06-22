// src/hooks/useCreatePatron.ts
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { patronService } from "../../services/patronService";
import { AxiosError } from "axios";
import type { CreatePatronCommand } from "../../types/patron.types";

export const useCreatePatron = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/librarian/patrons";

  const [formData, setFormData] = useState<CreatePatronCommand>({
    fullName: "",
    nationalId: "",
    phoneNumber: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // إرسال البيانات عبر خدمة المشتركين الموحدة
      const res = await patronService.createPatron(formData);
      if (res.status === 200 || res.status === 201) {
        // إذا جاء من صفحة الإعارة، نعيده إليها بعد الحفظ فوراً
        navigate(returnTo, { replace: true });
      }
    } catch (err: unknown) {
      console.error("Error creating patron:", err);
      if (err instanceof AxiosError && err.response) {
        setErrorMsg(err.response.data || "Failed to create patron.");
      } else {
        setErrorMsg("Network error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    returnTo,
    formData,
    setFormData,
    isSubmitting,
    errorMsg,
    handleSubmit,
  };
};
