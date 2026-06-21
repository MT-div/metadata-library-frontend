// src/features/admin/ManageMetadataPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { api } from "../../services/api";
import type {
  VocabularyResponse,
  PropertyResponse,
} from "../../types/metadata";
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
} from "lucide-react";

interface ExtendedVocab extends VocabularyResponse {
  isDeleted?: boolean;
}
interface ExtendedProp extends PropertyResponse {
  isDeleted?: boolean;
}

export const ManageMetadataPage = () => {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<ExtendedVocab[]>([]);
  const [selectedVocabId, setSelectedVocabId] = useState<number>(0);
  const [properties, setProperties] = useState<ExtendedProp[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Filters
  const [vocabFilterStatus, setVocabFilterStatus] = useState<
    "active" | "deleted" | "all"
  >("active");
  const [propFilterStatus, setPropFilterStatus] = useState<
    "active" | "deleted" | "all"
  >("active");

  const [isProcessingVocab, setIsProcessingVocab] = useState<number | null>(
    null
  );
  const [isProcessingProp, setIsProcessingProp] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api
        .get<ExtendedVocab[]>("/api/vocabularies/WithDeleted")
        .then((r) => r.data),
      api
        .get<ExtendedProp[]>("/api/properties/WithDeleted")
        .then((r) => r.data),
    ])
      .then(([vocabsData, propsData]) => {
        setVocabularies(vocabsData);
        setProperties(propsData);
        if (vocabsData.length > 0) setSelectedVocabId(vocabsData[0].id);
      })
      .catch((err) => console.error("Error fetching metadata:", err))
      .finally(() => setLoading(false));
  }, []);

  const selectVocab = (id: number) => {
    if (id === selectedVocabId) return;
    setSelectedVocabId(id);
  };

  const selectedVocab = vocabularies.find((v) => v.id === selectedVocabId);
  const isSelectedVocabDeleted = selectedVocab?.isDeleted;

  // ── VOCABULARY ACTIONS ──
  const handleDeleteVocab = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this vocabulary? (Soft Delete)")
    )
      return;
    setIsProcessingVocab(id);
    try {
      await api.delete(`/api/vocabularies/${id}`);
      setVocabularies((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isDeleted: true } : v))
      );
      if (vocabFilterStatus === "active" && selectedVocabId === id)
        setSelectedVocabId(0);
    } catch (e) {
      console.error(e);
      alert("Failed to delete vocabulary.");
    } finally {
      setIsProcessingVocab(null);
    }
  };

  const handleRestoreVocab = async (id: number) => {
    if (!confirm("Restore this vocabulary?")) return;
    setIsProcessingVocab(id);
    try {
      await api.put(`/api/vocabularies/Undelet/${id}`, { id });
      setVocabularies((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isDeleted: false } : v))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to restore vocabulary.");
    } finally {
      setIsProcessingVocab(null);
    }
  };

  // ── PROPERTY ACTIONS ──
  const handleDeleteProp = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this property? (Soft Delete)")
    )
      return;
    setIsProcessingProp(id);
    try {
      await api.delete(`/api/properties/${id}`);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to delete property.");
    } finally {
      setIsProcessingProp(null);
    }
  };

  const handleRestoreProp = async (id: number) => {
    if (!confirm("Restore this property?")) return;
    setIsProcessingProp(id);
    try {
      await api.put(`/api/properties/Undelet/${id}`, { id });
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isDeleted: false } : p))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to restore property.");
    } finally {
      setIsProcessingProp(null);
    }
  };

  const handleNotImplemented = (action: string) =>
    alert(`"${action}" feature coming soon!`);

  // Filtering Data
  const filteredVocabs = vocabularies.filter((v) => {
    if (vocabFilterStatus === "active") return !v.isDeleted;
    if (vocabFilterStatus === "deleted") return v.isDeleted;
    return true;
  });

  const filteredProps = properties.filter((p) => {
    if (p.vocabularyId !== selectedVocabId) return false;
    if (propFilterStatus === "active") return !p.isDeleted;
    if (propFilterStatus === "deleted") return p.isDeleted;
    return true;
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
                        <td style={{ padding: "13px 16px" }}>
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
                              onClick={() =>
                                handleNotImplemented("Edit Property")
                              }
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
    </div>
  );
};

// ── Local specialized buttons ──────────────────────────────────────────────────
const IconBtn = ({
  icon,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      border: "none",
      background: disabled ? "#f1f5f9" : danger ? C.dangerBg : C.goldLight,
      color: disabled ? "#94a3b8" : danger ? C.danger : C.goldDark,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "0.75";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    }}
  >
    {icon}
  </button>
);
