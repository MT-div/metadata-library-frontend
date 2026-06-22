// src/features/admin/ManageMetadataPage.tsx
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { IconBtn } from "../../components/ui/IconBtn";
import { useManageMetadata } from "../../hooks/adminHooks/useManageMetadata";
import {
  Book,
  Tags,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Search,
  X,
  Save,
} from "lucide-react";

export const ManageMetadataPage = () => {
  const navigate = useNavigate();

  // استدعاء وتفكيك الخطاف
  const {
    vocabularies,
    selectedVocabId,
    loading,
    vocabFilterStatus,
    setVocabFilterStatus,
    propFilterStatus,
    setPropFilterStatus,
    isProcessingVocab,
    isProcessingProp,
    selectVocab,
    selectedVocab,
    isSelectedVocabDeleted,
    handleDeleteVocab,
    handleRestoreVocab,
    handleDeleteProp,
    handleRestoreProp,
    filteredVocabs,
    filteredProps,
    handleNotImplemented,
    // ── Edit Modal States & Handlers ──
    isEditPropModalOpen,
    setIsEditPropModalOpen,
    editPropData,
    setEditPropData,
    openEditPropModal,
    handleSavePropEdit,
  } = useManageMetadata();

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
            Vocabularies & Properties
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Manage the metadata schema for the library.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <OutlineBtn onClick={() => navigate("/vocabularies/new")}>
            <Plus size={15} /> New Vocabulary
          </OutlineBtn>
          <GoldBtn onClick={() => navigate("/properties/new")}>
            <Plus size={15} /> New Property
          </GoldBtn>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: C.inkSoft,
            fontStyle: "italic",
          }}
        >
          Loading metadata schema...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ══ LEFT: Vocabulary list ══ */}
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
              <Book size={16} color={C.gold} />
              <h2
                style={{
                  fontFamily: fonts.serif,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Vocabularies
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: "0.72rem",
                    fontWeight: 400,
                    color: C.inkSoft,
                  }}
                >
                  ({vocabularies.length})
                </span>
              </h2>
            </div>

            {/* Vocab Status Filter */}
            <div
              style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${C.goldBorder}`,
                background: "#fdfaf6",
              }}
            >
              <select
                value={vocabFilterStatus}
                onChange={(e) =>
                  setVocabFilterStatus(
                    e.target.value as "active" | "deleted" | "all"
                  )
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 8,
                  border: `1px solid ${C.goldBorder}`,
                  background: C.surface,
                  color: vocabFilterStatus === "deleted" ? C.danger : C.inkMid,
                  fontSize: "0.8rem",
                  outline: "none",
                  fontFamily: fonts.sans,
                  cursor: "pointer",
                }}
              >
                <option value="active">Active Only</option>
                <option value="deleted">Deleted (Trash)</option>
                <option value="all">Show All</option>
              </select>
            </div>

            {/* List */}
            <div style={{ padding: "10px" }}>
              {filteredVocabs.map((vocab) => {
                const isActive = vocab.id === selectedVocabId;
                const isDeleted = vocab.isDeleted;
                return (
                  <button
                    key={vocab.id}
                    onClick={() => selectVocab(vocab.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "11px 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${
                        isActive ? C.gold : "transparent"
                      }`,
                      background: isActive ? C.goldLight : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 3,
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
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
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
                            textDecoration: isDeleted ? "line-through" : "none",
                          }}
                        >
                          {vocab.label}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.68rem",
                            fontFamily: "monospace",
                            color: C.inkSoft,
                            marginTop: 2,
                          }}
                        >
                          {vocab.prefix}
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
              })}
            </div>

            {/* Selected vocab info & actions */}
            {selectedVocab && (
              <div
                style={{
                  margin: "0 10px 10px",
                  padding: "14px",
                  background: C.bg,
                  borderRadius: 10,
                  border: `1px solid ${C.goldBorder}`,
                  opacity: isSelectedVocabDeleted ? 0.7 : 1,
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: C.inkSoft,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  Namespace URI
                </p>
                <a
                  href={selectedVocab.namespaceUri}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 5,
                    color: C.gold,
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    textDecoration: "none",
                    wordBreak: "break-all",
                  }}
                >
                  <ExternalLink
                    size={11}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  {selectedVocab.namespaceUri}
                </a>

                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <IconBtn
                    icon={<Edit size={14} />}
                    onClick={() => handleNotImplemented("Edit Vocabulary")}
                    disabled={isSelectedVocabDeleted}
                  />

                  {isSelectedVocabDeleted ? (
                    <button
                      onClick={() => handleRestoreVocab(selectedVocab.id)}
                      disabled={isProcessingVocab === selectedVocab.id}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: "none",
                        background: C.successBg,
                        color: C.success,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <RefreshCw size={14} />
                    </button>
                  ) : (
                    <IconBtn
                      icon={<Trash2 size={14} />}
                      onClick={() => handleDeleteVocab(selectedVocab.id)}
                      danger
                      disabled={isProcessingVocab === selectedVocab.id}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ══ RIGHT: Properties table ══ */}
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
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tags size={16} color={C.gold} />
                <h2
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: C.ink,
                    margin: 0,
                  }}
                >
                  Properties
                  {!loading && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: "0.72rem",
                        fontWeight: 400,
                        color: C.inkSoft,
                      }}
                    >
                      ({filteredProps.length})
                    </span>
                  )}
                </h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <select
                  value={propFilterStatus}
                  onChange={(e) =>
                    setPropFilterStatus(
                      e.target.value as "active" | "deleted" | "all"
                    )
                  }
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `1px solid ${C.goldBorder}`,
                    background: C.surface,
                    color: propFilterStatus === "deleted" ? C.danger : C.inkMid,
                    fontSize: "0.75rem",
                    outline: "none",
                    fontFamily: fonts.sans,
                    cursor: "pointer",
                  }}
                >
                  <option value="active">Active Only</option>
                  <option value="deleted">Trash</option>
                  <option value="all">All</option>
                </select>
                {selectedVocab && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      background: C.goldMid,
                      color: C.goldDark,
                      padding: "3px 10px",
                      borderRadius: 999,
                      border: `1px solid ${C.goldBorder}`,
                    }}
                  >
                    {selectedVocab.prefix}:*
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            {!selectedVocabId ? (
              <div
                style={{
                  padding: 48,
                  textAlign: "center",
                  color: C.inkSoft,
                  fontStyle: "italic",
                }}
              >
                Please select a vocabulary from the list.
              </div>
            ) : filteredProps.length === 0 ? (
              <div style={{ padding: "56px 24px", textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: C.goldLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Tags size={28} color={C.gold} strokeWidth={1.5} />
                </div>
                <p
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: "1.1rem",
                    color: C.inkMid,
                    margin: "0 0 6px",
                  }}
                >
                  No properties found
                </p>
                <GoldBtn onClick={() => navigate("/properties/new")}>
                  <Plus size={14} /> Add Property
                </GoldBtn>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#fdfaf6",
                        borderBottom: `1.5px solid ${C.goldBorder}`,
                      }}
                    >
                      {["ID", "Label", "Local Name", "URI", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              color: C.inkSoft,
                              letterSpacing: "0.07em",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProps.map((prop, idx) => (
                      <tr
                        key={prop.id}
                        style={{
                          borderBottom:
                            idx < filteredProps.length - 1
                              ? `1px solid ${C.goldBorder}`
                              : "none",
                          transition: "background 0.12s",
                          background: prop.isDeleted
                            ? "#fafafa"
                            : "transparent",
                          opacity: prop.isDeleted ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = prop.isDeleted
                            ? "#f1f1f1"
                            : "#fdfaf6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = prop.isDeleted
                            ? "#fafafa"
                            : "transparent")
                        }
                      >
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.78rem",
                              color: prop.isDeleted ? C.danger : C.inkSoft,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            #{prop.id}{" "}
                            {prop.isDeleted && <AlertCircle size={12} />}
                          </span>
                        </td>

                        {/* Label + Searchable Badge */}
                        <td style={{ padding: "13px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: fonts.serif,
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: prop.isDeleted ? C.inkSoft : C.ink,
                                textDecoration: prop.isDeleted
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {prop.label}
                            </span>
                            {prop.isSearchable && !prop.isDeleted && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: C.goldLight,
                                  color: C.goldDark,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                }}
                              >
                                <Search size={10} />
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              background: C.goldMid,
                              color: C.goldDark,
                              padding: "3px 10px",
                              borderRadius: 999,
                              border: `1px solid ${C.goldBorder}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {prop.vocabularyPrefix}:{prop.localName}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px", maxWidth: 220 }}>
                          <a
                            href={prop.termUri}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              color: C.gold,
                              fontSize: "0.72rem",
                              fontFamily: "monospace",
                              textDecoration: "none",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              pointerEvents: prop.isDeleted ? "none" : "auto",
                            }}
                          >
                            <ExternalLink size={11} style={{ flexShrink: 0 }} />
                            {prop.termUri}
                          </a>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <IconBtn
                              icon={<Edit size={14} />}
                              onClick={() => openEditPropModal(prop)}
                              disabled={prop.isDeleted}
                            />

                            {prop.isDeleted ? (
                              <button
                                onClick={() => handleRestoreProp(prop.id)}
                                disabled={isProcessingProp === prop.id}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 8,
                                  border: "none",
                                  background: C.successBg,
                                  color: C.success,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                              >
                                <RefreshCw size={14} />
                              </button>
                            ) : (
                              <IconBtn
                                icon={<Trash2 size={14} />}
                                onClick={() => handleDeleteProp(prop.id)}
                                danger
                                disabled={isProcessingProp === prop.id}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Property Modal ── */}
      {isEditPropModalOpen && (
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
                Edit Property
              </h3>
              <button
                onClick={() => setIsEditPropModalOpen(false)}
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
              onSubmit={handleSavePropEdit}
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
                  Display Label
                </label>
                <input
                  type="text"
                  required
                  value={editPropData.label}
                  onChange={(e) =>
                    setEditPropData({ ...editPropData, label: e.target.value })
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
                    color: C.ink,
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
                  Local Name
                </label>
                <input
                  type="text"
                  required
                  value={editPropData.localName}
                  onChange={(e) =>
                    setEditPropData({
                      ...editPropData,
                      localName: e.target.value,
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
                    fontSize: "0.85rem",
                    color: C.ink,
                  }}
                  dir="ltr"
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
                  Term URI
                </label>
                <input
                  type="url"
                  required
                  value={editPropData.termUri}
                  onChange={(e) =>
                    setEditPropData({
                      ...editPropData,
                      termUri: e.target.value,
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
                    fontSize: "0.85rem",
                    color: C.ink,
                  }}
                  dir="ltr"
                />
              </div>

              <div
                style={{
                  background: C.bg,
                  border: `1px solid ${C.goldBorder}`,
                  borderRadius: 10,
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                    Searchable
                  </h4>
                  <p
                    style={{ margin: 0, fontSize: "0.7rem", color: C.inkSoft }}
                  >
                    Used for dynamic search filters
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
                      setEditPropData((p) => ({
                        ...p,
                        isSearchable: !p.isSearchable,
                      }))
                    }
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 999,
                      background: editPropData.isSearchable
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
                        left: editPropData.isSearchable ? 21 : 3,
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <OutlineBtn
                  type="button"
                  onClick={() => setIsEditPropModalOpen(false)}
                >
                  Cancel
                </OutlineBtn>
                <GoldBtn type="submit" disabled={isProcessingProp !== null}>
                  <Save size={16} />{" "}
                  {isProcessingProp !== null ? "Saving..." : "Save Property"}
                </GoldBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
