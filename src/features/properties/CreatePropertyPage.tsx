import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  CreatePropertyCommand,
  VocabularyResponse,
} from "../../types/metadata";
import { Save, Tags, ArrowLeft, ExternalLink, Info } from "lucide-react";

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

// واجهة خصائص المكون FormLabel
interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}

// تم نقل المكون خارج مكون الصفحة لتجنب إعادة الإنشاء مع كل رندر
const FormLabel = ({ children, required, htmlFor }: FormLabelProps) => (
  <label
    htmlFor={htmlFor}
    style={{
      display: "block",
      fontSize: "0.72rem",
      fontWeight: 700,
      color: C.inkMid,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      marginBottom: 8,
      fontFamily: sans,
    }}
  >
    {children}
    {required && <span style={{ color: C.danger, marginLeft: 4 }}>*</span>}
  </label>
);

export const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [formData, setFormData] = useState<CreatePropertyCommand>({
    vocabularyId: 0,
    localName: "",
    label: "",
    termUri: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vocabularies")
      .then((r) => r.json())
      .then((data) => {
        setVocabularies(data);
        if (data.length > 0)
          setFormData((p) => ({ ...p, vocabularyId: data[0].id }));
      });
  }, []);

  const selectedVocab = vocabularies.find(
    (v) => v.id === formData.vocabularyId
  );

  // Auto-build termUri when vocab + localName are both filled
  const autoUri =
    selectedVocab && formData.localName
      ? `${selectedVocab.namespaceUri}${formData.localName}`
      : "";

  const handleLocalNameChange = (val: string) => {
    setFormData((p) => ({
      ...p,
      localName: val,
      termUri: selectedVocab
        ? `${selectedVocab.namespaceUri}${val}`
        : p.termUri,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({
            vocabularyId: vocabularies[0]?.id || 0,
            localName: "",
            label: "",
            termUri: "",
          });
          setSuccess(false);
        }, 2200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (id: string): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${focused === id ? C.gold : C.goldBorder}`,
    borderRadius: 10,
    padding: "10px 14px",
    fontFamily: sans,
    fontSize: "0.88rem",
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
            Admin · Metadata
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
            New Property
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Add a new metadata property and link it to a vocabulary.
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

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 18,
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
              <Tags size={22} color="#fff" strokeWidth={1.8} />
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
                Property Details
              </h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: C.inkSoft }}>
                Define a new metadata property for the library schema
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Vocabulary selector */}
              <div>
                <FormLabel htmlFor="vocabularyId">Vocabulary</FormLabel>
                <div style={{ position: "relative" }}>
                  <select
                    id="vocabularyId"
                    value={formData.vocabularyId}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        vocabularyId: Number(e.target.value),
                        termUri: "",
                      }))
                    }
                    style={{
                      width: "100%",
                      appearance: "none",
                      background: C.surface,
                      border: `1.5px solid ${C.goldBorder}`,
                      borderRadius: 10,
                      padding: "10px 36px 10px 14px",
                      fontFamily: sans,
                      fontSize: "0.88rem",
                      color: C.ink,
                      outline: "none",
                      cursor: "pointer",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = C.gold)}
                    onBlur={(e) => (e.target.style.borderColor = C.goldBorder)}
                  >
                    {vocabularies.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label} ({v.prefix})
                      </option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: C.inkSoft,
                      fontSize: 12,
                    }}
                  >
                    ▾
                  </span>
                </div>

                {/* Selected vocab namespace preview */}
                {selectedVocab && (
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: "0.72rem",
                      color: C.inkSoft,
                      fontFamily: "monospace",
                    }}
                  >
                    <ExternalLink size={11} color={C.gold} />
                    <a
                      href={selectedVocab.namespaceUri}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: C.gold, textDecoration: "none" }}
                    >
                      {selectedVocab.namespaceUri}
                    </a>
                  </div>
                )}
              </div>

              {/* Display label */}
              <div>
                <FormLabel htmlFor="label" required>
                  Display Label
                </FormLabel>
                <input
                  id="label"
                  type="text"
                  required
                  placeholder="e.g. Main Title"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, label: e.target.value }))
                  }
                  onFocus={() => setFocused("label")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("label")}
                />
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "0.72rem",
                    color: C.inkSoft,
                  }}
                >
                  Human-readable name shown in forms and tables
                </p>
              </div>

              {/* Local name */}
              <div>
                <FormLabel htmlFor="localName" required>
                  Local Name
                </FormLabel>
                <input
                  id="localName"
                  type="text"
                  required
                  placeholder="e.g. title"
                  value={formData.localName}
                  onChange={(e) => handleLocalNameChange(e.target.value)}
                  onFocus={() => setFocused("localName")}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...inputStyle("localName"),
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                  }}
                  dir="ltr"
                />
                {/* Preview computed name */}
                {selectedVocab && formData.localName && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: "6px 10px",
                      background: C.goldMid,
                      border: `1px solid ${C.goldBorder}`,
                      borderRadius: 8,
                      display: "inline-block",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      color: C.goldDark,
                    }}
                  >
                    {selectedVocab.prefix}:{formData.localName}
                  </div>
                )}
              </div>

              {/* Term URI */}
              <div>
                <FormLabel htmlFor="termUri" required>
                  Term URI
                </FormLabel>
                <input
                  id="termUri"
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.termUri}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, termUri: e.target.value }))
                  }
                  onFocus={() => setFocused("termUri")}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...inputStyle("termUri"),
                    fontFamily: "monospace",
                    fontSize: "0.82rem",
                  }}
                  dir="ltr"
                />
                {/* Auto-built hint */}
                {autoUri && autoUri !== formData.termUri && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, termUri: autoUri }))
                    }
                    style={{
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      color: C.gold,
                      fontFamily: sans,
                      padding: 0,
                    }}
                  >
                    <Info size={11} /> Use auto-generated:{" "}
                    <span style={{ fontFamily: "monospace" }}>{autoUri}</span>
                  </button>
                )}
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
                  padding: "11px 14px",
                }}
              >
                <Info
                  size={14}
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
                  After creating the property, go to the
                  <strong style={{ color: C.goldDark }}>
                    {" "}
                    Template Builder
                  </strong>{" "}
                  to add it to one or more templates.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
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
                disabled={isSubmitting}
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
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    success || isSubmitting
                      ? "none"
                      : "0 2px 12px rgba(200,169,110,0.35)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && !success)
                    e.currentTarget.style.background = C.goldDark;
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && !success)
                    e.currentTarget.style.background = C.gold;
                }}
              >
                <Save size={15} />
                {isSubmitting
                  ? "Saving..."
                  : success
                  ? "✓ Property Saved!"
                  : "Save Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
