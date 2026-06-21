// src/features/items/ItemDetailsPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import {
  ArrowLeft,
  Edit,
  FilePlus,
  Trash2,
  Tag,
  Folder,
  Image as ImageIcon,
  Book,
  FileText,
  ChevronRight,
} from "lucide-react";
import type { ItemResponse } from "../../types/item.types";
import type { ResourceTemplateResponse } from "../../types/template.types";
import type { ItemSetResponse } from "../../types/itemSet.types";
import type { MediaResponse } from "../../types/media.types";

// ── Reusable section card ─────────────────────────────────────────────────────
const SectionCard = ({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
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
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: C.gold }}>{icon}</span>
        <h2
          style={{
            fontFamily: fonts.serif,
            fontSize: "0.95rem",
            fontWeight: 700,
            color: C.ink,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
    <div style={{ padding: "20px" }}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isLibrarian } = useAuthStore();
  const canAccessAdmin = isAdmin() || isLibrarian();
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [template, setTemplate] = useState<ResourceTemplateResponse | null>(
    null
  );
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [media, setMedia] = useState<MediaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // دالة الحذف
  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/items/${id}`);
      alert("تم حذف العنصر بنجاح.");
      navigate("/browse", { replace: true });
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("حدث خطأ أثناء محاولة حذف العنصر.");
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const itemRes = await api.get<ItemResponse>(`/api/items/${id}`);
        const itemData = itemRes.data;
        setItem(itemData);

        const [tplRes, setsRes, mediaRes] = await Promise.all([
          api.get<ResourceTemplateResponse[]>("/api/resource-templates"),
          api.get<ItemSetResponse[]>("/api/item-sets"),
          api.get<MediaResponse[]>(`/api/media/by-item/${id}`),
        ]);

        const tpls = tplRes.data;
        setTemplate(tpls.find((t) => t.id === itemData.templateId) || null);

        const sets = setsRes.data;
        setItemSets(
          sets.filter((s) => s.items?.some((i) => i.id === itemData.id))
        );

        setMedia(mediaRes.data);
      } catch (e) {
        console.error("Error loading item details:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: 80,
          fontFamily: fonts.sans,
          color: C.inkSoft,
          fontStyle: "italic",
        }}
      >
        Loading item details...
      </div>
    );

  if (!item)
    return (
      <div
        style={{
          textAlign: "center",
          padding: 80,
          fontFamily: fonts.serif,
          color: C.danger,
          fontSize: "1.2rem",
        }}
      >
        Item not found.
      </div>
    );

  // ── Extract key fields ────────────────────────────────────────────────────
  const titleLabels = ["عنوان", "Title"];
  const authorLabels = ["مؤلف", "كاتب", "Author"];

  const title =
    item.metadataValues.find((v) =>
      titleLabels.some((l) => v.propertyLabel.includes(l))
    )?.valueText || `Untitled #${item.id}`;
  const author =
    item.metadataValues.find((v) =>
      authorLabels.some((l) => v.propertyLabel.includes(l))
    )?.valueText || null;

  const sortedMeta = item.metadataValues
    .filter(
      (v) =>
        !titleLabels.includes(v.propertyLabel) &&
        !authorLabels.includes(v.propertyLabel)
    )
    .map((v) => {
      const def = template?.properties?.find(
        (p) => p.propertyId === v.propertyId
      );
      return { ...v, displayOrder: def?.displayOrder ?? 999 };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handleBadgeClick = (type: "template" | "itemSet", filterId: string) =>
    navigate("/browse", { state: { [type]: filterId } });

  const handleFilePlusClick = (type: "media", ItemId: string) =>
    navigate("/media/new", { state: { [type]: ItemId } });

  const isImage = template?.label.includes("صورة");

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        fontFamily: fonts.sans,
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 48px 60px" }}
      >
        {/* ── Top action bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <OutlineBtn onClick={() => navigate(-1)} rounded>
            <ArrowLeft size={16} /> Back to list
          </OutlineBtn>

          <div style={{ gap: 10, display: canAccessAdmin ? "flex" : "none" }}>
            <ActionBtn
              icon={<Edit size={15} />}
              label="Edit"
              onClick={() => {}}
            />
            <ActionBtn
              icon={<Trash2 size={15} />}
              label={isDeleting ? "Deleting..." : "Delete"}
              danger
              onClick={handleDelete}
            />
          </div>
        </div>

        {/* ── Hero card ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            marginBottom: 28,
            display: "flex",
          }}
        >
          <div style={{ width: 5, background: C.gold, flexShrink: 0 }} />

          <div
            style={{
              padding: "32px",
              display: "flex",
              gap: 28,
              alignItems: "flex-start",
              flexGrow: 1,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 18,
                flexShrink: 0,
                background: C.goldLight,
                border: `1.5px solid ${C.goldBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isImage ? (
                <ImageIcon size={40} color={C.gold} strokeWidth={1.5} />
              ) : (
                <Book size={40} color={C.gold} strokeWidth={1.5} />
              )}
            </div>

            {/* Text */}
            <div style={{ flexGrow: 1 }}>
              {/* Badges row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {/* ID */}
                <span
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.goldBorder}`,
                    color: C.inkSoft,
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    padding: "4px 12px",
                    borderRadius: 999,
                    display: canAccessAdmin ? "block" : "none",
                  }}
                >
                  ID: {item.id}
                </span>

                {/* Template badge */}
                {template && (
                  <button
                    onClick={() =>
                      handleBadgeClick("template", template.id.toString())
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: C.goldMid,
                      border: `1px solid ${C.goldBorder}`,
                      color: C.goldDark,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 999,
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.goldLight)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = C.goldMid)
                    }
                  >
                    <Tag size={12} /> {template.label}
                  </button>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: fonts.serif,
                  fontSize: "clamp(1.5rem,3vw,2.2rem)",
                  fontWeight: 800,
                  color: C.ink,
                  margin: "0 0 10px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h1>

              {author && (
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: "1rem",
                    color: C.inkMid,
                    margin: "0 0 6px",
                    fontStyle: "italic",
                  }}
                >
                  by {author}
                </p>
              )}
              {item.ownerName && (
                <p style={{ fontSize: "0.8rem", color: C.inkSoft, margin: 0 }}>
                  Added by: {item.ownerName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Body grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Metadata */}
          <SectionCard title="Metadata" icon={<FileText size={18} />}>
            {sortedMeta.length === 0 ? (
              <p
                style={{
                  color: C.inkSoft,
                  fontSize: "0.88rem",
                  fontStyle: "italic",
                }}
              >
                No additional metadata for this item.
              </p>
            ) : (
              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "0 24px",
                }}
              >
                {sortedMeta.map((val, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "14px 0",
                      borderBottom: `1px dashed ${C.goldBorder}`,
                    }}
                  >
                    <dt
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: C.inkSoft,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                      }}
                    >
                      {val.propertyLabel}
                    </dt>
                    <dd
                      style={{
                        fontFamily: fonts.serif,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: C.ink,
                        margin: 0,
                      }}
                    >
                      {val.valueText || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </SectionCard>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Collections */}
            <SectionCard title="Collections" icon={<Folder size={18} />}>
              {itemSets.length === 0 ? (
                <p
                  style={{
                    color: C.inkSoft,
                    fontSize: "0.82rem",
                    fontStyle: "italic",
                  }}
                >
                  This item doesn't belong to any collection.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {itemSets.map((set) => (
                    <button
                      key={set.id}
                      onClick={() =>
                        handleBadgeClick("itemSet", set.id.toString())
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: C.bg,
                        border: `1.5px solid ${C.goldBorder}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontFamily: fonts.sans,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.goldLight;
                        e.currentTarget.style.borderColor = C.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = C.bg;
                        e.currentTarget.style.borderColor = C.goldBorder;
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Folder size={15} color={C.gold} />
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: C.ink,
                          }}
                        >
                          {set.title}
                        </span>
                      </div>
                      <ChevronRight size={14} color={C.inkSoft} />
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Media */}
            <SectionCard
              title="Attached Media"
              icon={<ImageIcon size={18} />}
              action={
                <button
                  onClick={() =>
                    handleFilePlusClick("media", item.id.toString())
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: C.gold,
                    padding: 4,
                    display: canAccessAdmin ? "flex" : "none",
                    alignItems: "center",
                    transition: "color 0.15s",
                  }}
                >
                  <FilePlus size={18} />
                </button>
              }
            >
              {media.length === 0 ? (
                <p
                  style={{
                    color: C.inkSoft,
                    fontSize: "0.82rem",
                    fontStyle: "italic",
                  }}
                >
                  No attached files.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {media.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: `1.5px solid ${C.goldBorder}`,
                        background: C.bg,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = C.goldLight)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = C.bg)
                      }
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: C.goldLight,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FileText size={18} color={C.gold} />
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.83rem",
                            fontWeight: 600,
                            color: C.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.fileName}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.7rem",
                            color: C.inkSoft,
                            fontFamily: "monospace",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.storagePath}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Action button ─────────────────────────────────────────────────────────────
const ActionBtn = ({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      background: danger ? C.dangerBg : C.surface,
      border: `1.5px solid ${danger ? "rgba(192,57,43,0.25)" : C.goldBorder}`,
      color: danger ? C.danger : C.inkMid,
      borderRadius: 10,
      padding: "9px 16px",
      fontFamily: fonts.sans,
      fontSize: "0.85rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = danger ? "#fce8e5" : C.goldLight)
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.background = danger ? C.dangerBg : C.surface)
    }
  >
    {icon} {label}
  </button>
);
