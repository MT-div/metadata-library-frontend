import { useCirculationHistory } from "../../hooks/librarianHooks/useCirculationHistory";

import {
  History,
  Search,
  BookOpen,
  User,
  Barcode,
  Calendar,
  Archive,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDateWithTime } from "../../utils/helpers";

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

// ── Types (preserved exactly from original) ───────────────────────────────────

// ── Small reusable select ─────────────────────────────────────────────────────
const FilterSelect = ({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: "none",
        background: C.surface,
        border: `1.5px solid ${C.goldBorder}`,
        borderRadius: 10,
        padding: "10px 32px 10px 14px",
        fontFamily: sans,
        fontSize: "0.83rem",
        color: C.ink,
        cursor: "pointer",
        outline: "none",
        transition: "border-color 0.2s",
        whiteSpace: "nowrap",
      }}
      onFocus={(e) => (e.target.style.borderColor = C.gold)}
      onBlur={(e) => (e.target.style.borderColor = C.goldBorder)}
    >
      {children}
    </select>
    <ChevronDown
      size={13}
      color={C.inkSoft}
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
      }}
    />
  </div>
);

// ── Date input ────────────────────────────────────────────────────────────────
const DateInput = ({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (v: string) => void;
  title: string;
}) => (
  <input
    type="date"
    title={title}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: "9px 12px",
      border: `1.5px solid ${C.goldBorder}`,
      borderRadius: 10,
      fontSize: "0.83rem",
      outline: "none",
      fontFamily: sans,
      color: value ? C.ink : C.inkSoft,
      background: C.surface,
      transition: "border-color 0.2s",
      cursor: "pointer",
    }}
    onFocus={(e) => (e.target.style.borderColor = C.gold)}
    onBlur={(e) => (e.target.style.borderColor = C.goldBorder)}
  />
);

