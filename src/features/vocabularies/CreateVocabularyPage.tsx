// src/features/vocabularies/CreateVocabularyPage.tsx
import {
  useState,
  type FormEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { api } from "../../services/api";
import { Save, BookOpen, ArrowLeft, Info, ExternalLink } from "lucide-react";
import type { CreateVocabularyCommand } from "../../types/vocabulary.types";

const FieldLabel = ({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) => (
  <label
    style={{
      display: "block",
      fontSize: "0.72rem",
      fontWeight: 700,
      color: C.inkMid,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      marginBottom: 8,
      fontFamily: fonts.sans,
    }}
  >
    {children}
    {required && <span style={{ color: C.danger, marginLeft: 4 }}>*</span>}
  </label>
);

export const CreateVocabularyPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateVocabularyCommand>({
    prefix: "",
    namespaceUri: "",
    label: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const uriPreview = formData.prefix
    ? `https://purl.org/${formData.prefix.toLowerCase()}/terms/`
    : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post("/api/vocabularies", formData);

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({ prefix: "", namespaceUri: "", label: "" });
          setSuccess(false);
        }, 2200);
      }
    } catch (e) {
      console.error("Error creating vocabulary:", e);
      alert("حدث خطأ أثناء حفظ القاموس، تأكد من الكونسول.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (id: string): CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${focused === id ? C.gold : C.goldBorder}`,
    borderRadius: 10,
    padding: "10px 14px",
    fontFamily: fonts.sans,
    fontSize: "0.88rem",
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
            Admin · Metadata
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
            New Vocabulary
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Register a new metadata vocabulary (e.g. Dublin Core, Schema.org).
          </p>
        </div>

        <OutlineBtn onClick={() => navigate(-1)} rounded>
          <ArrowLeft size={15} /> Back
        </OutlineBtn>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
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
              <BookOpen size={22} color="#fff" strokeWidth={1.8} />
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
                Vocabulary Details
              </h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: C.inkSoft }}>
                Define a new metadata namespace for the library schema
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Label */}
              <div>
                <FieldLabel required>Display Label</FieldLabel>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dublin Core"
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
                  Human-readable name shown in the admin interface
                </p>
              </div>

              {/* Prefix */}
              <div>
                <FieldLabel required>Prefix</FieldLabel>
                <input
                  type="text"
                  required
                  placeholder="e.g. dc"
                  value={formData.prefix}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      prefix: e.target.value.toLowerCase(),
                    }))
                  }
                  onFocus={() => setFocused("prefix")}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...inputStyle("prefix"),
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                  }}
                  dir="ltr"
                />
                {formData.prefix && (
                  <div
                    style={{
                      marginTop: 7,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        background: C.goldMid,
                        color: C.goldDark,
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        padding: "3px 12px",
                        borderRadius: 999,
                        border: `1px solid ${C.goldBorder}`,
                      }}
                    >
                      {formData.prefix}:term
                    </span>
                    <span style={{ fontSize: "0.72rem", color: C.inkSoft }}>
                      preview of how properties will appear
                    </span>
                  </div>
                )}
              </div>

              {/* Namespace URI */}
              <div>
                <FieldLabel required>Namespace URI</FieldLabel>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.namespaceUri}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, namespaceUri: e.target.value }))
                  }
                  onFocus={() => setFocused("uri")}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...inputStyle("uri"),
                    fontFamily: "monospace",
                    fontSize: "0.82rem",
                  }}
                  dir="ltr"
                />
                {uriPreview && !formData.namespaceUri && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, namespaceUri: uriPreview }))
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
                      fontFamily: fonts.sans,
                      padding: 0,
                    }}
                  >
                    <Info size={11} /> Suggested:{" "}
                    <span style={{ fontFamily: "monospace" }}>
                      {uriPreview}
                    </span>
                  </button>
                )}
                {formData.namespaceUri && (
                  <a
                    href={formData.namespaceUri}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: "0.72rem",
                      color: C.gold,
                      fontFamily: "monospace",
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={11} /> {formData.namespaceUri}
                  </a>
                )}
              </div>

              {/* Well-known vocabularies hint */}
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
                <div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: "0.78rem",
                      color: C.inkMid,
                      fontWeight: 600,
                    }}
                  >
                    Common vocabularies:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[
                      {
                        label: "Dublin Core",
                        prefix: "dc",
                        uri: "http://purl.org/dc/elements/1.1/",
                      },
                      {
                        label: "Schema.org",
                        prefix: "schema",
                        uri: "https://schema.org/",
                      },
                      {
                        label: "FOAF",
                        prefix: "foaf",
                        uri: "http://xmlns.com/foaf/0.1/",
                      },
                    ].map((v) => (
                      <button
                        key={v.prefix}
                        type="button"
                        onClick={() =>
                          setFormData({
                            label: v.label,
                            prefix: v.prefix,
                            namespaceUri: v.uri,
                          })
                        }
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.goldBorder}`,
                          borderRadius: 999,
                          padding: "3px 10px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: C.inkMid,
                          cursor: "pointer",
                          fontFamily: "monospace",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.goldLight;
                          e.currentTarget.style.borderColor = C.gold;
                          e.currentTarget.style.color = C.goldDark;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = C.surface;
                          e.currentTarget.style.borderColor = C.goldBorder;
                          e.currentTarget.style.color = C.inkMid;
                        }}
                      >
                        {v.prefix}:
                      </button>
                    ))}
                  </div>
                </div>
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
              <OutlineBtn type="button" onClick={() => navigate(-1)}>
                Cancel
              </OutlineBtn>

              <GoldBtn
                type="submit"
                disabled={isSubmitting}
                success={success}
                style={{ padding: "10px 24px", fontSize: "0.88rem" }}
              >
                <Save size={15} />
                {isSubmitting
                  ? "Saving..."
                  : success
                  ? "✓ Vocabulary Saved!"
                  : "Save Vocabulary"}
              </GoldBtn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
