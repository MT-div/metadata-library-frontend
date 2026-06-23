// src/layouts/MainLayout.tsx
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { C, fonts } from "../utils/theme";
import { GoldBtn } from "../components/ui/GoldBtn";
import { useAuthStore } from "../store/useAuthStore";
import { Globe, ChevronDown } from "lucide-react";
import openBookIcon from "../assets/icons/open-book.svg";
import leafs from "../assets/images/leafs.png";

export const MainLayout = () => {
  const { isAuthenticated, isAdmin, isLibrarian, logout } = useAuthStore();
  const canAccessAdmin = isAdmin();
  const canAccessLibrarian = isLibrarian();

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
        background: C.bg,
      }}
    >
      <img
        src={leafs}
        alt="leafs"
        style={{
          position: "absolute",
          width: 200,
          top: "10%",
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
          borderBottom: `1px solid ${C.sidebarBorder}`,
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
          {/* Logo */}
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
                backgroundColor: C.gold,
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
                fontFamily: fonts.serif,
                fontWeight: 700,
                fontSize: "2.2rem",
                color: C.gold,
                letterSpacing: "-0.01em",
              }}
            >
              HIASTica
            </span>
          </Link>

          {/* Center Nav Links */}
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
                  color: isActive ? C.gold : C.inkMid,
                  borderBottom: isActive
                    ? `2px solid ${C.gold}`
                    : "2px solid transparent",
                  paddingBottom: 2,
                  transition: "color 0.2s, border-color 0.2s",
                })}
              >
                {link.title}
              </NavLink>
            ))}
          </nav>

          {/* Right: Language + Sign In / User Action */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Language selector */}
            <button
              onClick={() => alert("سيتم اضافة الكثير من اللغات لاحقاً")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: C.inkMid,
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              <Globe size={16} color={C.inkMid} />
              EN
              <ChevronDown size={14} color={C.inkMid} />
            </button>

            {/* Smart Action Button */}
            <GoldBtn
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                } else if (canAccessAdmin) {
                  navigate("/admin");
                } else if (canAccessLibrarian) {
                  navigate("/librarian");
                } else {
                  logout();
                  navigate("/");
                }
              }}
              style={{
                borderRadius: 999,
                padding: "9px 22px",
                fontSize: "0.875rem",
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              {!isAuthenticated
                ? "Sign In"
                : canAccessAdmin
                ? "Admin Panel"
                : canAccessLibrarian
                ? "Librarian Panel"
                : "Sign Out"}
            </GoldBtn>
          </div>
        </div>

        <div
          style={{
            display: "none",
          }}
          className="mobile-nav"
        />
      </header>

      {/* ═══════════════════════════ CONTENT ═══════════════════════════ */}
      <main style={{ flexGrow: 1, background: C.bg }}>
        <Outlet />
      </main>

      {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
      <footer
        style={{
          background: C.ink,
          color: C.inkSoft,
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
            fontFamily: fonts.sans,
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} HIASTica · Metadata Library System. All
            rights reserved.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            <Link
              to="/browse"
              style={{ color: C.inkSoft, textDecoration: "none" }}
            >
              Explore
            </Link>
            <Link
              to="/itemsets"
              style={{ color: C.inkSoft, textDecoration: "none" }}
            >
              Collections
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