// ── Divider ───────────────────────────────────────────────────────────────────
const VDiv = () => (
  <div
    style={{ width: 1, height: 28, background: C.goldBorder, flexShrink: 0 }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
export const CirculationHistoryPage = () => {
  // استدعاء وتفكيك الخطاف الجديد هنا
  const {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    getComputedStatus,
    hasFilters,
    filtered,
    clearFilters,
  } = useCirculationHistory();
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "returned")
      return {
        label: "Returned",
        color: C.success,
        bg: C.successBg,
        icon: <CheckCircle2 size={12} />,
      };
    if (s === "overdue")
      return {
        label: "Overdue",
        color: C.danger,
        bg: C.dangerBg,
        icon: <AlertTriangle size={12} />,
      };
    return {
      label: "Active",
      color: C.goldDark,
      bg: C.goldLight,
      icon: <Clock size={12} />,
    };
  };
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
            Librarian · Reports
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
            Circulation History
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Comprehensive audit log of all item checkouts and returns.
          </p>
        </div>
        {!loading && (
          <span
            style={{
              background: C.goldMid,
              color: C.goldDark,
              fontSize: "0.78rem",
              fontWeight: 700,
              padding: "6px 16px",
              borderRadius: 999,
              border: `1px solid ${C.goldBorder}`,
              alignSelf: "flex-end",
            }}
          >
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            {hasFilters ? " · filtered" : ""}
          </span>
        )}
      </div>

      {/* ══ HORIZONTAL FILTER BAR ══ */}
      <div
        style={{
          background: C.surface,
          border: `1.5px solid ${C.goldBorder}`,
          borderRadius: 14,
          padding: "13px 18px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 0 }}>
          <Search
            size={15}
            color={C.inkSoft}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search patron, item, barcode, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 32px 10px 34px",
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 10,
              fontFamily: sans,
              fontSize: "0.83rem",
              color: C.ink,
              background: C.bg,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = C.gold)}
            onBlur={(e) => (e.target.style.borderColor = C.goldBorder)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.inkSoft,
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        <VDiv />

        {/* Status */}
        <FilterSelect value={statusFilter} onChange={setStatusFilter}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </FilterSelect>

        <VDiv />

        {/* Date range */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "0.73rem",
              color: C.inkSoft,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            From
          </span>
          <DateInput
            value={dateFrom}
            onChange={setDateFrom}
            title="From Date"
          />
          <span
            style={{ fontSize: "0.73rem", color: C.inkSoft, fontWeight: 600 }}
          >
            to
          </span>
          <DateInput value={dateTo} onChange={setDateTo} title="To Date" />
        </div>

        {/* Clear — only when filters are active */}
        {hasFilters && (
          <>
            <VDiv />
            <button
              onClick={clearFilters}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: C.goldLight,
                color: C.inkMid,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 10,
                padding: "9px 14px",
                fontFamily: sans,
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.goldBorder)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = C.goldLight)
              }
            >
              <RotateCcw size={13} /> Clear
            </button>
          </>
        )}
      </div>

      {/* ══ TABLE (full width) ══ */}
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
            gap: 10,
          }}
        >
          <History size={16} color={C.goldDark} />
          <h2
            style={{
              fontFamily: serif,
              fontSize: "0.92rem",
              fontWeight: 700,
              color: C.ink,
              margin: 0,
            }}
          >
            Transactions Log
          </h2>
        </div>

        {loading ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: C.inkSoft,
              fontStyle: "italic",
            }}
          >
            Loading history records...
          </div>
        ) : filtered.length === 0 ? (
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
              <Archive size={24} color={C.gold} strokeWidth={1.5} />
            </div>
            <p
              style={{
                fontFamily: serif,
                fontSize: "1.1rem",
                color: C.inkMid,
                margin: "0 0 6px",
              }}
            >
              No records found
            </p>
            <p style={{ color: C.inkSoft, fontSize: "0.85rem", margin: 0 }}>
              Try adjusting your search query or filters.
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
                    "#",
                    "Item Details",
                    "Patron",
                    "Status",
                    "Borrow Date",
                    "Return Date",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
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
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const computedStatus = getComputedStatus(r);
                  const badge = getStatusBadge(computedStatus);
                  return (
                    <tr
                      key={r.recordId}
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
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
                      <td
                        style={{
                          padding: "13px 20px",
                          fontFamily: "monospace",
                          fontSize: "0.78rem",
                          color: C.inkSoft,
                        }}
                      >
                        #{r.recordId}
                      </td>

                      {/* Item */}
                      <td style={{ padding: "13px 20px", maxWidth: 220 }}>
                        <p
                          style={{
                            margin: "0 0 3px",
                            fontFamily: serif,
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            color: C.ink,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={r.itemTitle || ""}
                        >
                          <BookOpen
                            size={13}
                            color={C.goldDark}
                            style={{ flexShrink: 0 }}
                          />
                          {r.itemTitle || "Null from API"}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "monospace",
                            fontSize: "0.72rem",
                            color: C.inkMid,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Barcode size={11} color={C.inkSoft} />
                          {r.copyBarcode || "No Barcode"}
                        </p>
                      </td>

                      {/* Patron */}
                      <td style={{ padding: "13px 20px" }}>
                        <p
                          style={{
                            margin: "0 0 3px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: C.ink,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <User size={13} color={C.goldDark} />
                          {r.patronName || "Null from API"}
                        </p>
                        {r.patronId && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.72rem",
                              color: C.inkSoft,
                              fontFamily: "monospace",
                              paddingLeft: 18,
                            }}
                          >
                            ID: {r.patronId}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "13px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: badge.bg,
                            color: badge.color,
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            border: `1px solid ${badge.color}40`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {badge.icon} {badge.label}
                        </span>
                      </td>

                      {/* Borrow / Due */}
                      <td style={{ padding: "13px 20px" }}>
                        <p
                          style={{
                            margin: "0 0 3px",
                            fontSize: "0.8rem",
                            color: C.ink,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Calendar size={12} color={C.inkSoft} />
                          {formatDateWithTime(r.borrowDate)}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.7rem",
                            color: C.inkSoft,
                          }}
                        >
                          Due: {formatDateWithTime(r.dueDate)}
                        </p>
                      </td>

                      {/* Return date */}
                      <td style={{ padding: "13px 20px" }}>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: r.returnDate ? C.success : C.inkSoft,
                            fontWeight: r.returnDate ? 600 : 400,
                          }}
                        >
                          {formatDateWithTime(r.returnDate)}
                        </span>
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
