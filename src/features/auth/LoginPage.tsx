import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2 } from "lucide-react";
import type { LoginRequest, AuthResponse } from "../../types/auth";
import { api } from "../../services/api";
import { AxiosError } from "axios";

import vasePng from "../../assets/icons/vase.png";
import backVase from "../../assets/icons/backVase.png";
import libraryHero from "../../assets/images/libraryHero6.png";

// ─── 4-point star ────────────────────────────────────────────────────────────
const Sparkle = ({
  size = 14,
  color = "#c8a96e",
}: {
  size?: number;
  color?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1 L9 7 L15 8 L9 9 L8 15 L7 9 L1 8 L7 7 Z" fill={color} />
  </svg>
);

// ─── Arrow right ─────────────────────────────────────────────────────────────
const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const MailIcon = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#a08050"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const LockIcon = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#a08050"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

// ─────────────────────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 🚀 الاتصال الحقيقي بالباك اند! (تطابق مسار الـ Swagger)
      const response = await api.post<AuthResponse>(
        "/api/Auth/login",
        formData
      );

      // البيانات تعود جاهزة داخل response.data في مكتبة Axios
      const data = response.data;

      // حفظ البيانات في الـ Store
      login(data);

      // الدخول للوحة التحكم
      navigate("/admin/metadata");
    } catch (err: unknown) {
      // معالجة رسائل الخطأ القادمة من الباك اند (مثل: Invalid email or password)
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

  // ─── نفس الـ wrapper بالضبط من WelcomePage ───────────────────────────────
  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: "#F7F3ED",
        width: "100%",
        minHeight: "calc(100vh - 72px)",
        overflowX: "hidden",
        position: "relative",
        overflowY: "hidden",
      }}
    >
      {/* نفس الـ vase بالضبط */}
      <img
        src={vasePng}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          bottom: -55,
          left: -20,
          width: 260,
          zIndex: 4,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.10))",
          pointerEvents: "none",
        }}
      />
      <img
        src={backVase}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          bottom: -110,
          left: 0,
          width: 260,
          zIndex: 0,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.10))",
          pointerEvents: "none",
        }}
      />

      {/* نفس الصورة بالضبط */}
      <div style={{ position: "absolute", height: "85%", right: 0, top: 0 }}>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={libraryHero}
            alt="HIASTica Library Interior"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              zIndex: 3,
            }}
          />
        </div>
      </div>

      {/* نفس الـ blobs بالضبط */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -60,
          right: -80,
          width: 480,
          height: 480,
          background: "radial-gradient(ellipse, #e8d4b0 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 180,
          left: -80,
          width: 340,
          height: 340,
          background: "radial-gradient(ellipse, #eddfc4 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* نفس الـ gold arc بالضبط */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 230,
          left: 80,
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: "3px solid #c8a96e",
          opacity: 0.4,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ═══════════ نفس الـ HERO section بالضبط من WelcomePage ═══════════ */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "70px 48px 40px", // ← رفعنا العنوان بتقليل padding-top من 80 إلى 60
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── LEFT: نفس البنية بالضبط — فقط المحتوى تغيّر ── */}
        <div>
          {/* Badge */}
          {/* <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#ffffff",
              border: "1px solid #dbc9a4",
              borderRadius: 999,
              padding: "7px 16px",
              marginBottom: 16,
            }}
          >
            <Sparkle size={12} />
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#8a6a3a",
                fontFamily: "sans-serif",
              }}
            >
              Welcome Back
            </span>
          </div> */}

          {/* Headline */}
          {/* <h1
            style={{
              margin: "0 0 20px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
                fontWeight: 800,
                color: "#1a1208",
              }}
            >
              Sign in to
            </span>
            <span
              style={{
                display: "block",
                fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
                fontWeight: 800,
                color: "#c8a96e",
                fontStyle: "italic",
              }}
            >
              HIASTica
            </span>
          </h1> */}

          {/* Body */}
          {/* <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1rem",
              color: "#5c4a30",
              lineHeight: 1.8,
              marginBottom: 40,
              maxWidth: 400,
            }}
          >
            Continue your reading journey,
            <br />
            discover more, and keep growing.
          </p> */}

          {/* ── Form Card — نفس بنية CTA Buttons div ── */}
          <div
            style={{
              background: "#faf6f0",
              border: "1.5px solid rgba(200,169,110,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
              borderRadius: 20,
              padding: "32px 40px",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {/* Title */}
            <h2
              style={{
                textAlign: "center",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "2rem",
                fontWeight: 900,
                color: "#1a1208",
                marginBottom: 24,
                marginTop: 0,
              }}
            >
              Sign In
            </h2>
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    background: "#fff5f5",
                    border: "1.5px solid rgba(200,80,80,0.3)",
                    color: "#a03030",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginBottom: 18,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Email */}
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#3d2b0e",
                  marginBottom: 7,
                }}
              >
                Email address
              </label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    display: "flex",
                  }}
                >
                  <MailIcon />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#ffffff",
                    border: "1.5px solid rgba(200,169,110,0.35)",
                    borderRadius: 12,
                    padding: "12px 14px 12px 42px",
                    fontSize: "0.88rem",
                    fontFamily: "'Poppins', sans-serif",
                    color: "#1a1208",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#c8a96e";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(200,169,110,0.18)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(200,169,110,0.35)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password */}
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#3d2b0e",
                  marginBottom: 7,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    display: "flex",
                  }}
                >
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  dir="ltr"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#ffffff",
                    border: "1.5px solid rgba(200,169,110,0.35)",
                    borderRadius: 12,
                    padding: "12px 42px",
                    fontSize: "0.88rem",
                    fontFamily: "'Poppins', sans-serif",
                    color: "#1a1208",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#c8a96e";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(200,169,110,0.18)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(200,169,110,0.35)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#a08050",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Remember + Forgot */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                  fontSize: "0.8rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#5c4a30",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: "#c8a96e", width: 14, height: 14 }}
                  />
                  Remember me
                </label>
                <span
                  style={{
                    color: "#c8a96e",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#a07840")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#c8a96e")
                  }
                >
                  Forgot password?
                </span>
              </div>

              {/* Sign In — نفس زر "Enter HIASTica" بالضبط */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "100%",
                  background: "#c8a96e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  padding: "15px 32px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  fontFamily: "sans-serif",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  boxShadow: "0 4px 20px rgba(200,169,110,0.4)",
                  opacity: isLoading ? 0.7 : 1,
                  marginBottom: 20,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.background = "#b8965a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#c8a96e";
                }}
              >
                {isLoading ? (
                  <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <>
                    Sign in <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
                color: "#a08050",
                fontSize: "0.78rem",
                fontFamily: "sans-serif",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(200,169,110,0.3)",
                }}
              />
              or continue with
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(200,169,110,0.3)",
                }}
              />
            </div>

            {/* Social — نفس زر "Explore Features" بالضبط */}
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <button
                type="button"
                onClick={() => alert("سيتم تفعيل Google Auth لاحقاً")}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "transparent",
                  color: "#3d2b0e",
                  border: "2px solid #c8a96e",
                  borderRadius: 999,
                  padding: "13px 28px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  fontFamily: "sans-serif",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0e8d8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  style={{ width: 18, height: 18 }}
                />
                Google
              </button>
              <button
                type="button"
                onClick={() => alert("سيتم تفعيل Microsoft Auth لاحقاً")}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "transparent",
                  color: "#3d2b0e",
                  border: "2px solid #c8a96e",
                  borderRadius: 999,
                  padding: "13px 28px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  fontFamily: "sans-serif",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0e8d8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                </svg>
                Microsoft
              </button>
            </div>

            {/* Create account */}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.82rem",
                color: "#5c4a30",
                fontFamily: "sans-serif",
              }}
            >
              Don't have an account?{" "}
              <span
                style={{ color: "#c8a96e", fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a07840")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#c8a96e")}
              >
                Create one
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ QUOTE STRIP — نفس الـ FEATURE STRIP section بدون البطاقات ═══════════ */}
      <section
        style={{
          maxWidth: 1280,
          margin: "24px auto",
          padding: "0 48px 30px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <p
          style={{
            textAlign: "center",
            marginTop: 32,
            color: "#c8a96e",
            fontStyle: "italic",
            fontSize: "1rem",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontFamily: "'Georgia', serif",
          }}
        >
          <Sparkle size={13} />
          "A room without books is like a body without a soul."
          <Sparkle size={13} />
        </p>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
