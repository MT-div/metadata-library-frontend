import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
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
} from "lucide-react";

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

export const ManageMediaPage = () => {
  const navigate = useNavigate();
  const [mediaList, setMediaList] = useState<MediaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    // 💡 ملاحظة: هذا يتطلب وجود GetAllMediaQuery في الـ Backend
    api
      .get<MediaResponse[]>("/api/media")
      .then((res) => {
        setMediaList(res.data);
      })
      .catch((err) => {
        console.error("Error fetching media:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الملف نهائياً؟")) return;

    setIsDeleting(id);
    try {
      await api.delete(`/api/media/${id}`);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("حدث خطأ أثناء الحذف.");
    } finally {
      setIsDeleting(null);
    }
  };

  // تحديد الأيقونة المناسبة بناءً على امتداد الملف
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return <ImageIcon size={28} color={C.gold} />;
    if (["mp4", "avi", "mov"].includes(ext || ""))
      return <Film size={28} color={C.gold} />;
    if (["pdf", "doc", "docx", "txt"].includes(ext || ""))
      return <FileText size={28} color={C.gold} />;
    return <File size={28} color={C.gold} />;
  };

  const filteredMedia = mediaList.filter(
    (m) =>
      !search ||
      m.fileName.toLowerCase().includes(search.toLowerCase()) ||
      m.itemId.toString() === search
  );

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
            Manage all uploaded files, images, and documents in the system.
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

      {/* ── Search Bar ── */}
      <div style={{ maxWidth: 600, marginBottom: 24 }}>
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 12,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <Search size={18} color={C.inkSoft} />
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
              fontSize: "0.9rem",
              color: C.ink,
            }}
          />
        </div>
      </div>

      {/* ── Media Grid ── */}
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
      ) : filteredMedia.length === 0 ? (
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
              ? "No files match your search."
              : "No files have been uploaded to the system yet."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {filteredMedia.map((media) => (
            <div
              key={media.id}
              style={{
                background: C.surface,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 16,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(200,169,110,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
              }}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: C.goldLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getFileIcon(media.fileName)}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <h3
                    style={{
                      fontFamily: serif,
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: C.ink,
                      margin: "0 0 4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={media.fileName}
                  >
                    {media.fileName}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: C.inkSoft,
                      fontFamily: "monospace",
                    }}
                  >
                    Linked to Item #{media.itemId}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 16,
                  borderTop: `1px solid ${C.goldBorder}`,
                }}
              >
                <a
                  href={api.defaults.baseURL + media.storagePath}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: C.goldDark,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} /> View File
                </a>

                <button
                  onClick={() => handleDelete(media.id)}
                  disabled={isDeleting === media.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: C.dangerBg,
                    color: C.danger,
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: isDeleting === media.id ? "not-allowed" : "pointer",
                    opacity: isDeleting === media.id ? 0.5 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  <Trash2 size={14} />{" "}
                  {isDeleting === media.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
