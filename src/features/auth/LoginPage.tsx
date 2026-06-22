// src/features/auth/LoginPage.tsx
import { useLogin } from "../../hooks/authHooks/useLogin";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { Loader2 } from "lucide-react";

import vasePng from "../../assets/icons/vase.png";
import backVase from "../../assets/icons/backVase.png";
import libraryHero from "../../assets/images/libraryHero6.png";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

// ─── 4-point star ────────────────────────────────────────────────────────────
const Sparkle = ({
  size = 14,
  color = C.gold,
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
    stroke={C.inkSoft}
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
    stroke={C.inkSoft}
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
  // استدعاء وتفكيك الخطاف الجديد هنا
  const navigate = useNavigate();
  const {
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
  } = useLogin();

  return (
    <div
      style={{
        fontFamily: fonts.serif,
        background: C.bg,
        width: "100%",
        minHeight: "calc(100vh - 72px)",
        overflowX: "hidden",
        position: "relative",
        overflowY: "hidden",
      }}
    >
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
          border: `3px solid ${C.gold}`,
          opacity: 0.4,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "70px 48px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              background: "#faf6f0",
              border: `1.5px solid ${C.goldBorder}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
              borderRadius: 20,
              padding: "32px 40px",
              fontFamily: fonts.sans,
            }}
          >
            <h2
              style={{
                textAlign: "center",
                fontFamily: fonts.serif,
                fontSize: "2rem",
                fontWeight: 900,
                color: C.ink,
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
                    color: C.danger,
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
                  color: C.inkMid,
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
                    background: C.surface,
                    border: `1.5px solid ${C.goldBorder}`,
                    borderRadius: 12,
                    padding: "12px 14px 12px 42px",
                    fontSize: "0.88rem",
                    fontFamily: fonts.sans,
                    color: C.ink,
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.gold;
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(200,169,110,0.18)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = C.goldBorder;
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
                  color: C.inkMid,
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
                    background: C.surface,
                    border: `1.5px solid ${C.goldBorder}`,
                    borderRadius: 12,
                    padding: "12px 42px",
                    fontSize: "0.88rem",
                    fontFamily: fonts.sans,
                    color: C.ink,
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.gold;
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(200,169,110,0.18)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = C.goldBorder;
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
                    color: C.goldDark,
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
                    color: C.inkMid,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: C.gold, width: 14, height: 14 }}
                  />
                  Remember me
                </label>
                <span
                  style={{
                    color: C.gold,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = C.goldDark)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.gold)}
                >
                  Forgot password?
                </span>
              </div>

              {/* Sign In Button */}
              <GoldBtn
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  borderRadius: 999,
                  padding: "15px 32px",
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 20px rgba(200,169,110,0.4)",
                  marginBottom: 20,
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
              </GoldBtn>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
                color: C.inkSoft,
                fontSize: "0.78rem",
                fontFamily: fonts.sans,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: C.goldBorder,
                }}
              />
              or continue with
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: C.goldBorder,
                }}
              />
            </div>

            {/* Social */}
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 24,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  minWidth: 200,
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setError("Google Sign-In was cancelled or failed.")
                  }
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="pill"
                />
              </div>

              <OutlineBtn
                type="button"
                onClick={() => alert("Microsoft Auth coming soon")}
                rounded
                style={{
                  flex: 1,
                  color: C.ink,
                  border: `2px solid ${C.gold}`,
                  padding: "8px 28px",
                  fontSize: "0.95rem",
                  minWidth: 200,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                </svg>
                Microsoft
              </OutlineBtn>
            </div>

            {/* Create account */}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.82rem",
                color: C.inkMid,
                fontFamily: fonts.sans,
              }}
            >
              Don't have an account?{" "}
              <span
                style={{ color: C.gold, fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.goldDark)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.gold)}
                onClick={() => navigate("/register")}
              >
                Create one
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote Strip ── */}
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
            color: C.gold,
            fontStyle: "italic",
            fontSize: "1rem",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontFamily: fonts.serif,
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
