import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import type {
  ItemResponse,
  ResourceTemplateResponse,
} from "../../types/metadata";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Archive,
} from "lucide-react";

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

export const ManageItemsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [filterTpl, setFilterTpl] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      api.get<ItemResponse[]>("/api/items").then((res) => res.data),
      api
        .get<ResourceTemplateResponse[]>("/api/resource-templates")
        .then((res) => res.data),
    ])
      .then(([itemsData, templatesData]) => {
        setItems(itemsData);
        setTemplates(templatesData);
      })
      .catch((err) => console.error("Error fetching items admin data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟ (Soft Delete)")) return;

    setIsDeleting(id);
    try {
      await api.delete(`/api/items/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("حدث خطأ أثناء محاولة الحذف.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getItemTitle = (item: ItemResponse) =>
    item.metadataValues.find(
      (v) =>
        v.propertyLabel.includes("عنوان") || v.propertyLabel.includes("Title")
    )?.valueText ?? `Untitled #${item.id}`;

  const getItemAuthor = (item: ItemResponse) =>
    item.metadataValues.find(
      (v) =>
        v.propertyLabel.includes("مؤلف") ||
        v.propertyLabel.includes("كاتب") ||
        v.propertyLabel.includes("Author")
    )?.valueText ?? "—";

  const filteredItems = items.filter((item) => {
    const title = getItemTitle(item).toLowerCase();
    const author = getItemAuthor(item).toLowerCase();
    const query = search.toLowerCase();
    const matchSearch =
      title.includes(query) ||
      author.includes(query) ||
      item.id.toString() === query;
    const matchTpl =
      filterTpl === "all" || item.templateId?.toString() === filterTpl;
    return matchSearch && matchTpl;
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
            Admin · Catalog
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
            Items Management
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            View, edit, and manage all metadata records in the library.
          </p>
        </div>
        <button
          onClick={() => navigate("/items/new")}
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
          <Plus size={15} /> Add New Item
        </button>
      </div>

      {/* ── Search + Filter bar ── */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}
      >
        {/* Search */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 12,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: "1 1 300px",
            maxWidth: 480,
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <Search size={17} color={C.inkSoft} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by title, author, or ID..."
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
        </div>

        {/* Template filter */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={filterTpl}
            onChange={(e) => setFilterTpl(e.target.value)}
            style={{
              appearance: "none",
              background: C.surface,
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 12,
              padding: "10px 36px 10px 14px",
              fontFamily: sans,
              fontSize: "0.85rem",
              color: C.inkMid,
              outline: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <option value="all">All Templates</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
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
      </div>

      {/* ── Table card ── */}
      <div
        style={{
          background: C.surface,
          border: `1.5px solid ${C.goldBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {/* Table header bar */}
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
            <Archive size={16} color={C.gold} />
            <h2
              style={{
                fontFamily: serif,
                fontSize: "0.92rem",
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              Library Catalog
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
            {filteredItems.length} record{filteredItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* States */}
        {loading ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: C.inkSoft,
              fontStyle: "italic",
            }}
          >
            Loading catalog data...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
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
              <FileText size={24} color={C.gold} strokeWidth={1.5} />
            </div>
            <p
              style={{
                fontFamily: serif,
                fontSize: "1.1rem",
                color: C.inkMid,
                margin: "0 0 6px",
              }}
            >
              No items found
            </p>
            <p style={{ color: C.inkSoft, fontSize: "0.85rem", margin: 0 }}>
              {search
                ? "Try a different search term."
                : "The catalog is currently empty."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#fdfaf6",
                    borderBottom: `1.5px solid ${C.goldBorder}`,
                  }}
                >
                  {[
                    "ID",
                    "Title",
                    "Author",
                    "Template",
                    "Owner",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: C.inkSoft,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => {
                  const tpl = templates.find((t) => t.id === item.templateId);
                  const title = getItemTitle(item);
                  const author = getItemAuthor(item);

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          idx < filteredItems.length - 1
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
                          #{item.id}
                        </span>
                      </td>

                      {/* Title */}
                      <td style={{ padding: "13px 16px", maxWidth: 240 }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: serif,
                            fontWeight: 700,
                            fontSize: "0.92rem",
                            color: C.ink,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={title}
                        >
                          {title}
                        </p>
                      </td>

                      {/* Author */}
                      <td style={{ padding: "13px 16px", maxWidth: 160 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.83rem",
                            color: C.inkMid,
                            fontStyle: "italic",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {author}
                        </p>
                      </td>

                      {/* Template badge */}
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            background: C.goldMid,
                            color: C.goldDark,
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            border: `1px solid ${C.goldBorder}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tpl?.label ?? "Unknown"}
                        </span>
                      </td>

                      {/* Owner */}
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: "0.8rem", color: C.inkSoft }}>
                          {item.ownerName ?? `User #${item.ownerId}`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {/* View */}
                          <Link
                            to={`/items/${item.id}`}
                            title="View Details"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              background: C.goldLight,
                              color: C.goldDark,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none",
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "0.7")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                          >
                            <ExternalLink size={14} />
                          </Link>

                          {/* Edit */}
                          <button
                            title="Edit Item"
                            onClick={() => alert("Edit feature coming soon!")}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              background: C.goldLight,
                              border: "none",
                              color: C.goldDark,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "0.7")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            title="Delete Item"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              background: C.dangerBg,
                              border: "none",
                              color: C.danger,
                              cursor:
                                isDeleting === item.id
                                  ? "not-allowed"
                                  : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: isDeleting === item.id ? 0.5 : 1,
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (isDeleting !== item.id)
                                e.currentTarget.style.opacity = "0.7";
                            }}
                            onMouseLeave={(e) => {
                              if (isDeleting !== item.id)
                                e.currentTarget.style.opacity = "1";
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
