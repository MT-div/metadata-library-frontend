import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import type {
  ItemResponse,
  ResourceTemplateResponse,
} from "../../types/metadata";
import {
  LayoutDashboard,
  Users,
  Archive,
  FolderOpen,
  HardDrive,
  FilePlus,
  UploadCloud,
  UserPlus,
  Activity,
  Sparkles,
  ArrowRight,
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
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

interface SystemStats {
  items: number;
  users: number;
  collections: number;
  media: number;
  templatesDist: { label: string; count: number; percentage: number }[];
}

// 👇 حل خطأ: Cannot create components during render
// قمنا بإخراج المكون الصغير خارج المكون الرئيسي
const StatCard = ({
  title,
  value,
  icon,
  link,
  loading,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  link: string;
  loading: boolean;
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(link)}
      style={{
        background: C.surface,
        border: `1.5px solid ${C.goldBorder}`,
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
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(200,169,110,0.15)";
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
          background: C.goldLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.goldDark,
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
            color: C.inkSoft,
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

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    items: 0,
    users: 0,
    collections: 0,
    media: 0,
    templatesDist: [],
  });

  useEffect(() => {
    Promise.all([
      api.get("/api/items").then((r) => r.data),
      api.get("/api/users").then((r) => r.data),
      api.get("/api/item-sets").then((r) => r.data),
      api.get("/api/media").then((r) => r.data),
      api.get("/api/resource-templates").then((r) => r.data),
    ])
      .then(([itemsData, usersData, setsData, mediaData, templatesData]) => {
        // 👇 حل خطأ: Unexpected any
        const items = itemsData as ItemResponse[];
        const templates = templatesData as ResourceTemplateResponse[];

        const dist = templates
          .map((tpl) => {
            const count = items.filter((i) => i.templateId === tpl.id).length;
            const percentage =
              items.length === 0 ? 0 : Math.round((count / items.length) * 100);
            return { label: tpl.label, count, percentage };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);

        setStats({
          items: items.length,
          users: usersData.length,
          collections: setsData.length,
          media: mediaData.length,
          templatesDist: dist,
        });
      })
      .catch((err) => console.error("Error loading dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
      {/* ── Welcome Banner ── */}
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
              SYSTEM DASHBOARD
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
            Welcome back,{" "}
            <span style={{ color: C.gold }}>{user?.userName || "Admin"}</span>
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
            Here is what's happening with your library catalog today. Monitor
            your collections, manage staff, and upload new resources.
          </p>
        </div>
        <LayoutDashboard
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

      {/* ── KPI Stats Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <StatCard
          title="Total Items"
          value={stats.items}
          icon={<Archive size={28} />}
          link="/admin/items"
          loading={loading}
        />
        <StatCard
          title="Collections"
          value={stats.collections}
          icon={<FolderOpen size={28} />}
          link="/admin/itemsets"
          loading={loading}
        />
        <StatCard
          title="Media Files"
          value={stats.media}
          icon={<HardDrive size={28} />}
          link="/admin/media"
          loading={loading}
        />
        <StatCard
          title="Staff & Users"
          value={stats.users}
          icon={<Users size={28} />}
          link="/admin/users"
          loading={loading}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Catalog Health / Distribution ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              background: C.goldLight,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Activity size={18} color={C.goldDark} />
            <h2
              style={{
                fontFamily: serif,
                fontSize: "1rem",
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              Catalog Distribution
            </h2>
          </div>

          <div style={{ padding: "24px" }}>
            {loading ? (
              <p
                style={{
                  color: C.inkSoft,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Loading data...
              </p>
            ) : stats.templatesDist.length === 0 ? (
              <p style={{ color: C.inkSoft, textAlign: "center" }}>
                No items found in the catalog yet.
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {stats.templatesDist.map((dist, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: C.ink,
                        }}
                      >
                        {dist.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: C.inkSoft,
                          fontFamily: "monospace",
                        }}
                      >
                        {dist.count} items ({dist.percentage}%)
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        background: C.bg,
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${dist.percentage}%`,
                          height: "100%",
                          background:
                            idx === 0
                              ? C.goldDark
                              : idx === 1
                              ? C.gold
                              : idx === 2
                              ? "#d8c090"
                              : C.goldBorder,
                          borderRadius: 999,
                          transition: "width 1s ease-out",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Quick Actions ── */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
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
          <div style={{ padding: "12px" }}>
            <button
              onClick={() => navigate("/items/new")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: C.goldMid,
                  color: C.goldDark,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FilePlus size={18} />
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  Catalog New Item
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: C.inkSoft }}>
                  Add books, manuscripts, etc.
                </p>
              </div>
              <ArrowRight
                size={16}
                color={C.gold}
                style={{ marginLeft: "auto" }}
              />
            </button>

            <button
              onClick={() => navigate("/media/new")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: C.goldMid,
                  color: C.goldDark,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UploadCloud size={18} />
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  Upload Media
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: C.inkSoft }}>
                  Attach files to items.
                </p>
              </div>
              <ArrowRight
                size={16}
                color={C.gold}
                style={{ marginLeft: "auto" }}
              />
            </button>

            <button
              onClick={() => navigate("/admin/users/new")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: C.goldMid,
                  color: C.goldDark,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserPlus size={18} />
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  Add User
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: C.inkSoft }}>
                  Create account for new staff.
                </p>
              </div>
              <ArrowRight
                size={16}
                color={C.gold}
                style={{ marginLeft: "auto" }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
