import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  UserPlus,
  Save,
  ArrowLeft,
  Mail,
  User,
  Lock,
  Info,
  ShieldAlert,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldMid: "rgba(200,169,110,0.15)",
  goldBorder: "rgba(200,169,110,0.28)",
  goldDark: "#b8965a",
  ink: "#1a1208",
  inkMid: "#5c4a30",
  inkSoft: "#9a8060",
  danger: "#c0392b",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

export const CreateUserPage = () => {
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

  const getErrorMessage = (error: unknown): string => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: unknown } }).response?.data ===
        "string"
    ) {
      return (error as { response?: { data?: string } }).response!.data!;
    }

    return "حدث خطأ أثناء إنشاء المستخدم.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // نستخدم رابط الـ Register لأنه ينشئ حساباً قابلاً لتسجيل الدخول (Identity)
      const res = await api.post("/api/Auth/register", formData);

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/admin/users"); // العودة لجدول المستخدمين بعد النجاح
        }, 2000);
      }
    } catch (err: unknown) {
      console.error("Error creating user:", err);
      // محاولة عرض رسالة الخطأ القادمة من السيرفر (مثل: Email already exists)
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${focusedField === field ? C.gold : C.goldBorder}`,
    borderRadius: 10,
    padding: "11px 14px 11px 40px", // مساحة للأيقونة على اليسار
    fontFamily: sans,
    fontSize: "0.9rem",
    color: C.ink,
    background: C.surface,
    outline: "none",
    transition: "border-color 0.2s",
  });

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
          paddingBottom: 24,
          borderBottom: `1.5px solid ${C.goldBorder}`,
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: C.gold,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Admin · Access Control
          </p>
          <h1
            style={{
              fontFamily: serif,
              fontSize: "1.8rem",
              fontWeight: 800,
              color: C.ink,
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Add New User
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Create a new account for staff or researchers to access the system.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "transparent",
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 999,
            padding: "9px 18px",
            fontFamily: sans,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: C.inkMid,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.goldLight;
            e.currentTarget.style.borderColor = C.gold;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = C.goldBorder;
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      {/* ── Form card ── */}
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}
        >
          {/* Card header */}
          <div
            style={{
              background: C.goldLight,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: C.gold,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={22} color="#fff" strokeWidth={1.8} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: serif,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Account Details
              </h2>
              <p style={{ margin: 0, fontSize: "0.78rem", color: C.inkSoft }}>
                Fill in the basic credentials for the new user
              </p>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
            {errorMsg && (
              <div
                style={{
                  background: "#fdf0ee",
                  border: `1px solid ${C.danger}`,
                  color: C.danger,
                  padding: "12px 16px",
                  borderRadius: 10,
                  marginBottom: 20,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ShieldAlert size={18} /> {errorMsg}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Full Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: C.inkMid,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Full Name <span style={{ color: C.danger }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={18}
                    color={focusedField === "fullName" ? C.goldDark : C.inkSoft}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      transition: "color 0.2s",
                    }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmad Al-Dimashqi"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("fullName")}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: C.inkMid,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Email Address <span style={{ color: C.danger }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={18}
                    color={focusedField === "email" ? C.goldDark : C.inkSoft}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      transition: "color 0.2s",
                    }}
                  />
                  <input
                    type="email"
                    required
                    dir="ltr"
                    placeholder="e.g. ahmad@library.com"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("email")}
                  />
                </div>
              </div>

              {/* UserName */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: C.inkMid,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Username <span style={{ color: C.danger }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color:
                        focusedField === "userName" ? C.goldDark : C.inkSoft,
                      fontWeight: "bold",
                    }}
                  >
                    @
                  </span>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="ahmad"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        userName: e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                      })
                    }
                    onFocus={() => setFocusedField("userName")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("userName")}
                  />
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.72rem",
                    color: C.inkSoft,
                  }}
                >
                  Only English letters and numbers allowed. No spaces.
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: C.inkMid,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Temporary Password <span style={{ color: C.danger }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={18}
                    color={focusedField === "password" ? C.goldDark : C.inkSoft}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      transition: "color 0.2s",
                    }}
                  />
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="StrongPassword123!"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("password")}
                  />
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.72rem",
                    color: C.inkSoft,
                  }}
                >
                  Provide this password to the user. They can change it later.
                </p>
              </div>

              {/* Info note about roles */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  background: C.goldMid,
                  border: `1px solid ${C.goldBorder}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <Info
                  size={18}
                  color={C.goldDark}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.78rem",
                    color: C.inkMid,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: C.goldDark }}>Note on Roles:</strong>{" "}
                  By default, this user will be assigned the{" "}
                  <span
                    style={{
                      background: C.surface,
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: `1px solid ${C.goldBorder}`,
                    }}
                  >
                    User
                  </span>{" "}
                  role. After creation, you can upgrade them to{" "}
                  <span
                    style={{
                      background: C.surface,
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: `1px solid ${C.goldBorder}`,
                    }}
                  >
                    Librarian
                  </span>{" "}
                  or{" "}
                  <span
                    style={{
                      background: C.surface,
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: `1px solid ${C.goldBorder}`,
                    }}
                  >
                    Admin
                  </span>{" "}
                  from the User Management table.
                </p>
              </div>
            </div>

            {/* ── Submit ── */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 22,
                borderTop: `1.5px solid ${C.goldBorder}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  background: "transparent",
                  border: `1.5px solid ${C.goldBorder}`,
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontFamily: sans,
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: C.inkMid,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !formData.email.trim()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: success
                    ? "#edf7ee"
                    : isSubmitting
                    ? C.goldBorder
                    : C.gold,
                  color: success ? "#2d6e3a" : "#fff",
                  border: success ? "1.5px solid rgba(45,110,58,0.3)" : "none",
                  borderRadius: 10,
                  padding: "10px 24px",
                  fontFamily: sans,
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor:
                    isSubmitting || !formData.email.trim()
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    success || isSubmitting
                      ? "none"
                      : "0 2px 12px rgba(200,169,110,0.35)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && formData.email.trim() && !success)
                    e.currentTarget.style.background = C.goldDark;
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && formData.email.trim() && !success)
                    e.currentTarget.style.background = C.gold;
                }}
              >
                <Save size={16} />
                {isSubmitting
                  ? "Creating..."
                  : success
                  ? "✓ User Created!"
                  : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
