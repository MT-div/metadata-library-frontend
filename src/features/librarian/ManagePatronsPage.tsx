// src/features/librarian/ManagePatronsPage.tsx
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { useManagePatrons } from "../../hooks/librarianHooks/useManagePatrons";
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
          fontFamily: fonts.serif,
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

  // استدعاء وتفكيك الخطاف الجديد هنا
  const {
    patrons,
    loading,
    search,
    setSearch,
    isDeleting,
    handleDelete,
    filteredPatrons,
  } = useManagePatrons();

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
            Librarian · Circulation
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
            Patrons Management
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Manage library members, students, and external researchers.
          </p>
        </div>

        <GoldBtn
          onClick={() => navigate("/librarian/patrons/new")}
          style={{ padding: "10px 20px", fontSize: "0.85rem" }}
        >
          <Plus size={15} /> Add New Patron
        </GoldBtn>
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
            fontFamily: fonts.sans,
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
            <X size={18} />
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
                fontFamily: fonts.serif,
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
                        fontFamily: fonts.serif,
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
                            fontFamily: fonts.sans,
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
                            fontFamily: fonts.sans,
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
