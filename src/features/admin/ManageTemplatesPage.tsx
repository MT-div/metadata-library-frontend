import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutTemplate,
  Plus,
  Save,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronRight,
  GripVertical,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { api } from "../../services/api";

import type {
  ResourceTemplateResponse,
  TemplatePropertyRequest,
} from "../../types/metadata";

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

interface ExtendedTemplateResponse extends ResourceTemplateResponse {
  isDeleted?: boolean;
}

type EditableProperty = TemplatePropertyRequest & { propertyLabel?: string };
type PropertyOption = {
  id: number;
  label: string;
  vocabularyPrefix: string;
  localName: string;
};

export const ManageTemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ExtendedTemplateResponse[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );

  // Status Filter State
  const [filterStatus, setFilterStatus] = useState<
    "active" | "deleted" | "all"
  >("active");

  const [editableProps, setEditableProps] = useState<EditableProperty[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyOption[]>([]);
  const [propToAdd, setPropToAdd] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessingTpl, setIsProcessingTpl] = useState<number | null>(null);

  const selectTemplate = (
    id: number | null,
    list: ExtendedTemplateResponse[] = templates
  ) => {
    setSelectedTemplateId(id);
    if (!id) {
      setEditableProps([]);
      return;
    }
    const tpl = list.find((t) => t.id === id);
    if (tpl) {
      setEditableProps(
        [...tpl.properties]
          .map((p) => ({
            propertyId: p.propertyId,
            propertyLabel: p.propertyLabel,
            isRequired: p.isRequired,
            displayOrder: p.displayOrder,
            alternateLabel: "",
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );
    }
  };

  useEffect(() => {
    Promise.all([
      api.get("/api/resource-templates/WithDeleted").then((r) => r.data),
      api.get("/api/properties").then((r) => r.data),
    ])
      .then(([tpls, props]) => {
        setTemplates(tpls);
        setAllProperties(props);
        if (tpls.length > 0) selectTemplate(tpls[0].id, tpls);
      })
      .catch((err) => console.error("Error loading builder data:", err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const isSelectedTplDeleted = selectedTemplate?.isDeleted === true;

  // ── TEMPLATE ACTIONS (SOFT DELETE & RESTORE) ──

  const handleDeleteTemplate = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this template? (Soft Delete)")
    )
      return;

    setIsProcessingTpl(id);
    try {
      await api.delete(`/api/resource-templates/${id}`);
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDeleted: true } : t))
      );

      if (filterStatus === "active" && selectedTemplateId === id) {
        setSelectedTemplateId(null);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("An error occurred while deleting the template.");
    } finally {
      setIsProcessingTpl(null);
    }
  };

  const handleRestoreTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to restore this template?")) return;

    setIsProcessingTpl(id);
    try {
      // إرسال { id } لتطابق ה- Command وتجنب خطأ 400
      await api.put(`/api/resource-templates/Undelet/${id}`, { id: id });
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDeleted: false } : t))
      );
    } catch (error) {
      console.error("Error restoring template:", error);
      alert("An error occurred while restoring the template.");
    } finally {
      setIsProcessingTpl(null);
    }
  };

  // ── EDITOR LOGIC ──

  const recalc = (list: EditableProperty[]) =>
    setEditableProps(list.map((p, i) => ({ ...p, displayOrder: i + 1 })));

  const handleAdd = () => {
    if (!propToAdd || isSelectedTplDeleted) return;
    if (editableProps.some((p) => p.propertyId === propToAdd)) {
      alert("Property already exists in this template.");
      return;
    }
    const pd = allProperties.find((p) => p.id === propToAdd);
    recalc([
      ...editableProps,
      {
        propertyId: propToAdd,
        propertyLabel: pd?.label ?? "New Property",
        isRequired: false,
        displayOrder: editableProps.length + 1,
        alternateLabel: "",
      },
    ]);
    setPropToAdd(0);
  };

  const handleRemove = (i: number) => {
    if (isSelectedTplDeleted) return;
    recalc(editableProps.filter((_, idx) => idx !== i));
  };

  const moveUp = (i: number) => {
    if (i === 0 || isSelectedTplDeleted) return;
    const a = [...editableProps];
    [a[i - 1], a[i]] = [a[i], a[i - 1]];
    recalc(a);
  };

  const moveDown = (i: number) => {
    if (i === editableProps.length - 1 || isSelectedTplDeleted) return;
    const a = [...editableProps];
    [a[i + 1], a[i]] = [a[i], a[i + 1]];
    recalc(a);
  };

  const toggleReq = (i: number) => {
    if (isSelectedTplDeleted) return;
    const a = [...editableProps];
    a[i].isRequired = !a[i].isRequired;
    setEditableProps(a);
  };

  const handleSave = async () => {
    if (!selectedTemplateId || isSelectedTplDeleted) return;
    setIsSaving(true);
    try {
      const command = {
        templateId: selectedTemplateId,
        properties: editableProps.map((p) => ({
          propertyId: p.propertyId,
          isRequired: p.isRequired,
          displayOrder: p.displayOrder,
          alternateLabel: p.alternateLabel,
        })),
      };

      const res = await api.put(
        `/api/resource-templates/${selectedTemplateId}/properties`,
        command
      );

      if (res.status === 200 || res.status === 204) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("حدث خطأ أثناء الحفظ. تأكد من الكونسول.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── FILTER TEMPLATES ──
  const filteredTemplates = templates.filter((tpl) => {
    if (filterStatus === "active") return !tpl.isDeleted;
    if (filterStatus === "deleted") return tpl.isDeleted;
    return true;
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
            Admin · Templates
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
            Template Builder
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Manage form fields and reorder them to customize the data entry
            experience.
          </p>
        </div>
        <button
          onClick={() => navigate("/templates/new")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: C.surface,
            color: C.goldDark,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 10,
            padding: "9px 18px",
            fontFamily: sans,
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.goldLight;
            e.currentTarget.style.borderColor = C.gold;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.surface;
            e.currentTarget.style.borderColor = C.goldBorder;
          }}
        >
          <Plus size={15} /> New Template
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ══ LEFT: Template list ══ */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            position: "sticky",
            top: 24,
          }}
        >
          <div
            style={{
              background: C.goldLight,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LayoutTemplate size={16} color={C.gold} />
            <h2
              style={{
                fontFamily: serif,
                fontSize: "0.9rem",
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              Templates
              <span
                style={{
                  marginLeft: 8,
                  fontSize: "0.72rem",
                  fontWeight: 400,
                  color: C.inkSoft,
                }}
              >
                ({templates.length})
              </span>
            </h2>
          </div>

          {/* Status Filter */}
          <div
            style={{
              padding: "10px 12px",
              borderBottom: `1px solid ${C.goldBorder}`,
              background: "#fdfaf6",
            }}
          >
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "active" | "deleted" | "all")
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: 8,
                border: `1px solid ${C.goldBorder}`,
                background: C.surface,
                color: filterStatus === "deleted" ? C.danger : C.inkMid,
                fontSize: "0.8rem",
                outline: "none",
                fontFamily: sans,
                cursor: "pointer",
              }}
            >
              <option value="active">Active Only</option>
              <option value="deleted">Deleted (Trash) Only</option>
              <option value="all">Show All</option>
            </select>
          </div>

          <div style={{ padding: "10px" }}>
            {filteredTemplates.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: C.inkSoft,
                  padding: "20px 0",
                }}
              >
                No templates found.
              </p>
            ) : (
              filteredTemplates.map((tpl) => {
                const isActive = tpl.id === selectedTemplateId;
                const isDeleted = tpl.isDeleted;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => selectTemplate(tpl.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "11px 12px",
                      borderRadius: 10,
                      marginBottom: 3,
                      border: `1.5px solid ${
                        isActive ? C.gold : "transparent"
                      }`,
                      background: isActive ? C.goldLight : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      opacity: isDeleted ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = isDeleted
                          ? "#f1f1f1"
                          : C.bg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {isDeleted && (
                        <AlertCircle
                          size={12}
                          color={C.danger}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            fontWeight: isActive ? 700 : 500,
                            color: isDeleted
                              ? C.inkSoft
                              : isActive
                              ? C.goldDark
                              : C.inkMid,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textDecoration: isDeleted ? "line-through" : "none",
                          }}
                        >
                          {tpl.label}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "0.68rem",
                            color: C.inkSoft,
                          }}
                        >
                          {tpl.properties?.length ?? 0} fields
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      color={isActive ? C.gold : C.inkSoft}
                      style={{ flexShrink: 0 }}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══ RIGHT: Editor ══ */}
        {selectedTemplate ? (
          <div
            style={{
              background: C.surface,
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              opacity: isSelectedTplDeleted ? 0.8 : 1,
            }}
          >
            {/* Editor header */}
            <div
              style={{
                background: C.goldLight,
                borderBottom: `1.5px solid ${C.goldBorder}`,
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: serif,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: isSelectedTplDeleted ? C.inkSoft : C.ink,
                    margin: "0 0 3px",
                    textDecoration: isSelectedTplDeleted
                      ? "line-through"
                      : "none",
                  }}
                >
                  {selectedTemplate.label}
                  {isSelectedTplDeleted && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: C.danger,
                        marginLeft: 8,
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      (Deleted)
                    </span>
                  )}
                </h2>
                {selectedTemplate.description && (
                  <p
                    style={{ margin: 0, fontSize: "0.78rem", color: C.inkSoft }}
                  >
                    {selectedTemplate.description}
                  </p>
                )}
              </div>

              {/* Actions (Delete/Restore + Save) */}
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                {isSelectedTplDeleted ? (
                  <button
                    onClick={() => handleRestoreTemplate(selectedTemplate.id)}
                    disabled={isProcessingTpl === selectedTemplate.id}
                    title="Restore Template"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: C.successBg,
                      border: "none",
                      color: C.success,
                      cursor: "pointer",
                      transition: "opacity 0.2s",
                    }}
                  >
                    <RefreshCw size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                    disabled={isProcessingTpl === selectedTemplate.id}
                    title="Delete Template"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: C.dangerBg,
                      border: "none",
                      color: C.danger,
                      cursor: "pointer",
                      transition: "opacity 0.2s",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <button
                  onClick={handleSave}
                  disabled={isSaving || isSelectedTplDeleted}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: saveSuccess
                      ? C.successBg
                      : isSelectedTplDeleted
                      ? C.goldBorder
                      : C.gold,
                    color: saveSuccess ? C.success : "#fff",
                    border: saveSuccess
                      ? `1.5px solid rgba(45,110,58,0.3)`
                      : "none",
                    borderRadius: 10,
                    padding: "10px 22px",
                    fontFamily: sans,
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    cursor:
                      isSaving || isSelectedTplDeleted
                        ? "not-allowed"
                        : "pointer",
                    opacity: isSaving ? 0.7 : 1,
                    transition: "all 0.2s",
                    boxShadow:
                      saveSuccess || isSelectedTplDeleted
                        ? "none"
                        : "0 2px 10px rgba(200,169,110,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Save size={16} />
                  {isSaving
                    ? "Saving..."
                    : saveSuccess
                    ? "✓ Saved!"
                    : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Add property row */}
            <div
              style={{
                padding: "16px 22px",
                borderBottom: `1.5px solid ${C.goldBorder}`,
                background: "#fdfaf6",
                display: "flex",
                gap: 10,
                alignItems: "center",
                opacity: isSelectedTplDeleted ? 0.6 : 1,
                pointerEvents: isSelectedTplDeleted ? "none" : "auto",
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <select
                  value={propToAdd}
                  onChange={(e) => setPropToAdd(Number(e.target.value))}
                  style={{
                    width: "100%",
                    appearance: "none",
                    background: C.surface,
                    border: `1.5px solid ${C.goldBorder}`,
                    borderRadius: 10,
                    padding: "10px 36px 10px 14px",
                    fontFamily: sans,
                    fontSize: "0.85rem",
                    color: propToAdd ? C.ink : C.inkSoft,
                    outline: "none",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.gold)}
                  onBlur={(e) => (e.target.style.borderColor = C.goldBorder)}
                >
                  <option value={0}>Select a property to add...</option>
                  {allProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.vocabularyPrefix}:{p.localName})
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
              <button
                onClick={handleAdd}
                disabled={!propToAdd || isSelectedTplDeleted}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background:
                    propToAdd && !isSelectedTplDeleted ? C.gold : C.goldBorder,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontFamily: sans,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor:
                    propToAdd && !isSelectedTplDeleted
                      ? "pointer"
                      : "not-allowed",
                  transition: "background 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (propToAdd && !isSelectedTplDeleted)
                    e.currentTarget.style.background = C.goldDark;
                }}
                onMouseLeave={(e) => {
                  if (propToAdd && !isSelectedTplDeleted)
                    e.currentTarget.style.background = C.gold;
                }}
              >
                <Plus size={15} /> Add Field
              </button>
            </div>

            {/* Properties list */}
            <div
              style={{
                padding: "16px 22px",
                opacity: isSelectedTplDeleted ? 0.6 : 1,
                pointerEvents: isSelectedTplDeleted ? "none" : "auto",
              }}
            >
              {editableProps.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    background: C.bg,
                    borderRadius: 12,
                    border: `1.5px dashed ${C.goldBorder}`,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: C.goldLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <LayoutTemplate
                      size={24}
                      color={C.gold}
                      strokeWidth={1.5}
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: serif,
                      fontSize: "1rem",
                      color: C.inkMid,
                      margin: "0 0 4px",
                    }}
                  >
                    Template is empty
                  </p>
                  <p
                    style={{ fontSize: "0.82rem", color: C.inkSoft, margin: 0 }}
                  >
                    Select a property above and click "Add Field" to get
                    started.
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {editableProps.map((prop, idx) => (
                    <div
                      key={prop.propertyId}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "32px 32px 1fr auto auto auto",
                        alignItems: "center",
                        gap: 10,
                        background: C.bg,
                        border: `1.5px solid ${C.goldBorder}`,
                        borderRadius: 12,
                        padding: "12px 14px",
                        transition: "box-shadow 0.15s, border-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelectedTplDeleted) {
                          (e.currentTarget as HTMLDivElement).style.boxShadow =
                            "0 2px 12px rgba(200,169,110,0.15)";
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = C.gold;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelectedTplDeleted) {
                          (e.currentTarget as HTMLDivElement).style.boxShadow =
                            "none";
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = C.goldBorder;
                        }
                      }}
                    >
                      {/* Order number */}
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: C.goldLight,
                          border: `1px solid ${C.goldBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: C.goldDark,
                          flexShrink: 0,
                        }}
                      >
                        {prop.displayOrder}
                      </span>

                      {/* Drag handle (visual only) */}
                      <GripVertical
                        size={16}
                        color={C.inkSoft}
                        style={{
                          cursor: isSelectedTplDeleted ? "default" : "grab",
                          flexShrink: 0,
                        }}
                      />

                      {/* Property label */}
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: serif,
                            fontSize: "0.92rem",
                            fontWeight: 700,
                            color: C.ink,
                          }}
                        >
                          {prop.propertyLabel}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.7rem",
                            color: C.inkSoft,
                            fontFamily: "monospace",
                          }}
                        >
                          id: {prop.propertyId}
                        </p>
                      </div>

                      {/* Required toggle */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: isSelectedTplDeleted ? "default" : "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          onClick={() => toggleReq(idx)}
                          style={{
                            width: 36,
                            height: 20,
                            borderRadius: 999,
                            background: prop.isRequired ? C.gold : C.goldBorder,
                            position: "relative",
                            transition: "background 0.2s",
                            cursor: isSelectedTplDeleted
                              ? "default"
                              : "pointer",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 3,
                              left: prop.isRequired ? 19 : 3,
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
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: prop.isRequired ? C.goldDark : C.inkSoft,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {prop.isRequired ? "Required" : "Optional"}
                        </span>
                      </label>

                      {/* Up / Down */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <MoveBtn
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0 || isSelectedTplDeleted}
                        >
                          <ArrowUp size={13} />
                        </MoveBtn>
                        <MoveBtn
                          onClick={() => moveDown(idx)}
                          disabled={
                            idx === editableProps.length - 1 ||
                            isSelectedTplDeleted
                          }
                        >
                          <ArrowDown size={13} />
                        </MoveBtn>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(idx)}
                        disabled={isSelectedTplDeleted}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: isSelectedTplDeleted
                            ? C.goldLight
                            : C.dangerBg,
                          border: "none",
                          color: isSelectedTplDeleted ? C.goldBorder : C.danger,
                          cursor: isSelectedTplDeleted ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "opacity 0.15s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelectedTplDeleted)
                            e.currentTarget.style.opacity = "0.7";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelectedTplDeleted)
                            e.currentTarget.style.opacity = "1";
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: C.surface,
              border: `1.5px dashed ${C.goldBorder}`,
              borderRadius: 16,
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: serif,
                fontSize: "1.1rem",
                color: C.inkSoft,
              }}
            >
              Select a template from the left to start editing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Move button ───────────────────────────────────────────────────────────────
const MoveBtn = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 28,
      height: 28,
      borderRadius: 7,
      background: disabled ? "transparent" : C.goldLight,
      border: `1px solid ${disabled ? "transparent" : C.goldBorder}`,
      color: disabled ? C.goldBorder : C.inkMid,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.background = C.goldBorder;
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.background = C.goldLight;
    }}
  >
    {children}
  </button>
);
