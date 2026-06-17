import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { MediaResponse } from "../../types/metadata";
import {
  Image as ImageIcon,
  Film,
  FileText,
  File,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  HardDrive,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { api } from "../../services/api";

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

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface ExtendedMediaResponse extends MediaResponse {
  isDeleted?: boolean;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return <ImageIcon size={26} color={C.gold} strokeWidth={1.5} />;
  if (["mp4", "avi", "mov", "mkv"].includes(ext))
    return <Film size={26} color={C.gold} strokeWidth={1.5} />;
  if (["pdf", "doc", "docx", "txt"].includes(ext))
    return <FileText size={26} color={C.gold} strokeWidth={1.5} />;
  return <File size={26} color={C.gold} strokeWidth={1.5} />;
};

const getFileTypeBadge = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "file";
  const map: Record<string, { label: string; color: string }> = {
    jpg: { label: "Image", color: "#7c4fa0" },
    jpeg: { label: "Image", color: "#7c4fa0" },
    png: { label: "Image", color: "#7c4fa0" },
    webp: { label: "Image", color: "#7c4fa0" },
    gif: { label: "Image", color: "#7c4fa0" },
    mp4: { label: "Video", color: "#2d6e9a" },
    mov: { label: "Video", color: "#2d6e9a" },
    avi: { label: "Video", color: "#2d6e9a" },
    pdf: { label: "PDF", color: "#c0392b" },
    doc: { label: "Document", color: "#2d6e3a" },
    docx: { label: "Document", color: "#2d6e3a" },
    txt: { label: "Text", color: "#5c4a30" },
  };
  return map[ext] ?? { label: ext.toUpperCase(), color: C.inkSoft };
};

