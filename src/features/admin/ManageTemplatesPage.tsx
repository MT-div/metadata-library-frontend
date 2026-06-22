// src/features/admin/ManageTemplatesPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { useManageTemplates } from "../../hooks/adminHooks/useManageTemplates";
import { api } from "../../services/api";
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
  Edit,
  X,
  BookOpen,
  Ban,
} from "lucide-react";

export const ManageTemplatesPage = () => {
  const navigate = useNavigate();

  // استدعاء وتفكيك الخطاف
  const {
    templates,
    selectedTemplateId,
    filterStatus,
    setFilterStatus,
    editableProps,
    allProperties,
    hasChanges,
    propToAdd,
    setPropToAdd,
    isSaving,
    saveSuccess,
    isProcessingTpl,
    selectedTemplate,
    isSelectedTplDeleted,
    selectTemplate,
    handleDeleteTemplate,
    handleRestoreTemplate,
    handleAdd,
    handleRemove,
    moveUp,
    moveDown,
    toggleReq,
    handleSave,
    filteredTemplates,
  } = useManageTemplates();

  // ── Edit Template Info State (Modal) ──
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [editData, setEditData] = useState({
    label: "",
    description: "",
    isBorrowable: true,
    defaultBorrowDays: null as number | null,
  });

  const openEditModal = () => {
    if (!selectedTemplate) return;
    setEditData({
      label: selectedTemplate.label,
      description: selectedTemplate.description || "",
      isBorrowable: selectedTemplate.isBorrowable ?? true,
      defaultBorrowDays: selectedTemplate.defaultBorrowDays ?? null,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setIsSavingInfo(true);
    try {
      const payload = {
        id: selectedTemplate.id,
        label: editData.label.trim(),
        description: editData.description.trim() || null,
        isBorrowable: editData.isBorrowable,
        defaultBorrowDays: editData.defaultBorrowDays,
      };

      await api.put(`/api/resource-templates/${selectedTemplate.id}`, payload);

      // لإعادة تحميل القوالب بالبيانات الجديدة وتحديث الواجهة
      window.location.reload();
    } catch (error) {
      console.error("Error updating template info:", error);
      alert("Failed to update template information.");
      setIsSavingInfo(false);
    }
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
            Template Builder
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Manage form fields, reorder them, and configure borrowing rules.
          </p>
        </div>
        <GoldBtn onClick={() => navigate("/templates/new")}>
          <Plus size={15} /> New Template
        </GoldBtn>
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
                fontFamily: fonts.serif,
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
                fontFamily: fonts.sans,
                cursor: "pointer",
              }}
            >
              <option value="active">Active Only</option>
              <option value="deleted">Deleted (Trash) Only</option>
              <option value="all">Show All</option>
            </select>
          </div>

          <div
            style={{
              padding: "10px",
              maxHeight: "calc(100vh - 250px)",
              overflowY: "auto",
            }}
          >
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
                    fontFamily: fonts.serif,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: isSelectedTplDeleted ? C.inkSoft : C.ink,
                    margin: "0 0 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    textDecoration: isSelectedTplDeleted
                      ? "line-through"
                      : "none",
                  }}
                >
                  {selectedTemplate.label}
                  {!isSelectedTplDeleted && (
                    <button
                      onClick={openEditModal}
                      title="Edit Template Info"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: C.goldDark,
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      <Edit size={14} />
                    </button>
                  )}
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
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <p
                    style={{ margin: 0, fontSize: "0.78rem", color: C.inkSoft }}
                  >
                    {selectedTemplate.description || "No description"}
                  </p>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: C.goldDark,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: C.goldMid,
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: `1px solid ${C.goldBorder}`,
                    }}
                  >
                    {selectedTemplate.isBorrowable ? (
                      <>
                        <BookOpen size={10} /> Borrowable
                      </>
                    ) : (
                      <>
                        <Ban size={10} /> Reference Only
                      </>
                    )}
                  </span>
                </div>
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

                <GoldBtn
                  onClick={handleSave}
                  disabled={isSaving || isSelectedTplDeleted || !hasChanges}
                  success={saveSuccess}
                  style={{
                    padding: "10px 22px",
                    background: saveSuccess
                      ? C.successBg
                      : isSaving || isSelectedTplDeleted || !hasChanges
                      ? C.goldLight
                      : C.gold,
                    color: saveSuccess
                      ? C.success
                      : isSaving || isSelectedTplDeleted || !hasChanges
                      ? C.inkSoft
                      : "#fff",
                    boxShadow:
                      saveSuccess || isSelectedTplDeleted || !hasChanges
                        ? "none"
                        : undefined,
                    border: saveSuccess
                      ? `1.5px solid rgba(45,110,58,0.3)`
                      : "none",
                  }}
                >
                  {" "}
                  {saveSuccess ? undefined : <Save size={16} />}
                  {isSaving
                    ? "Saving..."
                    : saveSuccess
                    ? "✓ Saved!"
                    : !hasChanges
                    ? "No changes yet"
                    : "Save Fields"}
                </GoldBtn>
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
                    fontFamily: fonts.sans,
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

              <GoldBtn
                onClick={handleAdd}
                disabled={!propToAdd || isSelectedTplDeleted}
                style={{
                  padding: "10px 18px",
                  background:
                    propToAdd && !isSelectedTplDeleted ? C.gold : C.goldBorder,
                  cursor:
                    propToAdd && !isSelectedTplDeleted
                      ? "pointer"
                      : "not-allowed",
                  boxShadow: "none",
                }}
              >
                <Plus size={15} />
                Add Field
              </GoldBtn>
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
                      fontFamily: fonts.serif,
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

                      <GripVertical
                        size={16}
                        color={C.inkSoft}
                        style={{
                          cursor: isSelectedTplDeleted ? "default" : "grab",
                          flexShrink: 0,
                        }}
                      />

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: fonts.serif,
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

                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0 || isSelectedTplDeleted}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background:
                              idx === 0 || isSelectedTplDeleted
                                ? "transparent"
                                : C.goldLight,
                            border: `1px solid ${
                              idx === 0 || isSelectedTplDeleted
                                ? "transparent"
                                : C.goldBorder
                            }`,
                            color:
                              idx === 0 || isSelectedTplDeleted
                                ? C.goldBorder
                                : C.inkMid,
                            cursor:
                              idx === 0 || isSelectedTplDeleted
                                ? "not-allowed"
                                : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={
                            idx === editableProps.length - 1 ||
                            isSelectedTplDeleted
                          }
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background:
                              idx === editableProps.length - 1 ||
                              isSelectedTplDeleted
                                ? "transparent"
                                : C.goldLight,
                            border: `1px solid ${
                              idx === editableProps.length - 1 ||
                              isSelectedTplDeleted
                                ? "transparent"
                                : C.goldBorder
                            }`,
                            color:
                              idx === editableProps.length - 1 ||
                              isSelectedTplDeleted
                                ? C.goldBorder
                                : C.inkMid,
                            cursor:
                              idx === editableProps.length - 1 ||
                              isSelectedTplDeleted
                                ? "not-allowed"
                                : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

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
                fontFamily: fonts.serif,
                fontSize: "1.1rem",
                color: C.inkSoft,
              }}
            >
              Select a template from the left to start editing.
            </p>
          </div>
        )}
      </div>

      {/* ── Edit Template Info Modal ── */}
      {isEditModalOpen && selectedTemplate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              width: "100%",
              maxWidth: 500,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: C.goldLight,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `1.5px solid ${C.goldBorder}`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: fonts.serif,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                Edit Template Info
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.inkSoft,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSaveInfo}
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: C.inkMid,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Template Name <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editData.label}
                  onChange={(e) =>
                    setEditData({ ...editData, label: e.target.value })
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1.5px solid ${C.goldBorder}`,
                    outline: "none",
                    fontFamily: fonts.sans,
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: C.inkMid,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1.5px solid ${C.goldBorder}`,
                    outline: "none",
                    fontFamily: fonts.sans,
                    fontSize: "0.9rem",
                    resize: "none",
                  }}
                />
              </div>

              <div
                style={{
                  background: C.bg,
                  border: `1px solid ${C.goldBorder}`,
                  borderRadius: 10,
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: editData.isBorrowable ? 16 : 0,
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: C.ink,
                        fontWeight: 700,
                      }}
                    >
                      Allow Borrowing
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.7rem",
                        color: C.inkSoft,
                      }}
                    >
                      Can items be checked out?
                    </p>
                  </div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      onClick={() =>
                        setEditData((p) => ({
                          ...p,
                          isBorrowable: !p.isBorrowable,
                          defaultBorrowDays: !p.isBorrowable
                            ? p.defaultBorrowDays
                            : null,
                        }))
                      }
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 999,
                        background: editData.isBorrowable
                          ? C.gold
                          : C.goldBorder,
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 3,
                          left: editData.isBorrowable ? 21 : 3,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </div>
                  </label>
                </div>

                {editData.isBorrowable && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: C.inkMid,
                        marginBottom: 8,
                        textTransform: "uppercase",
                      }}
                    >
                      Default Borrow Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Use Global Setting"
                      value={editData.defaultBorrowDays ?? ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          defaultBorrowDays: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: `1px solid ${C.goldBorder}`,
                        outline: "none",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: `1.5px solid ${C.goldBorder}`,
                    borderRadius: 8,
                    padding: "8px 16px",
                    color: C.inkMid,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <GoldBtn
                  onClick={() => {}}
                  disabled={isSavingInfo}
                  style={{ padding: "8px 24px", boxShadow: "none" }}
                >
                  {isSavingInfo ? "Saving..." : "Save Info"}
                </GoldBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
