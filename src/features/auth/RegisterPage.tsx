import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2 } from "lucide-react";
import type { RegisterRequest, AuthResponse } from "../../types/auth";
import { api } from "../../services/api";
import { AxiosError } from "axios";

import vasePng from "../../assets/icons/vase.png";
import backVase from "../../assets/icons/backVase.png";
import libraryHero from "../../assets/images/libraryHero6.png";

// ─── Shared SVG helpers (identical to LoginPage) ──────────────────────────────
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

const UserIcon = () => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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

// ─── Shared input style helper ────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1.5px solid rgba(200,169,110,0.35)",
  borderRadius: 12,
  fontSize: "0.88rem",
  fontFamily: "'Poppins', sans-serif",
  color: "#1a1208",
  outline: "none",
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#c8a96e";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(200,169,110,0.18)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(200,169,110,0.35)";
    e.currentTarget.style.boxShadow = "none";
  },
};

// ─── Shared page background (identical to LoginPage) ─────────────────────────
const PageBackground = () => (
  <>
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
          alt="Library"
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
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
export const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Auto-generate username from email prefix
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
      const res = await api.post<AuthResponse>("/api/Auth/register", formData);
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
      <PageBackground />

      {/* ═══ HERO section — same grid as LoginPage ═══ */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "70px 48px 40px", // ← matches LoginPage exactly
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          {/* ── Form Card — same style as LoginPage ── */}
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
              Create Account
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Error banner — same as LoginPage */}
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

              {/* Full Name + Username — side by side */}
              <div style={{ display: "flex", gap: 12, marginBottom: 0 }}>
                {/* Full Name */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#3d2b0e",
                      marginBottom: 7,
                    }}
                  >
                    Full Name
                  </label>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: "flex",
                      }}
                    >
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, fullName: e.target.value }))
                      }
                      style={{ ...inputBase, padding: "10px 14px 10px 42px" }}
                      {...focusHandlers}
                    />
                  </div>
                </div>

                {/* Username */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#3d2b0e",
                      marginBottom: 7,
                    }}
                  >
                    Username
                  </label>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#a08050",
                        fontWeight: "bold",
                        fontFamily: "sans-serif",
                        fontSize: "1rem",
                      }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="johndoe"
                      dir="ltr"
                      value={formData.userName}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          userName: e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                        }))
                      }
                      style={{ ...inputBase, padding: "10px 14px 10px 36px" }}
                      {...focusHandlers}
                    />
                  </div>
                </div>
              </div>

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
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                  }}
                >
                  <MailIcon />
                </span>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  style={{ ...inputBase, padding: "12px 14px 12px 42px" }}
                  {...focusHandlers}
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
              <div style={{ position: "relative", marginBottom: 24 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                  }}
                >
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  dir="ltr"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, password: e.target.value }))
                  }
                  style={{ ...inputBase, padding: "12px 42px" }}
                  {...focusHandlers}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
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

              {/* Submit — identical to LoginPage "Sign in" button */}
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
                    {" "}
                    Join HIASTica <ArrowRight size={16} />{" "}
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.82rem",
                color: "#5c4a30",
                fontFamily: "sans-serif",
              }}
            >
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{ color: "#c8a96e", fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a07840")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#c8a96e")}
              >
                Sign in
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Quote strip — same as LoginPage ═══ */}
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
          "The more that you read, the more things you will know."
          <Sparkle size={13} />
        </p>
      </section>

      {/* spin keyframe — same as LoginPage */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
