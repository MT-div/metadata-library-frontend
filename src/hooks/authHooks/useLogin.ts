// src/hooks/useLogin.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/useAuthStore";
import { AxiosError } from "axios";
import type { LoginRequest } from "../../types/auth";
import type { CredentialResponse } from "@react-oauth/google";

export const useLogin = () => {
  const { isAdmin, isLibrarian, login } = useAuthStore();
  const canAccessAdmin = isAdmin() || isLibrarian();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      const data = response.data;
      login(data);

      if (canAccessAdmin) {
        navigate("/admin/metadata");
      } else {
        navigate("/browse");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        setError(
          err.response.data || "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        );
      } else {
        setError("تعذر الاتصال بالخادم. تأكد من تشغيل الباك اند.");
        console.error("Login error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse | null
  ) => {
    setIsLoading(true);
    setError("");
    try {
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error("Missing credential from Google response");
      }
      const response = await authService.loginWithGoogle(
        credentialResponse.credential
      );
      login(response.data);
      if (canAccessAdmin) {
        navigate("/admin/metadata");
      } else {
        navigate("/browse");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data || "Google login failed.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    setError,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    handleSubmit,
    handleGoogleSuccess,
  };
};
