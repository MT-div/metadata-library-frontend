// src/features/templates/CreateTemplatePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { api } from "../../services/api";
import type {
  CreateResourceTemplateCommand,
  TemplatePropertyRequest,
} from "../../types/template.types";
import type { VocabularyResponse } from "../../types/vocabulary.types";
import {
  Save,
  LayoutTemplate,
  Plus,
  Trash2,
  ArrowLeft,
  Info,
  GripVertical,
} from "lucide-react";

type AvailableProperty = {
  id: number;
  label: string;
  vocabularyPrefix: string;
  localName: string;
};

// ── Shared sub-components ────────────────────────────────────────────────────
const FieldLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
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

const StepHeader = ({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle: string;
}) => (
  <div
    style={{
      background: C.goldLight,
      borderBottom: `1.5px solid ${C.goldBorder}`,
      padding: "14px 24px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: C.gold,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.serif,
        fontWeight: 800,
        fontSize: "0.9rem",
        color: "#fff",
      }}
    >
      {step}
    </div>
    <div>
      <h2
        style={{
          fontFamily: fonts.serif,
          fontSize: "0.92rem",
          fontWeight: 700,
          color: C.ink,
          margin: 0,
        }}
      >
        {title}
      </h2>
      <p style={{ margin: 0, fontSize: "0.72rem", color: C.inkSoft }}>
        {subtitle}
      </p>
    </div>
  </div>
);

const selectStyle: React.CSSProperties = {
  width: "100%",
  appearance: "none",
  background: C.surface,
  border: `1.5px solid ${C.goldBorder}`,
  borderRadius: 10,
  padding: "10px 32px 10px 14px",
  fontFamily: fonts.sans,
  fontSize: "0.85rem",
  color: C.ink,
  outline: "none",
  cursor: "pointer",
  transition: "border-color 0.2s",
};

