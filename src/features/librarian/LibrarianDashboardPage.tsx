import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  UserPlus,
  Sparkles,
  Archive,
} from "lucide-react";

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

interface LibrarianStats {
  totalItems: number;
  totalPatrons: number;
  activeLoans: number;
  overdueLoans: number;
}

// 👇 1. تم نقل المكون هنا للخارج لحل خطأ TypeScript و ESLint
const StatCard = ({
  title,
  value,
  icon,
  link,
  alert,
  loading,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  link: string;
  alert?: boolean;
  loading: boolean;
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(link)}
      style={{
        background: C.surface,
        border: `1.5px solid ${alert ? "rgba(192,57,43,0.3)" : C.goldBorder}`,
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = alert
          ? "0 10px 24px rgba(192,57,43,0.15)"
          : "0 10px 24px rgba(200,169,110,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: alert ? C.dangerBg : C.goldLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: alert ? C.danger : C.goldDark,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: alert ? C.danger : C.inkSoft,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "1.6rem",
            fontWeight: 800,
            color: C.ink,
            fontFamily: serif,
            lineHeight: 1,
          }}
        >
          {loading ? "..." : value}
        </p>
      </div>
    </div>
  );
};

export const LibrarianDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LibrarianStats>({
    totalItems: 0,
    totalPatrons: 0,
    activeLoans: 0,
    overdueLoans: 0,
  });

  useEffect(() => {
    Promise.all([
      api
        .get("/api/items")
        .then((r) => r.data)
        .catch(() => []),
      api
        .get("/api/Patrons")
        .then((r) => r.data)
        .catch(() => []),
      api
        .get("/api/Circulation/active")
        .then((r) => r.data)
        .catch(() => []),
      api
        .get("/api/Circulation/overdue")
        .then((r) => r.data)
        .catch(() => []),
    ])
      .then(([items, patrons, active, overdue]) => {
        setStats({
          totalItems: items.length,
          totalPatrons: patrons.length,
          activeLoans: active.length,
          overdueLoans: overdue.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${C.ink} 0%, ${C.inkMid} 100%)`,
          borderRadius: 20,
          padding: "36px 40px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "4px 12px",
              marginBottom: 16,
            }}
          >
            <Sparkles size={14} color={C.gold} />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: C.goldLight,
                letterSpacing: "0.05em",
              }}
            >
              LIBRARIAN DESK
            </span>
          </div>
          <h1
            style={{
              fontFamily: serif,
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 8px",
            }}
          >
            Daily Operations
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "0.95rem",
              color: C.goldLight,
              opacity: 0.8,
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            Monitor active loans, process book checkouts and returns, and manage
            patron accounts effectively.
          </p>
        </div>
        <BookOpen
          size={240}
          color={C.gold}
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            opacity: 0.1,
            pointerEvents: "none",
          }}
          strokeWidth={1}
        />
      </div>

      {/* 👇 2. تمرير خاصية loading للمكون الجديد */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={<Clock size={28} />}
          link="/librarian/circulation"
          loading={loading}
        />
        <StatCard
          title="Overdue Returns"
          value={stats.overdueLoans}
          icon={<AlertTriangle size={28} />}
          link="/librarian/circulation"
          alert={stats.overdueLoans > 0}
          loading={loading}
        />
        <StatCard
          title="Registered Patrons"
          value={stats.totalPatrons}
          icon={<Users size={28} />}
          link="/librarian/patrons"
          loading={loading}
        />
        <StatCard
          title="Catalog Items"
          value={stats.totalItems}
          icon={<Archive size={28} />}
          link="/admin/items"
          loading={loading}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        {/* Quick Actions */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: C.goldLight,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "16px 24px",
            }}
          >
            <h2
              style={{
                fontFamily: serif,
                fontSize: "1rem",
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              Quick Actions
            </h2>
          </div>
          <div
            style={{
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <button
              onClick={() => navigate("/librarian/circulation")}
              style={{
                padding: "24px",
                background: C.bg,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.goldDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = C.goldBorder)
              }
            >
              <ArrowRightLeft size={32} color={C.goldDark} />
              <span style={{ fontWeight: 700, color: C.ink }}>
                Checkout / Return
              </span>
            </button>

            <button
              onClick={() => navigate("/librarian/patrons/new")}
              style={{
                padding: "24px",
                background: C.bg,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.goldDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = C.goldBorder)
              }
            >
              <UserPlus size={32} color={C.goldDark} />
              <span style={{ fontWeight: 700, color: C.ink }}>New Patron</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
