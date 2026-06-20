import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import type { PatronResponse } from "../../types/metadata";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  IdCard,
  Phone,
  Mail,
  UserCheck,
  X,
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
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

// ── Extracted Components to avoid ESLint static-components error ──
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) => (
  <div
    style={{
      background: C.surface,
      border: `1.5px solid ${C.goldBorder}`,
      borderRadius: 14,
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      flex: "1 1 200px",
    }}
  >
    <div
      style={{
        background: C.goldLight,
        padding: 10,
        borderRadius: 10,
        color: C.goldDark,
      }}
    >
      {icon}
    </div>
    <div>
      <p
        style={{
          margin: 0,
          fontSize: "0.68rem",
          color: C.inkSoft,
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "1.3rem",
          fontWeight: 800,
          color: C.ink,
          fontFamily: serif,
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export const ManagePatronsPage = () => {
  const navigate = useNavigate();
  const [patrons, setPatrons] = useState<PatronResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<PatronResponse[]>("/api/Patrons")
      .then((res) => setPatrons(res.data))
      .catch((err: unknown) => console.error("Error fetching patrons:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this patron?")) return;

    setIsDeleting(id);
    try {
      await api.delete(`/api/Patrons/${id}`);
      setPatrons((prev) => prev.filter((p) => p.id !== id));
    } catch (error: unknown) {
      console.error("Error deleting patron:", error);
      alert("Error deleting patron. They might have active loans.");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredPatrons = patrons.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(query) ||
      p.nationalId.toLowerCase().includes(query) ||
      p.phoneNumber.includes(query) ||
      p.id.toString() === query
    );
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
            Librarian · Circulation
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
            Patrons Management
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Manage library members, students, and external researchers.
          </p>
        </div>
        <button
          onClick={() => navigate("/librarian/patrons/new")}
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
          <Plus size={15} /> Add New Patron
        </button>
      </div>

      {/* ── Stats row ── */}
      <div
        style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}
      >
        <StatCard
          title="Total Registered Patrons"
          value={patrons.length}
          icon={<Users size={22} />}
        />
        <StatCard
          title="Active Borrowers"
          value={"--"}
          icon={<UserCheck size={22} />}
        />
      </div>

      {/* ── Search Bar ── */}
      <div
        style={{
          background: C.surface,
          border: `1.5px solid ${C.goldBorder}`,
          borderRadius: 14,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          maxWidth: 600,
          boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
        }}
      >
        <Search size={18} color={C.inkSoft} />
        <input
          type="text"
          placeholder="Search by name, National ID, or Phone..."
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
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.inkSoft,
              padding: 0,
            }}
          >
            <X size={18} />{" "}
            {/* Note: Assuming X is imported or just use text "×" */}
          </button>
        )}
      </div>

      {/* ── Patrons Table ── */}
      <div
        style={{
          background: C.surface,
          border: `1.5px solid ${C.goldBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: C.inkSoft,
              fontStyle: "italic",
            }}
          >
            Loading patrons data...
          </div>
        ) : filteredPatrons.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Users
              size={32}
              color={C.gold}
              style={{ opacity: 0.5, margin: "0 auto 12px" }}
            />
            <p
              style={{
                fontFamily: serif,
                fontSize: "1.1rem",
                color: C.inkMid,
                margin: "0 0 6px",
              }}
            >
              No patrons found
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
                    "Full Name",
                    "National ID",
                    "Contact Info",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 20px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: C.inkSoft,
                        letterSpacing: "0.05em",
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
                {filteredPatrons.map((patron, idx) => (
                  <tr
                    key={patron.id}
                    style={{
                      borderBottom:
                        idx < filteredPatrons.length - 1
                          ? `1px solid ${C.goldBorder}`
                          : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fdfaf6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        color: C.inkSoft,
                      }}
                    >
                      #{patron.id}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: serif,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: C.ink,
                      }}
                    >
                      {patron.fullName}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        color: C.inkMid,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <IdCard size={14} color={C.goldDark} />{" "}
                        {patron.nationalId}
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: C.inkMid,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Phone size={12} color={C.inkSoft} />{" "}
                          {patron.phoneNumber}
                        </span>
                        {patron.email && (
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: C.inkMid,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Mail size={12} color={C.inkSoft} /> {patron.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          title="Edit Patron"
                          onClick={() => alert("Edit coming soon")}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: C.goldLight,
                            border: "none",
                            color: C.goldDark,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "opacity 0.15s",
                          }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          title="Delete Patron"
                          onClick={() => handleDelete(patron.id)}
                          disabled={isDeleting === patron.id}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: C.dangerBg,
                            border: "none",
                            color: C.danger,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor:
                              isDeleting === patron.id
                                ? "not-allowed"
                                : "pointer",
                            opacity: isDeleting === patron.id ? 0.5 : 1,
                            transition: "opacity 0.15s",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
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
  );
};
