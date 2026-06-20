import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import {
  Clock,
  AlertTriangle,
  Search,
  BookOpen,
  User,
  Barcode,
  Calendar,
  ArrowRightLeft,
  Info
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
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

interface CirculationRecordResponse {
  id: number;
  copyId: number;
  patronId: number;
  patronName: string;
  itemTitle: string;
  barcode: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: string;
}

// ── Extracted Component to avoid "static-components" ESLint error ──
const StatCard = ({ title, value, icon, alert, loading }: { title: string, value: number | string, icon: React.ReactNode, alert?: boolean, loading: boolean }) => (
  <div style={{ background: C.surface, border: `1.5px solid ${alert ? "rgba(192,57,43,0.3)" : C.goldBorder}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.02)", flex: "1 1 200px" }}>
    <div style={{ background: alert ? C.dangerBg : C.goldLight, padding: 12, borderRadius: 12, color: alert ? C.danger : C.goldDark }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: "0.68rem", color: alert ? C.danger : C.inkSoft, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </p>
      <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: C.ink, fontFamily: serif }}>
        {loading ? "..." : value}
      </p>
    </div>
  </div>
);

export const ActiveLoansPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<CirculationRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Tab state: "active" | "overdue"
  const [currentTab, setCurrentTab] = useState<"active" | "overdue">("active");

  useEffect(() => {
    // تبديل الـ Endpoint بناءً على التبويب المحدد
    const endpoint = currentTab === "overdue" ? "/api/Circulation/overdue" : "/api/Circulation/active";
    let cancelled = false;

    const loadRecords = async () => {
      setLoading(true);
      try {
        const res = await api.get<CirculationRecordResponse[]>(endpoint);
        if (!cancelled) {
          setRecords(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error: unknown) {
        console.error("Error fetching circulation records:", error);
        if (!cancelled) {
          if (error instanceof AxiosError && error.response?.status === 404) {
            setRecords([]); // تعامل آمن مع الـ 404
          } else {
            alert("Failed to load records from server.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRecords();
    return () => {
      cancelled = true;
    };
  }, [currentTab]);

  // Helper function to format ISO dates cleanly
  const formatDate = (isoString: string) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const filteredRecords = records.filter(r => {
    const query = search.toLowerCase();
    const pName = r.patronName?.toLowerCase() || "";
    const iTitle = r.itemTitle?.toLowerCase() || "";
    const bcode = r.barcode?.toLowerCase() || "";
    return pName.includes(query) || iTitle.includes(query) || bcode.includes(query);
  });

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: `1.5px solid ${C.goldBorder}` }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 700, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Librarian · Circulation
          </p>
          <h1 style={{ fontFamily: serif, fontSize: "1.8rem", fontWeight: 800, color: C.ink, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Active & Overdue Loans
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Track items currently checked out by patrons and identify late returns.
          </p>
        </div>
        
        {/* Quick jump to circulation desk */}
        <button
          onClick={() => navigate("/librarian/circulation")}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.surface, color: C.goldDark, border: `1.5px solid ${C.goldBorder}`, borderRadius: 10, padding: "10px 20px", fontFamily: sans, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.borderColor = C.gold; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.goldBorder; }}
        >
          <ArrowRightLeft size={15} /> Go to Circulation Desk
        </button>
      </div>

      {/* ── Tabs & Stats ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
        
        <div style={{ flex: "1 1 300px", background: C.surface, border: `1.5px solid ${C.goldBorder}`, borderRadius: 14, overflow: "hidden", display: "flex", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <button
            onClick={() => setCurrentTab("active")}
            style={{ flex: 1, padding: "16px", border: "none", background: currentTab === "active" ? C.goldLight : "transparent", color: currentTab === "active" ? C.goldDark : C.inkSoft, fontWeight: 700, fontSize: "0.95rem", fontFamily: sans, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}
          >
            <Clock size={18} /> Active Loans
          </button>
          <div style={{ width: "1.5px", background: C.goldBorder }} />
          <button
            onClick={() => setCurrentTab("overdue")}
            style={{ flex: 1, padding: "16px", border: "none", background: currentTab === "overdue" ? C.dangerBg : "transparent", color: currentTab === "overdue" ? C.danger : C.inkSoft, fontWeight: 700, fontSize: "0.95rem", fontFamily: sans, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}
          >
            <AlertTriangle size={18} /> Overdue Returns
          </button>
        </div>

        <StatCard title={currentTab === "active" ? "Total Active Loans" : "Total Overdue Items"} value={records.length} icon={currentTab === "active" ? <Clock size={22} /> : <AlertTriangle size={22} />} alert={currentTab === "overdue"} loading={loading} />
      </div>

      {/* ── Search Bar ── */}
      <div style={{ background: C.surface, border: `1.5px solid ${C.goldBorder}`, borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 24, maxWidth: 600, boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
        <Search size={18} color={C.inkSoft} />
        <input
          type="text"
          placeholder="Search by Patron, Item Title, or Barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: sans, fontSize: "0.9rem", color: C.ink }}
        />
      </div>

      {/* ── Table ── */}
      <div style={{ background: C.surface, border: `1.5px solid ${C.goldBorder}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: C.inkSoft, fontStyle: "italic" }}>
            Fetching loans data...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Info size={32} color={C.gold} style={{ opacity: 0.5, margin: "0 auto 12px" }} />
            <p style={{ fontFamily: serif, fontSize: "1.1rem", color: C.inkMid, margin: "0 0 6px" }}>
              No records found
            </p>
            <p style={{ color: C.inkSoft, fontSize: "0.85rem", margin: 0 }}>
              {search ? "Try adjusting your search keywords." : `There are no ${currentTab} loans at the moment.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: currentTab === "overdue" ? "#fdf0ee" : "#fdfaf6", borderBottom: `1.5px solid ${C.goldBorder}` }}>
                  {["Record ID", "Item & Barcode", "Patron", "Borrow Date", "Due Date", "Action"].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", fontSize: "0.7rem", fontWeight: 700, color: C.inkSoft, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, idx) => {
                  const isLate = currentTab === "overdue";
                  
                  return (
                    <tr key={record.id} style={{ borderBottom: idx < filteredRecords.length - 1 ? `1px solid ${C.goldBorder}` : "none", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fdfaf6")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      
                      {/* Record ID */}
                      <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: "0.8rem", color: C.inkSoft }}>
                        #{record.id}
                      </td>

                      {/* Item Info */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontFamily: serif, fontWeight: 700, fontSize: "0.95rem", color: C.ink, display: "flex", alignItems: "center", gap: 6 }}>
                            <BookOpen size={14} color={C.goldDark} />
                            {record.itemTitle || "Unknown Item"}
                          </span>
                          <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: C.inkMid, display: "flex", alignItems: "center", gap: 6 }}>
                            <Barcode size={13} color={C.inkSoft} />
                            {record.barcode}
                          </span>
                        </div>
                      </td>

                      {/* Patron */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: C.inkMid, display: "flex", alignItems: "center", gap: 6 }}>
                          <User size={14} color={C.goldDark} />
                          {record.patronName || `Patron ID: ${record.patronId}`}
                        </span>
                      </td>

                      {/* Borrow Date */}
                      <td style={{ padding: "14px 20px", fontSize: "0.85rem", color: C.inkSoft }}>
                        {formatDate(record.borrowDate)}
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ 
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: isLate ? C.dangerBg : C.successBg, 
                          color: isLate ? C.danger : C.success,
                          padding: "4px 10px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700,
                          border: `1px solid ${isLate ? "rgba(192,57,43,0.3)" : "rgba(45,110,58,0.3)"}`
                        }}>
                          <Calendar size={13} />
                          {formatDate(record.dueDate)}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: "14px 20px" }}>
                        <button 
                          title="Process Return" 
                          onClick={() => navigate("/librarian/circulation")} 
                          style={{ 
                            background: C.goldLight, border: "none", color: C.goldDark, padding: "8px 12px", 
                            borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", 
                            display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s" 
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.goldBorder)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = C.goldLight)}
                        >
                          <ArrowRightLeft size={14} /> Process Return
                        </button>
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