export const ManageMediaPage = () => {
  const navigate = useNavigate();
  const [mediaList, setMediaList] = useState<ExtendedMediaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "active" | "deleted" | "all"
  >("active");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<ExtendedMediaResponse[]>("/api/media/WithDeleted")
      .then((res) => {
        setMediaList(res.data);
      })
      .catch((err) => {
        console.error("Error fetching media:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file? (Soft Delete)"))
      return;

    setIsProcessing(id);
    try {
      await api.delete(`/api/media/${id}`);
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isDeleted: true } : m))
      );
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("حدث خطأ أثناء الحذف.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm("Are you sure you want to restore this file?")) return;

    setIsProcessing(id);
    try {
      await api.put(`/api/media/Undelet/${id}`, { id: id });
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isDeleted: false } : m))
      );
    } catch (error) {
      console.error("Error restoring media:", error);
      alert("حدث خطأ أثناء الاسترجاع.");
    } finally {
      setIsProcessing(null);
    }
  };

  const filtered = mediaList.filter((m) => {
    const matchSearch =
      !search ||
      m.fileName.toLowerCase().includes(search.toLowerCase()) ||
      m.itemId.toString() === search;

    let matchStatus = true;
    if (filterStatus === "active") matchStatus = !m.isDeleted;
    if (filterStatus === "deleted") matchStatus = m.isDeleted === true;

    return matchSearch && matchStatus;
  });

  // Stats (only for active items)
  const activeMedia = mediaList.filter((m) => !m.isDeleted);
  const imageCount = activeMedia.filter((m) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(m.fileName)
  ).length;
  const videoCount = activeMedia.filter((m) =>
    /\.(mp4|mov|avi|mkv)$/i.test(m.fileName)
  ).length;
  const docCount = activeMedia.filter((m) =>
    /\.(pdf|doc|docx|txt)$/i.test(m.fileName)
  ).length;

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
            Admin · Storage
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
            Media Management
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            View, delete, and restore all uploaded files, images, and documents.
          </p>
        </div>
        <button
          onClick={() => navigate("/media/new")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: C.gold,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
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
          <Plus size={15} /> Upload New File
        </button>
      </div>

      {/* ── Stats row ── */}
      {!loading && activeMedia.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Active Files",
              value: activeMedia.length,
              icon: <HardDrive size={22} color={C.goldDark} />,
            },
            {
              label: "Images",
              value: imageCount,
              icon: <ImageIcon size={22} color={C.goldDark} />,
            },
            {
              label: "Videos",
              value: videoCount,
              icon: <Film size={22} color={C.goldDark} />,
            },
            {
              label: "Documents",
              value: docCount,
              icon: <FileText size={22} color={C.goldDark} />,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: C.surface,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 12,
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
              }}
            >
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.65rem",
                    color: C.inkSoft,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: C.ink,
                    fontFamily: serif,
                  }}
                >
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search & Filter bar ── */}
      <div
        style={{ marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 12,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flex: "1 1 300px",
            maxWidth: 560,
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <Search size={17} color={C.inkSoft} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by file name or Item ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: sans,
              fontSize: "0.88rem",
              color: C.ink,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.inkSoft,
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
          {search && (
            <span
              style={{ fontSize: "0.75rem", color: C.inkSoft, flexShrink: 0 }}
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Status Filter */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "deleted")
            }
            style={{
              appearance: "none",
              background: C.surface,
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 12,
              padding: "10px 36px 10px 14px",
              fontFamily: sans,
              fontSize: "0.85rem",
              color: filterStatus === "deleted" ? C.danger : C.inkMid,
              outline: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <option value="active">Active Files Only</option>
            <option value="deleted">Deleted (Trash) Only</option>
            <option value="all">Show All Files</option>
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
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: C.inkSoft,
            fontStyle: "italic",
          }}
        >
          Loading media files...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "72px 24px",
            background: C.surface,
            borderRadius: 20,
            border: `1.5px dashed ${C.goldBorder}`,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: C.goldLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <HardDrive size={34} color={C.gold} strokeWidth={1.5} />
          </div>
          <h3
            style={{
              fontFamily: serif,
              fontSize: "1.3rem",
              fontWeight: 700,
              color: C.ink,
              margin: "0 0 8px",
            }}
          >
            No media found
          </h3>
          <p
            style={{
              color: C.inkSoft,
              fontSize: "0.88rem",
              margin: "0 0 24px",
            }}
          >
            {search
              ? "Try different keywords or filters."
              : "No files have been uploaded to the system yet."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {filtered.map((media) => {
            const typeBadge = getFileTypeBadge(media.fileName);
            const isDeleted = media.isDeleted;

            return (
              <div
                key={media.id}
                style={{
                  background: isDeleted ? "#fafafa" : C.surface,
                  border: `1.5px solid ${C.goldBorder}`,
                  borderRadius: 16,
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  transition:
                    "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                  opacity: isDeleted ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isDeleted) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 28px rgba(200,169,110,0.18)";
                    e.currentTarget.style.borderColor = C.gold;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleted) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 10px rgba(0,0,0,0.04)";
                    e.currentTarget.style.borderColor = C.goldBorder;
                  }
                }}
              >
                {/* Top strip */}
                <div
                  style={{
                    height: 72,
                    background: C.goldLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    borderBottom: `1px solid ${C.goldBorder}`,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: C.surface,
                      border: `1.5px solid ${C.goldBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    {getFileIcon(media.fileName)}
                  </div>
                  {/* Type badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 10,
                      background: typeBadge.color + "18",
                      color: typeBadge.color,
                      border: `1px solid ${typeBadge.color}30`,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {typeBadge.label}
                  </span>
                  {/* Item ID badge */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 10,
                      background: "rgba(255,255,255,0.85)",
                      backdropFilter: "blur(4px)",
                      border: `1px solid ${C.goldBorder}`,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      color: C.inkSoft,
                      padding: "2px 8px",
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Item #{media.itemId}
                    {isDeleted && <AlertCircle size={10} color={C.danger} />}
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding: "14px 16px", flexGrow: 1 }}>
                  <h3
                    style={{
                      fontFamily: serif,
                      fontSize: "0.92rem",
                      fontWeight: 700,
                      color: isDeleted ? C.inkSoft : C.ink,
                      margin: "0 0 4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textDecoration: isDeleted ? "line-through" : "none",
                    }}
                    title={media.fileName}
                  >
                    {media.fileName}
                  </h3>
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
                    title={media.storagePath}
                  >
                    {media.storagePath}
                  </p>
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderTop: `1px solid ${C.goldBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <a
                    href={isDeleted ? "#" : `${BASE_URL}${media.storagePath}`}
                    target={isDeleted ? "_self" : "_blank"}
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: isDeleted ? C.inkSoft : C.gold,
                      textDecoration: "none",
                      transition: "color 0.15s",
                      pointerEvents: isDeleted ? "none" : "auto",
                    }}
                    onMouseEnter={(e) => {
                      if (!isDeleted)
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          C.goldDark;
                    }}
                    onMouseLeave={(e) => {
                      if (!isDeleted)
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          C.gold;
                    }}
                  >
                    <ExternalLink size={13} /> View File
                  </a>

                  {isDeleted ? (
                    <button
                      onClick={() => handleRestore(media.id)}
                      disabled={isProcessing === media.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: C.successBg,
                        color: C.success,
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        fontFamily: sans,
                        cursor:
                          isProcessing === media.id ? "not-allowed" : "pointer",
                        opacity: isProcessing === media.id ? 0.5 : 1,
                        transition: "all 0.15s",
                      }}
                    >
                      <RefreshCw size={13} />
                      {isProcessing === media.id ? "..." : "Restore"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(media.id)}
                      disabled={isProcessing === media.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: C.dangerBg,
                        color: C.danger,
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        fontFamily: sans,
                        cursor:
                          isProcessing === media.id ? "not-allowed" : "pointer",
                        opacity: isProcessing === media.id ? 0.5 : 1,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (isProcessing !== media.id)
                          e.currentTarget.style.background = "#fce8e5";
                      }}
                      onMouseLeave={(e) => {
                        if (isProcessing !== media.id)
                          e.currentTarget.style.background = C.dangerBg;
                      }}
                    >
                      <Trash2 size={13} />
                      {isProcessing === media.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
