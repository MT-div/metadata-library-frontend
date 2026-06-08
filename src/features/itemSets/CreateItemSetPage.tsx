import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateItemSetCommand } from "../../types/metadata";
import { Save, FolderPlus, Globe, Lock, Info, ArrowLeft } from "lucide-react";

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

export const CreateItemSetPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateItemSetCommand>({
    title: "",
    description: "",
    isPublic: true,
    ownerId: 1, // TODO: replace with current authenticated user's id
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/itemsets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({
            title: "",
            description: "",
            isPublic: true,
            ownerId: 1,
          });
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${focusedField === field ? C.gold : C.goldBorder}`,
    borderRadius: 10,
    padding: "11px 14px",
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
            Admin · Collections
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
            New Collection
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Collections organize items into logical groups or categories.
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
              <FolderPlus size={22} color="#fff" strokeWidth={1.8} />
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
                Collection Details
              </h2>
              <p style={{ margin: 0, fontSize: "0.78rem", color: C.inkSoft }}>
                Fill in the information below to create a new collection
              </p>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Title */}
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
                  Title <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Andalusian Manuscripts"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("title")}
                />
              </div>

              {/* Description */}
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
                  Description
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: "0.7rem",
                      fontWeight: 400,
                      color: C.inkSoft,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (optional)
                  </span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed description of this collection's contents..."
                  value={formData.description ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle("description"),
                    resize: "none",
                    lineHeight: 1.6,
                  }}
                />
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.72rem",
                    color: C.inkSoft,
                  }}
                >
                  {(formData.description ?? "").length} characters
                </p>
              </div>

              {/* Visibility toggle — card style */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: C.inkMid,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Visibility
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {/* Public option */}
                  <div
                    onClick={() => setFormData({ ...formData, isPublic: true })}
                    style={{
                      border: `2px solid ${
                        formData.isPublic ? C.gold : C.goldBorder
                      }`,
                      background: formData.isPublic ? C.goldLight : C.bg,
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Globe
                        size={18}
                        color={formData.isPublic ? C.gold : C.inkSoft}
                      />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: formData.isPublic ? C.goldDark : C.inkMid,
                        }}
                      >
                        Public
                      </span>
                      {formData.isPublic && (
                        <span
                          style={{
                            marginLeft: "auto",
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: C.gold,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            color: "#fff",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: C.inkSoft,
                        lineHeight: 1.4,
                      }}
                    >
                      Visible to all library visitors
                    </p>
                  </div>

                  {/* Private option */}
                  <div
                    onClick={() =>
                      setFormData({ ...formData, isPublic: false })
                    }
                    style={{
                      border: `2px solid ${
                        !formData.isPublic ? C.gold : C.goldBorder
                      }`,
                      background: !formData.isPublic ? C.goldLight : C.bg,
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Lock
                        size={18}
                        color={!formData.isPublic ? C.gold : C.inkSoft}
                      />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: !formData.isPublic ? C.goldDark : C.inkMid,
                        }}
                      >
                        Private
                      </span>
                      {!formData.isPublic && (
                        <span
                          style={{
                            marginLeft: "auto",
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: C.gold,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            color: "#fff",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: C.inkSoft,
                        lineHeight: 1.4,
                      }}
                    >
                      Only visible to administrators
                    </p>
                  </div>
                </div>
              </div>

              {/* Info note */}
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
                  size={15}
                  color={C.gold}
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
                  You can add items to this collection after it's created from
                  the
                  <strong style={{ color: C.goldDark }}>
                    {" "}
                    Manage Collections
                  </strong>{" "}
                  page.
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
                disabled={isSubmitting || !formData.title.trim()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: success
                    ? "#edf7ee"
                    : isSubmitting || !formData.title.trim()
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
                    isSubmitting || !formData.title.trim()
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    success || isSubmitting
                      ? "none"
                      : "0 2px 12px rgba(200,169,110,0.35)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && formData.title.trim() && !success)
                    e.currentTarget.style.background = C.goldDark;
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && formData.title.trim() && !success)
                    e.currentTarget.style.background = C.gold;
                }}
              >
                <Save size={16} />
                {isSubmitting
                  ? "Saving..."
                  : success
                  ? "✓ Collection Created!"
                  : "Create Collection"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
