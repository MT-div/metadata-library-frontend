// src/features/librarian/CreatePatronPage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import type { CreatePatronCommand } from "../../types/patron.types";
import { UserPlus, Save, ArrowLeft, Loader2, Info } from "lucide-react";

export const CreatePatronPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // نستلم مسار العودة إن وُجد (الذكاء الاصطناعي في الـ UX)
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
      const res = await api.post("/api/Patrons", formData);
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${C.goldBorder}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontFamily: fonts.sans,
    fontSize: "0.9rem",
    color: C.ink,
    background: C.surface,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ fontFamily: fonts.sans, color: C.ink }}>
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
            Librarian · Registration
          </p>
          <h1
            style={{
              fontFamily: fonts.serif,
              fontSize: "1.8rem",
              fontWeight: 800,
              color: C.ink,
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Register New Patron
          </h1>
        </div>

        <OutlineBtn onClick={() => navigate(returnTo)} rounded>
          <ArrowLeft size={15} /> Back
        </OutlineBtn>
      </div>

      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
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
                fontFamily: fonts.serif,
                fontSize: "1.05rem",
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              Patron Details
            </h2>
            <p style={{ margin: 0, fontSize: "0.78rem", color: C.inkSoft }}>
              Register a library card for a new visitor.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
          {errorMsg && (
            <div
              style={{
                background: "#fff5f5",
                border: `1px solid ${C.danger}`,
                color: C.danger,
                padding: "12px 16px",
                borderRadius: 10,
                marginBottom: 20,
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: C.inkMid,
                  marginBottom: 6,
                }}
              >
                Full Name <span style={{ color: C.danger }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                style={inputStyle}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: C.inkMid,
                  marginBottom: 6,
                }}
              >
                National ID / Student ID{" "}
                <span style={{ color: C.danger }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nationalId}
                onChange={(e) =>
                  setFormData({ ...formData, nationalId: e.target.value })
                }
                style={{ ...inputStyle, fontFamily: "monospace" }}
                placeholder="e.g. 0123456789"
              />
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.72rem",
                  color: C.inkSoft,
                }}
              >
                This will be used as the Patron ID for checking out books.
              </p>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: C.inkMid,
                  marginBottom: 6,
                }}
              >
                Phone Number <span style={{ color: C.danger }}>*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                style={{ ...inputStyle, fontFamily: "monospace" }}
                placeholder="+1234567890"
                dir="ltr"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: C.inkMid,
                  marginBottom: 6,
                }}
              >
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                style={inputStyle}
                placeholder="john@example.com"
                dir="ltr"
              />
            </div>

            {location.state?.returnTo && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  background: C.goldMid,
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  color: C.inkMid,
                }}
              >
                <Info size={16} color={C.goldDark} /> You will be redirected
                back to the Circulation Desk after saving.
              </div>
            )}
          </div>

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
            <GoldBtn
              type="submit"
              disabled={isSubmitting}
              style={{ padding: "12px 24px", fontSize: "0.9rem" }}
            >
              {isSubmitting ? (
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Save size={16} />
              )}{" "}
              Register Patron
            </GoldBtn>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
