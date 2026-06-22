// src/hooks/useRegister.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/useAuthStore";
import { AxiosError } from "axios";
import type { RegisterRequest } from "../../types/auth";

export const useRegister = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // توليد اسم مستخدم تلقائي من البريد الإلكتروني
  const handleEmailChange = (email: string) => {
    const auto = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      email,
      userName: prev.userName || auto,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await authService.register(formData);
      login(res.data);
      navigate("/browse");
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        setError(
          err.response.data ||
            "Registration failed. Email or username might already be taken."
        );
      } else {
        setError("Network error. Please make sure the server is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    handleEmailChange,
    handleSubmit,
  };
};
