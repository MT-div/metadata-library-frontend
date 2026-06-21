import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ArrowRightLeft,
  Users,
  Archive,
  Menu,
  X,
  LogOut,
  Globe,
  ChevronRight,
  Clock,
  History,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const C = {
  sidebarBg: "#1e1508",
  sidebarBorder: "rgba(200,169,110,0.15)",
  sidebarHover: "rgba(200,169,110,0.10)",
  sidebarActive: "rgba(200,169,110,0.18)",
  sidebarText: "rgba(255,245,225,0.65)",
  sidebarTextHi: "rgba(255,245,225,0.95)",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldBorder: "rgba(200,169,110,0.28)",
  goldDark: "#b8965a",
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  ink: "#1a1208",
  inkMid: "#5c4a30",
  inkSoft: "#9a8060",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

const NAV_GROUPS = [
  {
    label: "Desk Operations",
    links: [
      {
        title: "Dashboard",
        path: "/librarian/dashboard",
        icon: <LayoutDashboard size={17} />,
      },
      {
        title: "Circulation Desk",
        path: "/librarian/circulation",
        icon: <ArrowRightLeft size={17} />,
      },
      {
        title: "Active Loans",
        path: "/librarian/loans",
        icon: <Clock size={17} />,
      },
      {
        title: "Loans History",
        path: "/librarian/history",
        icon: <History size={17} />,
      },
    ],
  },
  {
    label: "Library Catalog",
    links: [
      {
        title: "Patrons",
        path: "/librarian/patrons",
        icon: <Users size={17} />,
      },
      {
        title: "Catalog Items",
        path: "/librarian/items",
        icon: <Archive size={17} />,
      },
      {
        title: "Item Copies",
        path: "/librarian/copies",
        icon: <BookOpen size={17} />,
      },
    ],
  },
];

export const LibrarianLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

      <aside
        style={{
          width: 240,
          background: C.sidebarBg,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          zIndex: 30,
          borderRight: `1px solid ${C.sidebarBorder}`,
          position: "fixed" as const,
          top: 0,
          bottom: 0,
          left: 0,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
        className="admin-sidebar"
      >
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
              <BookOpen size={16} color="#fff" />
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
                Librarian Desk
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
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {link.icon} {link.title}
                    </span>
                    <ChevronRight size={13} style={{ opacity: 0.4 }} />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

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
          >
            <Globe size={17} /> View Library
          </button>
          <button
            onClick={handleLogout}
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
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          marginLeft: 240,
        }}
        className="admin-main"
      >
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
                HIASTica Library
              </h2>
              <p style={{ margin: 0, fontSize: "0.72rem", color: C.inkSoft }}>
                Librarian Control Panel
              </p>
            </div>
          </div>
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
                {user?.userName}
              </p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: C.inkSoft }}>
                {user?.email}
              </p>
            </div>
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
              {user?.userName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

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
      <style>{`
        @media (min-width: 1024px) { .admin-sidebar { position: static !important; transform: none !important; } .admin-main { margin-left: 0 !important; } .hamburger-btn { display: none !important; } .sidebar-close-btn { display: none !important; } }
        @media (max-width: 1023px) { .admin-main { margin-left: 0 !important; } }
      `}</style>
    </div>
  );
};
