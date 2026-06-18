import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { Globe, ChevronDown } from "lucide-react";
import openBookIcon from "../assets/icons/open-book.svg";
import leafs from "../assets/images/leafs.png";
import { useAuthStore } from "../store/useAuthStore";

export const MainLayout = () => {
  const { isAuthenticated, isAdmin, isLibrarian, logout } = useAuthStore();
  const canAccessAdmin = isAdmin() || isLibrarian();

  const navigate = useNavigate();
  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Explore", path: "/browse" },
    { title: "Favorite", path: "/favorite" },
    { title: "Collections", path: "/itemsets" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#faf6f0",
      }}
    >
      <img
        src={leafs}
        alt="leafs"
        style={{
          position: "absolute",
          width: 200,
          top: " 10%",
          left: -40,
          opacity: 0.5,
          zIndex: 1,
        }}
      />
      {/* ═══════════════════════════ NAVBAR ═══════════════════════════ */}
      <header
        style={{
          background: "#faf6f0",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(200,169,110,0.2)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 32px",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* ── Logo ── */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                backgroundColor: "#c8a96e",
                WebkitMaskImage: `url(${openBookIcon})`,
                maskImage: `url(${openBookIcon})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                display: "inline-block",
                marginTop: 10,
              }}
            />
            <span
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: 700,
                fontSize: "2.2rem",
                color: "#c8a96e",
                letterSpacing: "-0.01em",
              }}
            >
              HIASTica
            </span>
          </Link>

          {/* ── Center Nav Links ── */}
          <nav style={{ display: "flex", alignItems: "center", gap: 48 }}>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                style={({ isActive }) => ({
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#c8a96e" : "#4a3a20",
                  borderBottom: isActive
                    ? "2px solid #c8a96e"
                    : "2px solid transparent",
                  paddingBottom: 2,
                  transition: "color 0.2s, border-color 0.2s",
                })}
              >
                {link.title}
              </NavLink>
            ))}
          </nav>

          {/* ── Right: Language + Sign In / User Action ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Language selector */}
            <button
              onClick={() => alert("سيتم اضافة الكسير من اللغات لاحقا ")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#4a3a20",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              <Globe size={16} color="#4a3a20" />
              EN
              <ChevronDown size={14} color="#4a3a20" />
            </button>

            {/* 👇 الزر الذكي المحدث */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                } else if (canAccessAdmin) {
                  navigate("/admin");
                } else {
                  // المستخدم العادي: نقوم بتسجيل خروجه ونوجهه للرئيسية
                  logout();
                  navigate("/");
                }
              }}
              style={{
                background: "#c8a96e",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "9px 22px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#b8965a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#c8a96e")
              }
            >
              {!isAuthenticated
                ? "Sign In"
                : canAccessAdmin
                ? "Admin Panel"
                : "Sign Out"}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div
          style={{
            display: "none",
          }}
          className="mobile-nav"
        />
      </header>

      {/* ═══════════════════════════ CONTENT ═══════════════════════════ */}
      <main style={{ flexGrow: 1, background: "#faf6f0" }}>
        <Outlet />
      </main>

      {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
      <footer
        style={{
          background: "#1a1208",
          color: "#a08060",
          padding: "28px 32px",
          fontSize: "0.85rem",
          zIndex: 10,
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            fontFamily: "sans-serif",
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} HIASTica · Metadata Library System. All
            rights reserved.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            <Link
              to="/browse"
              style={{ color: "#a08060", textDecoration: "none" }}
            >
              Explore
            </Link>
            <Link
              to="/itemsets"
              style={{ color: "#a08060", textDecoration: "none" }}
            >
              Collections
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
