// src/features/items/CreateItemPage.tsx
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { useCreateItem } from "../../hooks/itemsHooks/useCreateItem";
import {
  Save,
  Loader2,
  FileText,
  ArrowLeft,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

export const CreateItemPage = () => {
  const navigate = useNavigate();
  const {
    templates,
    selectedTemplateId,
    loading,
    isSubmitting,
    success,
    formData,
    setFormData,
    focusedField,
    setFocusedField,
    handleTemplateChange,
    handleSubmit,
    selectedTemplate,
    sortedProps,
    filledCount,
    totalRequired,
  } = useCreateItem();

  const inputStyle = (id: number | string): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${focusedField === id ? C.gold : C.goldBorder}`,
    borderRadius: 10,
    padding: "10px 14px",
    fontFamily: fonts.sans,
    fontSize: "0.88rem",
    color: C.ink,
    background: C.surface,
    outline: "none",
    transition: "border-color 0.2s",
  });

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 240,
          color: C.gold,
          fontFamily: fonts.sans,
        }}
      >
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

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
            Admin · Items
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
            Add New Item
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Choose a template, then fill in the metadata fields.
          </p>
        </div>

        <OutlineBtn onClick={() => navigate(-1)} rounded>
          <ArrowLeft size={15} /> Back
        </OutlineBtn>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        {/* ── Step 1: Template selector ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            marginBottom: 20,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: C.goldLight,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.gold,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.serif,
                fontWeight: 800,
                fontSize: "0.95rem",
                color: "#fff",
              }}
            >
              1
            </div>
            <div>
              <h2
                style={{
                  fontFamily: fonts.serif,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Choose a Template
              </h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: C.inkSoft }}>
                The template determines which metadata fields will appear
              </p>
            </div>
          </div>

          <div style={{ padding: "20px 24px" }}>
            {/* Template cards */}
            {templates.length === 0 ? (
              <p
                style={{
                  color: C.inkSoft,
                  fontStyle: "italic",
                  fontSize: "0.88rem",
                }}
              >
                No templates available.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))",
                  gap: 10,
                }}
              >
                {templates.map((t) => {
                  const isActive = t.id === selectedTemplateId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange(String(t.id))}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        cursor: "pointer",
                        border: `2px solid ${isActive ? C.gold : C.goldBorder}`,
                        background: isActive ? C.goldLight : C.bg,
                        transition: "all 0.15s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = "#f5f0e8";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = C.bg;
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                        }}
                      >
                        <FileText
                          size={18}
                          color={isActive ? C.gold : C.inkSoft}
                          strokeWidth={1.5}
                        />
                        {isActive && (
                          <span
                            style={{
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
                          margin: "8px 0 3px",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: isActive ? C.goldDark : C.ink,
                        }}
                      >
                        {t.label}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.7rem",
                          color: C.inkSoft,
                        }}
                      >
                        {t.properties?.length ?? 0} fields
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected template description */}
            {selectedTemplate?.description && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: C.goldMid,
                  border: `1px solid ${C.goldBorder}`,
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  color: C.inkMid,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <ChevronRight
                  size={13}
                  color={C.gold}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                {selectedTemplate.description}
              </div>
            )}
          </div>
        </div>

        {/* ── Step 2: Dynamic form ── */}
        {selectedTemplate && (
          <div
            style={{
              background: C.surface,
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: C.goldLight,
                borderBottom: `1.5px solid ${C.goldBorder}`,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: C.gold,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: fonts.serif,
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "#fff",
                  }}
                >
                  2
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: fonts.serif,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: C.ink,
                      margin: 0,
                    }}
                  >
                    Fill in: {selectedTemplate.label}
                  </h2>
                  <p
                    style={{ margin: 0, fontSize: "0.72rem", color: C.inkSoft }}
                  >
                    {filledCount} of {sortedProps.length} fields filled
                    {totalRequired > 0 && ` · ${totalRequired} required`}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: 120,
                  height: 6,
                  background: C.goldBorder,
                  borderRadius: 999,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 999,
                    background: C.gold,
                    width: `${
                      sortedProps.length
                        ? (filledCount / sortedProps.length) * 100
                        : 0
                    }%`,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 18,
                }}
              >
                {sortedProps.map((prop) => (
                  <div key={prop.propertyId}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: C.inkMid,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        marginBottom: 7,
                      }}
                    >
                      {prop.propertyLabel}
                      {prop.isRequired && (
                        <span style={{ color: C.danger, fontSize: "0.78rem" }}>
                          *
                        </span>
                      )}
                      {!prop.isRequired && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 400,
                            color: C.inkSoft,
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          optional
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData[prop.propertyId] ?? ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          [prop.propertyId]: e.target.value,
                        }))
                      }
                      onFocus={() => setFocusedField(prop.propertyId)}
                      onBlur={() => setFocusedField(null)}
                      placeholder={`Enter ${prop.propertyLabel.toLowerCase()}...`}
                      required={prop.isRequired}
                      style={inputStyle(prop.propertyId)}
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div
                style={{
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: `1.5px solid ${C.goldBorder}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <OutlineBtn
                  type="button"
                  onClick={() => setFormData({})}
                  style={{ padding: "9px 16px", fontSize: "0.83rem" }}
                >
                  <RotateCcw size={13} /> Clear Fields
                </OutlineBtn>

                <div style={{ display: "flex", gap: 10 }}>
                  <OutlineBtn type="button" onClick={() => navigate(-1)}>
                    Cancel
                  </OutlineBtn>

                  <GoldBtn
                    type="submit"
                    disabled={isSubmitting}
                    success={success}
                    style={{ padding: "10px 26px", fontSize: "0.9rem" }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={15}
                          style={{ animation: "spin 1s linear infinite" }}
                        />{" "}
                        Saving...
                      </>
                    ) : success ? (
                      "✓ Item Saved!"
                    ) : (
                      <>
                        <Save size={15} /> Save Item
                      </>
                    )}
                  </GoldBtn>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Placeholder when no template selected */}
        {!selectedTemplate && (
          <div
            style={{
              background: C.surface,
              border: `1.5px dashed ${C.goldBorder}`,
              borderRadius: 16,
              padding: "52px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: C.goldLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <FileText size={26} color={C.gold} strokeWidth={1.5} />
            </div>
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: "1rem",
                color: C.inkMid,
                margin: "0 0 4px",
              }}
            >
              Step 2: Metadata Fields
            </p>
            <p style={{ fontSize: "0.82rem", color: C.inkSoft, margin: 0 }}>
              Select a template above to reveal the input fields.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
