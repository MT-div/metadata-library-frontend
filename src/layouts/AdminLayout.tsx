import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  LayoutTemplate,
  Library,
  FilePlus,
  UploadCloud,
  Menu,
  X,
  LogOut,
  Globe,
  ChevronRight,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  // Sidebar dark warm tones
  sidebarBg: "#1e1508",
  sidebarBorder: "rgba(200,169,110,0.15)",
  sidebarHover: "rgba(200,169,110,0.10)",
  sidebarActive: "rgba(200,169,110,0.18)",
  sidebarText: "rgba(255,245,225,0.65)",
  sidebarTextHi: "rgba(255,245,225,0.95)",
  // Gold accent
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldBorder: "rgba(200,169,110,0.28)",
  goldDark: "#b8965a",
  // Main area
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  ink: "#1a1208",
  inkMid: "#5c4a30",
  inkSoft: "#9a8060",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

// ── Nav link groups ───────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Management",
    links: [
      {
        title: "Metadata",
        path: "/admin/metadata",
        icon: <Settings size={17} />,
      },
      {
        title: "Templates",
        path: "/admin/templates",
        icon: <LayoutTemplate size={17} />,
      },
      {
        title: "Collections",
        path: "/admin/itemsets",
        icon: <Library size={17} />,
      },
    ],
  },
  {
    label: "Content",
    links: [
      { title: "Add Item", path: "/items/new", icon: <FilePlus size={17} /> },
      {
        title: "Upload Media",
        path: "/media/new",
        icon: <UploadCloud size={17} />,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: C.bg,
        fontFamily: sans,
        overflow: "hidden",
      }}
    >
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 20,
          }}
        />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        style={{
          width: 240,
          background: C.sidebarBg,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          zIndex: 30,
          borderRight: `1px solid ${C.sidebarBorder}`,
          // Mobile: slide in/out
          position: "fixed" as const,
          top: 0,
          bottom: 0,
          left: 0,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
        className="admin-sidebar"
      >
        {/* Logo area */}
        <div
          style={{
            height: 72,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${C.sidebarBorder}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LayoutDashboard size={16} color="#fff" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: C.sidebarTextHi,
                  fontFamily: serif,
                }}
              >
                HIASTica
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.65rem",
                  color: C.gold,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Admin Panel
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.sidebarText,
              padding: 4,
            }}
            className="sidebar-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flexGrow: 1, overflowY: "auto", padding: "16px 12px" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 24 }}>
              <p
                style={{
                  margin: "0 0 8px 8px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: C.gold,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {group.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      textDecoration: "none",
                      fontFamily: sans,
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      background: isActive ? C.sidebarActive : "transparent",
                      color: isActive ? C.gold : C.sidebarText,
                      border: isActive
                        ? `1px solid ${C.sidebarBorder}`
                        : "1px solid transparent",
                      transition: "all 0.15s",
                    })}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      if (!el.className.includes("active"))
                        el.style.background = C.sidebarHover;
                      el.style.color = C.sidebarTextHi;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      if (!el.getAttribute("aria-current"))
                        el.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {link.icon}
                      {link.title}
                    </span>
                    <ChevronRight size={13} style={{ opacity: 0.4 }} />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div
          style={{
            padding: "12px",
            borderTop: `1px solid ${C.sidebarBorder}`,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <button
            onClick={() => navigate("/browse")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "transparent",
              border: "none",
              color: C.sidebarText,
              fontFamily: sans,
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              width: "100%",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.sidebarHover;
              e.currentTarget.style.color = C.sidebarTextHi;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = C.sidebarText;
            }}
          >
            <Globe size={17} /> View Library
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "transparent",
              border: "none",
              color: "rgba(220,80,60,0.75)",
              fontFamily: sans,
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              width: "100%",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220,80,60,0.12)";
              e.currentTarget.style.color = "#e05040";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(220,80,60,0.75)";
            }}
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN AREA ══════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          // On desktop push content past the fixed sidebar
          marginLeft: 240,
        }}
        className="admin-main"
      >
        {/* ── Top header ── */}
        <header
          style={{
            height: 72,
            flexShrink: 0,
            background: C.surface,
            borderBottom: `1.5px solid ${C.goldBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            zIndex: 10,
          }}
        >
          {/* Left: hamburger (mobile) + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.inkMid,
                padding: 4,
              }}
              className="hamburger-btn"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2
                style={{
                  fontFamily: serif,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: C.ink,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Metadata Library System
              </h2>
              <p style={{ margin: 0, fontSize: "0.72rem", color: C.inkSoft }}>
                Administration Panel
              </p>
            </div>
          </div>

          {/* Right: user avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                Admin
              </p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: C.inkSoft }}>
                admin@library.com
              </p>
            </div>
            {/* Avatar */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: C.goldLight,
                border: `2px solid ${C.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: serif,
                fontWeight: 700,
                fontSize: "1rem",
                color: C.goldDark,
                flexShrink: 0,
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: C.bg,
            padding: "32px",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar {
            position: static !important;
            transform: none !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .hamburger-btn {
            display: none !important;
          }
          .sidebar-close-btn {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .admin-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
