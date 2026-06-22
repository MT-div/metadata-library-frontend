// src/features/admin/ManageItemsPage.tsx
import { useNavigate, Link } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Archive,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useManageItems } from "../../hooks/adminHooks/useManageItems";
import { getItemTitle, getItemAuthor } from "../../utils/helpers";

// ── Extended ItemResponse to include isDeleted ──

export const ManageItemsPage = () => {
  const navigate = useNavigate();

  // استدعاء وتفكيك الخطاف الجديد هنا
  const {
    templates,
    loading,
    search,
    setSearch,
    filterTpl,
    setFilterTpl,
    filterStatus,
    setFilterStatus,
    isProcessing,
    handleDelete,
    handleUndelete,
    filteredItems,
  } = useManageItems();

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
            Admin · Catalog
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
            Items Management
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            View, edit, delete, and restore all metadata records in the library.
          </p>
        </div>

        <GoldBtn
          onClick={() => navigate("/items/new")}
          style={{ padding: "10px 20px", fontSize: "0.85rem" }}
        >
          <Plus size={15} /> Add New Item
        </GoldBtn>
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
              fontFamily: fonts.sans,
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
              fontFamily: fonts.sans,
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

        {/* Status Filter (Soft Delete) */}
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
              fontFamily: fonts.sans,
              fontSize: "0.85rem",
              color: filterStatus === "deleted" ? C.danger : C.inkMid,
              outline: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <option value="active">Active Items Only</option>
            <option value="deleted">Deleted (Trash) Only</option>
            <option value="all">Show All Items</option>
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
                fontFamily: fonts.serif,
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
                fontFamily: fonts.serif,
                fontSize: "1.1rem",
                color: C.inkMid,
                margin: "0 0 6px",
              }}
            >
              No items found
            </p>
            <p style={{ color: C.inkSoft, fontSize: "0.85rem", margin: 0 }}>
              {search
                ? "Try a different search term or filter."
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
                  const isDeleted = item.isDeleted;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          idx < filteredItems.length - 1
                            ? `1px solid ${C.goldBorder}`
                            : "none",
                        transition: "background 0.12s",
                        background: isDeleted ? "#fafafa" : "transparent",
                        opacity: isDeleted ? 0.6 : 1, // Visual hint for soft deleted items
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDeleted
                          ? "#f1f1f1"
                          : "#fdfaf6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isDeleted
                          ? "#fafafa"
                          : "transparent")
                      }
                    >
                      {/* ID */}
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.78rem",
                            color: isDeleted ? C.danger : C.inkSoft,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          #{item.id}
                          {isDeleted && (
                            <AlertCircle
                              size={12}
                              aria-label="Deleted Item"
                              role="img"
                            />
                          )}
                        </span>
                      </td>

                      {/* Title */}
                      <td style={{ padding: "13px 16px", maxWidth: 240 }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: fonts.serif,
                            fontWeight: 700,
                            fontSize: "0.92rem",
                            color: isDeleted ? C.inkSoft : C.ink,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textDecoration: isDeleted ? "line-through" : "none",
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

                          {/* Edit (Disabled if deleted) */}
                          <button
                            title="Edit Item"
                            disabled={isDeleted}
                            onClick={() => alert("Edit feature coming soon!")}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              background: isDeleted ? "#e0e0e0" : C.goldLight,
                              border: "none",
                              color: isDeleted ? "#9e9e9e" : C.goldDark,
                              cursor: isDeleted ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.opacity = "0.7";
                            }}
                            onMouseLeave={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.opacity = "1";
                            }}
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete OR Restore */}
                          {isDeleted ? (
                            <button
                              title="Restore Item"
                              onClick={() => handleUndelete(item.id)}
                              disabled={isProcessing === item.id}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 7,
                                background: C.successBg,
                                border: "none",
                                color: C.success,
                                cursor:
                                  isProcessing === item.id
                                    ? "not-allowed"
                                    : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: isProcessing === item.id ? 0.5 : 1,
                                transition: "opacity 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                if (isProcessing !== item.id)
                                  e.currentTarget.style.opacity = "0.7";
                              }}
                              onMouseLeave={(e) => {
                                if (isProcessing !== item.id)
                                  e.currentTarget.style.opacity = "1";
                              }}
                            >
                              <RefreshCw size={14} />
                            </button>
                          ) : (
                            <button
                              title="Soft Delete Item"
                              onClick={() => handleDelete(item.id)}
                              disabled={isProcessing === item.id}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 7,
                                background: C.dangerBg,
                                border: "none",
                                color: C.danger,
                                cursor:
                                  isProcessing === item.id
                                    ? "not-allowed"
                                    : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: isProcessing === item.id ? 0.5 : 1,
                                transition: "opacity 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                if (isProcessing !== item.id)
                                  e.currentTarget.style.opacity = "0.7";
                              }}
                              onMouseLeave={(e) => {
                                if (isProcessing !== item.id)
                                  e.currentTarget.style.opacity = "1";
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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
