// src/features/itemSets/CreateItemSetPage.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { useCreateItemSet } from "../../hooks/useCreateItemSet";
import { Save, FolderPlus, Globe, Lock, Info, ArrowLeft } from "lucide-react";

export const CreateItemSetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/admin/itemsets";

  // استدعاء وتفكيك الخطاف الجديد هنا
  const {
    formData,
    setFormData,
    isSubmitting,
    success,
    focusedField,
    setFocusedField,
    handleSubmit,
  } = useCreateItemSet();

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${focusedField === field ? C.gold : C.goldBorder}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontFamily: fonts.sans,
    fontSize: "0.9rem",
    color: C.ink,
    background: C.surface,
    outline: "none",
    transition: "border-color 0.2s",
  });

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
            Admin · Collections
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
            New Collection
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Collections organize items into logical groups or categories.
          </p>
        </div>

        <OutlineBtn onClick={() => navigate(-1)} rounded>
          <ArrowLeft size={15} /> Back
        </OutlineBtn>
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
                  fontFamily: fonts.serif,
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
          <form
            onSubmit={(e) =>
              handleSubmit(e, () => navigate(returnTo, { replace: true }))
            }
            style={{ padding: "28px" }}
          >
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
              <OutlineBtn type="button" onClick={() => navigate(-1)}>
                Cancel
              </OutlineBtn>

              <GoldBtn
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                success={success}
                style={{ padding: "10px 24px", fontSize: "0.88rem" }}
              >
                <Save size={16} />
                {isSubmitting
                  ? "Saving..."
                  : success
                  ? "✓ Collection Created!"
                  : "Create Collection"}
              </GoldBtn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
