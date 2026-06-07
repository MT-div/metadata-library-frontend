import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Book,
  Tags,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import type {
  VocabularyResponse,
  PropertyResponse,
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
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

export const ManageMetadataPage = () => {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [selectedVocabId, setSelectedVocabId] = useState<number>(0);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [propsLoading, setPropsLoading] = useState(false);

  const selectVocab = (id: number) => {
    if (id === selectedVocabId) return;
    setSelectedVocabId(id);
    setPropsLoading(true);
  };

  useEffect(() => {
    fetch("/api/vocabularies")
      .then((r) => r.json())
      .then((data) => {
        setVocabularies(data);
        if (data.length > 0) selectVocab(data[0].id);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedVocabId) return;
    fetch(`/api/vocabularies/${selectedVocabId}/properties`)
      .then((r) => r.json())
      .then((data) => {
        setProperties(data);
        setPropsLoading(false);
      });
  }, [selectedVocabId]);

  const selectedVocab = vocabularies.find((v) => v.id === selectedVocabId);

  const handleNotImplemented = (action: string) =>
    alert(`"${action}" will be available after backend integration.`);

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
            Vocabularies & Properties
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Manage the metadata schema for the library.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <OutlineBtn
            icon={<Plus size={15} />}
            label="New Vocabulary"
            onClick={() => navigate("/vocabularies/new")}
          />
          <GoldBtn
            icon={<Plus size={15} />}
            label="New Property"
            onClick={() => navigate("/properties/new")}
          />
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
          Loading vocabularies...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
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
            {/* Header */}
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
                  fontFamily: serif,
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

            {/* List */}
            <div style={{ padding: "10px" }}>
              {vocabularies.map((vocab) => {
                const isActive = vocab.id === selectedVocabId;
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
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = C.bg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? C.goldDark : C.inkMid,
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
                    <ChevronRight
                      size={14}
                      color={isActive ? C.gold : C.inkSoft}
                      style={{ flexShrink: 0 }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Selected vocab info */}
            {selectedVocab && (
              <div
                style={{
                  margin: "0 10px 10px",
                  padding: "14px",
                  background: C.bg,
                  borderRadius: 10,
                  border: `1px solid ${C.goldBorder}`,
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
                    color={C.gold}
                    onClick={() => handleNotImplemented("Edit Vocabulary")}
                  />
                  <IconBtn
                    icon={<Trash2 size={14} />}
                    color={C.danger}
                    onClick={() => handleNotImplemented("Delete Vocabulary")}
                    danger
                  />
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
                    fontFamily: serif,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: C.ink,
                    margin: 0,
                  }}
                >
                  Properties
                  {!propsLoading && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: "0.72rem",
                        fontWeight: 400,
                        color: C.inkSoft,
                      }}
                    >
                      ({properties.length})
                    </span>
                  )}
                </h2>
              </div>
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

            {/* Content */}
            {propsLoading ? (
              <div
                style={{
                  padding: 48,
                  textAlign: "center",
                  color: C.inkSoft,
                  fontStyle: "italic",
                }}
              >
                Loading properties...
              </div>
            ) : properties.length === 0 ? (
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
                    fontFamily: serif,
                    fontSize: "1.1rem",
                    color: C.inkMid,
                    margin: "0 0 6px",
                  }}
                >
                  No properties yet
                </p>
                <p
                  style={{
                    color: C.inkSoft,
                    fontSize: "0.85rem",
                    margin: "0 0 20px",
                  }}
                >
                  Add a property to this vocabulary.
                </p>
                <GoldBtn
                  icon={<Plus size={14} />}
                  label="Add Property"
                  onClick={() => navigate("/properties/new")}
                />
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
                    {properties.map((prop, idx) => (
                      <tr
                        key={prop.id}
                        style={{
                          borderBottom:
                            idx < properties.length - 1
                              ? `1px solid ${C.goldBorder}`
                              : "none",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fdfaf6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* ID */}
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.78rem",
                              color: C.inkSoft,
                            }}
                          >
                            #{prop.id}
                          </span>
                        </td>

                        {/* Label */}
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              fontFamily: serif,
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              color: C.ink,
                            }}
                          >
                            {prop.label}
                          </span>
                        </td>

                        {/* Local name */}
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

                        {/* URI */}
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
                            }}
                            onMouseEnter={(e) =>
                              ((
                                e.currentTarget as HTMLAnchorElement
                              ).style.textDecoration = "underline")
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLAnchorElement
                              ).style.textDecoration = "none")
                            }
                          >
                            <ExternalLink size={11} style={{ flexShrink: 0 }} />
                            {prop.termUri}
                          </a>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <IconBtn
                              icon={<Edit size={14} />}
                              color={C.gold}
                              onClick={() =>
                                handleNotImplemented("Edit Property")
                              }
                            />
                            <IconBtn
                              icon={<Trash2 size={14} />}
                              color={C.danger}
                              onClick={() =>
                                handleNotImplemented("Delete Property")
                              }
                              danger
                            />
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

// ── Reusable buttons ──────────────────────────────────────────────────────────
const GoldBtn = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      background: C.gold,
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "9px 18px",
      fontFamily: sans,
      fontSize: "0.85rem",
      fontWeight: 700,
      cursor: "pointer",
      transition: "background 0.15s",
      boxShadow: "0 2px 10px rgba(200,169,110,0.3)",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = C.goldDark)}
    onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
  >
    {icon} {label}
  </button>
);

const OutlineBtn = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
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
    {icon} {label}
  </button>
);

const IconBtn = ({
  icon,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      border: "none",
      background: danger ? C.dangerBg : C.goldLight,
      color: danger ? C.danger : C.goldDark,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
  >
    {icon}
  </button>
);
