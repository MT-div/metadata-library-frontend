// src/features/admin/AdminDashboardPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import { C, fonts } from "../../utils/theme";
import { StatCard } from "../../components/ui/StatCard";
import { QuickAction } from "../../components/ui/QuickAction";
import type { ItemResponse } from "../../types/item.types";
import type { ResourceTemplateResponse } from "../../types/template.types";
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
} from "lucide-react";

interface SystemStats {
  items: number;
  users: number;
  collections: number;
  media: number;
  templatesDist: { label: string; count: number; percentage: number }[];
}

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

  // Bar colors for distribution chart
  const BAR_COLORS = [C.goldDark, C.gold, "#d8c090", "rgba(200,169,110,0.4)"];

  return (
    <div style={{ fontFamily: fonts.sans, color: C.ink }}>
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
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "4px 12px",
              marginBottom: 16,
            }}
          >
            <Sparkles size={13} color={C.gold} />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: C.goldLight,
                letterSpacing: "0.08em",
              }}
            >
              SYSTEM DASHBOARD
            </span>
          </div>

          <h1
            style={{
              fontFamily: fonts.serif,
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

        {/* Decorative background icon */}
        <LayoutDashboard
          size={240}
          color={C.gold}
          strokeWidth={1}
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── KPI Stats Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
          marginBottom: 28,
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

      {/* ── Bottom row: Distribution + Quick Actions ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 22,
          alignItems: "start",
        }}
      >
        {/* ── Catalog Distribution ── */}
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
              padding: "15px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Activity size={17} color={C.goldDark} />
            <h2
              style={{
                fontFamily: fonts.serif,
                fontSize: "0.95rem",
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
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ color: C.inkSoft, margin: 0 }}>
                  No items in the catalog yet.
                </p>
              </div>
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
                        alignItems: "baseline",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: C.ink,
                          fontFamily: fonts.serif,
                        }}
                      >
                        {dist.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: C.inkSoft,
                          fontFamily: "monospace",
                        }}
                      >
                        {dist.count} items · {dist.percentage}%
                      </span>
                    </div>
                    {/* Track */}
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
                          background: BAR_COLORS[idx] ?? C.goldBorder,
                          borderRadius: 999,
                          transition: "width 1s ease-out",
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Legend */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginTop: 4,
                  }}
                >
                  {stats.templatesDist.map((dist, idx) => (
                    <div
                      key={idx}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: BAR_COLORS[idx] ?? C.goldBorder,
                        }}
                      />
                      <span style={{ fontSize: "0.72rem", color: C.inkSoft }}>
                        {dist.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
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
              padding: "15px 24px",
            }}
          >
            <h2
              style={{
                fontFamily: fonts.serif,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              Quick Actions
            </h2>
          </div>
          <div style={{ padding: "10px" }}>
            <QuickAction
              icon={<FilePlus size={18} />}
              title="Catalog New Item"
              subtitle="Add books, manuscripts, etc."
              onClick={() => navigate("/items/new")}
            />
            <QuickAction
              icon={<UploadCloud size={18} />}
              title="Upload Media"
              subtitle="Attach files to items."
              onClick={() => navigate("/media/new")}
            />
            <QuickAction
              icon={<UserPlus size={18} />}
              title="Add User"
              subtitle="Create account for new staff."
              onClick={() => navigate("/admin/users/new")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