// ─────────────────────────────────────────────────────────────────────────────
export const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const [templateData, setTemplateData] =
    useState<CreateResourceTemplateCommand>({ label: "", description: "" });
  const [selectedProperties, setSelectedProperties] = useState<
    TemplatePropertyRequest[]
  >([]);
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [selectedVocabId, setSelectedVocabId] = useState<number>(0);
  const [availableProps, setAvailableProps] = useState<AvailableProperty[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [propCache, setPropCache] = useState<Record<number, string>>({});

  useEffect(() => {
    api
      .get("/api/vocabularies")
      .then((res) => {
        const data = res.data;
        setVocabularies(data);
        if (data.length > 0) setSelectedVocabId(data[0].id);
      })
      .catch((err) => console.error("Error fetching vocabularies:", err));
  }, []);

  useEffect(() => {
    if (!selectedVocabId) return;

    api
      .get(`/api/properties/by-vocabulary/${selectedVocabId}`)
      .then((res) => {
        const data = res.data;
        setAvailableProps(data);
        setSelectedPropId(data.length > 0 ? data[0].id : 0);

        const entries: Record<number, string> = {};
        data.forEach((p: AvailableProperty) => {
          entries[p.id] = p.label;
        });
        setPropCache((prev) => ({ ...prev, ...entries }));
      })
      .catch((err) => console.error("Error fetching properties:", err));
  }, [selectedVocabId]);

  const handleAddProperty = () => {
    if (!selectedPropId) return;
    if (selectedProperties.some((p) => p.propertyId === selectedPropId)) {
      alert("This property is already added.");
      return;
    }
    setSelectedProperties((prev) => [
      ...prev,
      {
        propertyId: selectedPropId,
        isRequired: false,
        displayOrder: prev.length + 1,
        alternateLabel: "",
      },
    ]);
  };

  const handleRemove = (id: number) =>
    setSelectedProperties((prev) =>
      prev
        .filter((p) => p.propertyId !== id)
        .map((p, i) => ({ ...p, displayOrder: i + 1 }))
    );

  const handleToggle = (id: number) =>
    setSelectedProperties((prev) =>
      prev.map((p) =>
        p.propertyId === id ? { ...p, isRequired: !p.isRequired } : p
      )
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProperties.length === 0) {
      alert("Add at least one property to the template.");
      return;
    }
    setIsSubmitting(true);
    try {
      const createRes = await api.post("/api/resource-templates", templateData);
      const createdId = createRes.data.id ?? createRes.data;

      await api.put(`/api/resource-templates/${createdId}/properties`, {
        templateId: createdId,
        properties: selectedProperties,
      });

      setSuccess(true);
      setTimeout(() => {
        setTemplateData({ label: "", description: "" });
        setSelectedProperties([]);
        setSuccess(false);
      }, 2200);
    } catch (err) {
      console.error("Error creating template:", err);
      alert("حدث خطأ أثناء حفظ القالب. راجع الكونسول.");
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
            Admin · Templates
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
            Build New Template
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Define a template and select which metadata fields it includes.
          </p>
        </div>

        <OutlineBtn onClick={() => navigate(-1)} rounded>
          <ArrowLeft size={15} /> Back
        </OutlineBtn>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 740,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* ── Card 1: Basic info ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <StepHeader
            step="1"
            title="Template Info"
            subtitle="Name and describe the template"
          />
          <div
            style={{
              padding: "22px 24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <FieldLabel required>Template Name</FieldLabel>
              <input
                type="text"
                required
                placeholder="e.g. Printed Book"
                value={templateData.label}
                onChange={(e) =>
                  setTemplateData((p) => ({ ...p, label: e.target.value }))
                }
                onFocus={() => setFocused("label")}
                onBlur={() => setFocused(null)}
                style={inputStyle("label")}
              />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <input
                type="text"
                placeholder="Optional description..."
                value={templateData.description ?? ""}
                onChange={(e) =>
                  setTemplateData((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                onFocus={() => setFocused("desc")}
                onBlur={() => setFocused(null)}
                style={inputStyle("desc")}
              />
            </div>
          </div>
        </div>

        {/* ── Card 2: Add properties ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <StepHeader
            step="2"
            title="Add Fields"
            subtitle="Choose vocabulary → property, then click Add"
          />
          <div style={{ padding: "20px 24px" }}>
            {/* Cascading selects + button */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 12,
                alignItems: "flex-end",
                background: C.bg,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 12,
                padding: "16px",
              }}
            >
              {/* Vocab */}
              <div>
                <FieldLabel>Vocabulary</FieldLabel>
                <div style={{ position: "relative" }}>
                  <select
                    style={selectStyle}
                    value={selectedVocabId}
                    onChange={(e) => setSelectedVocabId(Number(e.target.value))}
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
                      right: 10,
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
              </div>

              {/* Property */}
              <div>
                <FieldLabel>Property</FieldLabel>
                <div style={{ position: "relative" }}>
                  <select
                    style={{
                      ...selectStyle,
                      opacity: availableProps.length === 0 ? 0.5 : 1,
                    }}
                    value={selectedPropId}
                    onChange={(e) => setSelectedPropId(Number(e.target.value))}
                    disabled={availableProps.length === 0}
                  >
                    {availableProps.length === 0 ? (
                      <option>No properties in this vocabulary</option>
                    ) : (
                      availableProps.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label} ({p.vocabularyPrefix}:{p.localName})
                        </option>
                      ))
                    )}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: 10,
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
              </div>

              <GoldBtn
                type="button"
                onClick={handleAddProperty}
                disabled={!selectedPropId || availableProps.length === 0}
                style={{
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                }}
              >
                <Plus size={15} /> Add Field
              </GoldBtn>
            </div>

            {/* Validation hint */}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.72rem",
                color: C.inkSoft,
              }}
            >
              <Info size={12} color={C.gold} />
              At least one field is required to save the template.
            </div>
          </div>
        </div>

        {/* ── Card 3: Fields list ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              background: C.goldLight,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LayoutTemplate size={16} color={C.gold} />
              <h2
                style={{
                  fontFamily: fonts.serif,
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Template Fields
              </h2>
            </div>
            <span
              style={{
                background: C.goldMid,
                color: C.goldDark,
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
                border: `1px solid ${C.goldBorder}`,
              }}
            >
              {selectedProperties.length} field
              {selectedProperties.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={{ padding: "18px 24px" }}>
            {selectedProperties.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  background: C.bg,
                  borderRadius: 12,
                  border: `1.5px dashed ${C.goldBorder}`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: C.goldLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <LayoutTemplate size={22} color={C.gold} strokeWidth={1.5} />
                </div>
                <p
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: "0.95rem",
                    color: C.inkMid,
                    margin: "0 0 4px",
                  }}
                >
                  No fields added yet
                </p>
                <p style={{ fontSize: "0.78rem", color: C.inkSoft, margin: 0 }}>
                  Use the section above to select and add properties.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedProperties.map((prop, idx) => {
                  const label =
                    propCache[prop.propertyId] ??
                    `Property #${prop.propertyId}`;
                  return (
                    <div
                      key={prop.propertyId}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "28px 28px 1fr auto auto",
                        alignItems: "center",
                        gap: 10,
                        background: C.bg,
                        border: `1.5px solid ${C.goldBorder}`,
                        borderRadius: 12,
                        padding: "11px 14px",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          C.gold;
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 2px 10px rgba(200,169,110,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          C.goldBorder;
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "none";
                      }}
                    >
                      {/* Order */}
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: C.goldLight,
                          border: `1px solid ${C.goldBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: C.goldDark,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>

                      {/* Grip */}
                      <GripVertical
                        size={15}
                        color={C.inkSoft}
                        style={{ cursor: "grab", flexShrink: 0 }}
                      />

                      {/* Label */}
                      <span
                        style={{
                          fontFamily: fonts.serif,
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: C.ink,
                        }}
                      >
                        {label}
                      </span>

                      {/* Required toggle */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          onClick={() => handleToggle(prop.propertyId)}
                          style={{
                            width: 34,
                            height: 18,
                            borderRadius: 999,
                            background: prop.isRequired ? C.gold : C.goldBorder,
                            position: "relative",
                            transition: "background 0.2s",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 2,
                              left: prop.isRequired ? 17 : 2,
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: "#fff",
                              transition: "left 0.2s",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            color: prop.isRequired ? C.goldDark : C.inkSoft,
                          }}
                        >
                          {prop.isRequired ? "Required" : "Optional"}
                        </span>
                      </label>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemove(prop.propertyId)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          background: C.dangerBg,
                          border: "none",
                          color: C.danger,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.7")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Submit buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 4,
          }}
        >
          <OutlineBtn type="button" onClick={() => navigate(-1)}>
            Cancel
          </OutlineBtn>

          <GoldBtn
            type="submit"
            disabled={isSubmitting}
            success={success}
            style={{ padding: "10px 28px", fontSize: "0.9rem" }}
          >
            <Save size={16} />
            {isSubmitting
              ? "Saving..."
              : success
              ? "✓ Template Created!"
              : "Save Template"}
          </GoldBtn>
        </div>
      </form>
    </div>
  );
};
