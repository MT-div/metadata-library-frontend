// src/features/librarian/CirculationHistoryPage.tsx
import { useState, useEffect } from "react";
import { C, fonts } from "../../utils/theme";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import {
  History,
  Search,
  BookOpen,
  User,
  Barcode,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Archive,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

// ── Types (preserved exactly from original) ───────────────────────────────────
interface CirculationRecordResponse {
  recordId: number;
  copyBarcode: string | null;
  patronId?: number;
  patronName: string | null;
  itemTitle: string | null;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status?: string;
  isOverdue?: boolean;
}

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
        fontFamily: fonts.sans,
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
      fontFamily: fonts.sans,
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
  const [records, setRecords] = useState<CirculationRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    api
      .get<CirculationRecordResponse[]>("/api/Circulation/history")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setRecords(
          data.sort(
            (a, b) =>
              new Date(b.borrowDate).getTime() -
              new Date(a.borrowDate).getTime()
          )
        );
      })
      .catch((err: unknown) => {
        console.error("Error fetching circulation history:", err);
        if (err instanceof AxiosError && err.response?.status === 404)
          setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const getComputedStatus = (r: CirculationRecordResponse) => {
    if (r.status) return r.status.toLowerCase();
    if (r.returnDate) return "returned";
    if (r.isOverdue) return "overdue";
    return "active";
  };

  const hasFilters = search || statusFilter !== "all" || dateFrom || dateTo;

  const filtered = records.filter((r) => {
    const computedStatus = getComputedStatus(r);
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (r.patronName?.toLowerCase() || "").includes(q) ||
      (r.itemTitle?.toLowerCase() || "").includes(q) ||
      (r.copyBarcode?.toLowerCase() || "").includes(q) ||
      r.recordId.toString() === q;

    const matchStatus =
      statusFilter === "all" || computedStatus === statusFilter.toLowerCase();

    let matchDate = true;
    const bDate = new Date(r.borrowDate).getTime();
    if (dateFrom)
      matchDate = matchDate && bDate >= new Date(dateFrom).getTime();
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      matchDate = matchDate && bDate <= to.getTime();
    }
    return matchSearch && matchStatus && matchDate;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
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
            Librarian · Reports
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
              fontFamily: fonts.sans,
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
                fontSize: 18,
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
            <OutlineBtn
              onClick={clearFilters}
              style={{ padding: "9px 14px", fontSize: "0.78rem" }}
            >
              <RotateCcw size={13} /> Clear
            </OutlineBtn>
          </>
        )}
      </div>

      {/* ══ TABLE ══ */}
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
            gap: 10,
          }}
        >
          <History size={16} color={C.goldDark} />
          <h2
            style={{
              fontFamily: fonts.serif,
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
                fontFamily: fonts.serif,
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
                            fontFamily: fonts.serif,
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
                          {formatDate(r.borrowDate)}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.7rem",
                            color: C.inkSoft,
                          }}
                        >
                          Due: {formatDate(r.dueDate)}
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
                          {formatDate(r.returnDate)}
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
