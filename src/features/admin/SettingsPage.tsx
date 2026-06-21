import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import {
  Save,
  Clock,
  Info,
  Sliders,
  Shield,
  Loader2,
  CheckCircle2,
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
  dangerBg: "#fdf0ee",
  success: "#2d6e3a",
  successBg: "#edf7ee",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

export const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Settings State ──
  const [borrowDays, setBorrowDays] = useState<string>("14");

  // حالة نحفظ فيها القيمة الأصلية لمعرفة هل تم التعديل أم لا
  const [originalBorrowDays, setOriginalBorrowDays] = useState<string>("14");

  useEffect(() => {
    // جلب الإعدادات عند تحميل الصفحة
    const loadSettings = async () => {
      try {
        // نفترض وجود GET /api/system-settings/{key}
        const res = await api.get("/api/system-settings/GlobalBorrowDays");

        // إذا كان الرد عبارة عن كائن { value: "14" } أو نص مباشر "14"
        const val = typeof res.data === "object" ? res.data.value : res.data;
        if (val) {
          setBorrowDays(val.toString());
          setOriginalBorrowDays(val.toString());
        }
      } catch (err: unknown) {
        console.error("Error loading settings:", err);
        // إذا لم يكن الإعداد موجوداً بعد في الداتا بيز (404)، نبقيه 14 كافتراضي
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const hasChanges = borrowDays !== originalBorrowDays;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // إرسال القيمة كـ JSON String كما يطلب الـ Swagger: Schema "string"
      await api.put(
        "/api/system-settings/GlobalBorrowDays",
        JSON.stringify(borrowDays.toString()),
        { headers: { "Content-Type": "application/json" } }
      );

      setSaveSuccess(true);
      setOriginalBorrowDays(borrowDays); // تحديث القيمة الأصلية لتطابق الجديدة
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Error saving settings:", err);
      if (err instanceof AxiosError && err.response) {
        alert(err.response.data || "Failed to save settings.");
      } else {
        alert("Network error while saving settings.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          color: C.gold,
        }}
      >
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
      {/* ── Page Header ── */}
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
            Admin · Configuration
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
            System Settings
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Configure global rules, library policies, and system defaults.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 32,
          maxWidth: 800,
        }}
      >
        {/* ── Circulation Policies Section ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              background: C.goldLight,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Clock size={18} color={C.goldDark} />
            <h2
              style={{
                fontFamily: serif,
                fontSize: "1.05rem",
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              Circulation Policies
            </h2>
          </div>

          <form onSubmit={handleSave} style={{ padding: "24px" }}>
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: C.inkMid,
                  marginBottom: 8,
                }}
              >
                Global Default Borrowing Period (Days)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={borrowDays}
                  onChange={(e) => setBorrowDays(e.target.value)}
                  style={{
                    width: 120,
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${hasChanges ? C.gold : C.goldBorder}`,
                    fontSize: "1.1rem",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: C.ink,
                    outline: "none",
                    transition: "all 0.2s",
                    background: hasChanges ? C.goldLight : C.bg,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: C.inkSoft,
                    fontWeight: 500,
                  }}
                >
                  Days
                </span>
              </div>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.75rem",
                  color: C.inkSoft,
                  lineHeight: 1.5,
                }}
              >
                This is the fallback duration for checking out items. If a{" "}
                <strong>Resource Template</strong> has a specific{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    background: C.bg,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  DefaultBorrowDays
                </span>
                , it will override this global setting.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                background: C.goldMid,
                border: `1px solid ${C.goldBorder}`,
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 24,
              }}
            >
              <Info
                size={16}
                color={C.goldDark}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: C.inkMid,
                  lineHeight: 1.5,
                }}
              >
                Changes applied here will immediately affect all{" "}
                <strong>new checkouts</strong>. Existing active loans will not
                be modified.
              </p>
            </div>

            {/* Actions */}
            <div
              style={{
                borderTop: `1.5px solid ${C.goldBorder}`,
                paddingTop: 20,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="submit"
                disabled={!hasChanges || isSaving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: saveSuccess
                    ? C.successBg
                    : !hasChanges || isSaving
                    ? C.goldLight
                    : C.gold,
                  color: saveSuccess
                    ? C.success
                    : !hasChanges || isSaving
                    ? C.inkSoft
                    : "#fff",
                  border: saveSuccess
                    ? `1.5px solid rgba(45,110,58,0.3)`
                    : "none",
                  borderRadius: 10,
                  padding: "12px 28px",
                  fontFamily: sans,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: !hasChanges || isSaving ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    saveSuccess || !hasChanges || isSaving
                      ? "none"
                      : "0 4px 12px rgba(200,169,110,0.3)",
                }}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Save size={16} />
                )}
                {isSaving
                  ? "Saving..."
                  : saveSuccess
                  ? "Saved Successfully!"
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Future Settings Placeholder ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            opacity: 0.6,
          }}
        >
          <div
            style={{
              background: C.bg,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Shield size={18} color={C.inkSoft} />
            <h2
              style={{
                fontFamily: serif,
                fontSize: "1.05rem",
                fontWeight: 700,
                color: C.inkSoft,
                margin: 0,
              }}
            >
              Security & Access (Coming Soon)
            </h2>
          </div>
          <div style={{ padding: "32px 24px", textAlign: "center" }}>
            <Sliders
              size={32}
              color={C.goldBorder}
              style={{ margin: "0 auto 12px" }}
            />
            <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
              Configuration for authentication rules, session timeouts, and
              external identity providers will be available here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
