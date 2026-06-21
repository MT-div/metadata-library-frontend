// src/pages/WelcomePage.tsx
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../utils/theme";
import { GoldBtn } from "../components/ui/GoldBtn";
import { OutlineBtn } from "../components/ui/OutlineBtn";
import { useAuthStore } from "../store/useAuthStore";

import openBookIcon from "../assets/icons/open-book.png";
import compassIcon from "../assets/icons/compass.svg";
import usersIcon from "../assets/icons/users.svg";
import bookMarkedIcon from "../assets/icons/book-marked.svg";
import vasePng from "../assets/icons/vase.png";
import backVase from "../assets/icons/backVase.png";
import libraryHero from "../assets/images/libraryHero6.png";

// ─── 4-point star ────────────────────────────────────────────────────────────
const Sparkle = ({
  size = 14,
  color = C.gold,
}: {
  size?: number;
  color?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1 L9 7 L15 8 L9 9 L8 15 L7 9 L1 8 L7 7 Z" fill={color} />
  </svg>
);

// ─── Arrow right ─────────────────────────────────────────────────────────────
const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: openBookIcon,
    isImg: true,
    title: "Track Your Journey",
    desc: "Log your reads, set goals, and build your library.",
  },
  {
    icon: compassIcon,
    isImg: false,
    title: "Discover More",
    desc: "Explore books, collections, and recommendations.",
  },
  {
    icon: usersIcon,
    isImg: false,
    title: "For Everyone",
    desc: "A space for readers, learners, and creators.",
  },
  {
    icon: bookMarkedIcon,
    isImg: false,
    title: "Refined Experience",
    desc: "Clean, calm, and focused on what matters.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAdmin, isLibrarian } = useAuthStore();
  const canAccessAdmin = isAdmin() || isLibrarian();
  return (
    <div
      style={{
        fontFamily: fonts.serif,
        background: C.bg,
        width: "100%",
        minHeight: "calc(100vh - 72px)",
        overflowX: "hidden",
        position: "relative",
        overflowY: "hidden",
      }}
    >
      <img
        src={vasePng}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          bottom: -55,
          left: -20,
          width: 240,
          zIndex: 4,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.10))",
          pointerEvents: "none",
        }}
      />
      <img
        src={backVase}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          bottom: -110,
          left: -20,
          width: 260,
          zIndex: 0,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.10))",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          height: "75%",
          right: 0,
          top: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={libraryHero}
            alt="HIASTica Library Interior"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              zIndex: 3,
            }}
          />
        </div>
      </div>

      {/* ── Decorative background radial blobs ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -60,
          right: -80,
          width: 480,
          height: 480,
          background: "radial-gradient(ellipse, #e8d4b0 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 180,
          left: -80,
          width: 340,
          height: 340,
          background: "radial-gradient(ellipse, #eddfc4 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Gold ring arc (decorative) ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 230,
          left: 80,
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: `3px solid ${C.gold}`,
          opacity: 0.4,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ═══════════ HERO ═══════════ */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 48px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── LEFT: Copy ── */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.surface,
              border: `1px solid ${C.goldBorder}`,
              borderRadius: 999,
              padding: "7px 16px",
              marginBottom: 16,
            }}
          >
            <Sparkle size={12} />
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: C.goldDark,
                fontFamily: fonts.sans,
              }}
            >
              Your Journey Begins Here
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              margin: "0 0 20px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
                fontWeight: 800,
                color: C.ink,
              }}
            >
              Welcome to
            </span>
            <span
              style={{
                display: "block",
                fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
                fontWeight: 800,
                color: C.gold,
                fontStyle: "italic",
              }}
            >
              HIASTica
            </span>
          </h1>

          {/* Body */}
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: "1rem",
              color: C.inkMid,
              lineHeight: 1.8,
              marginBottom: 40,
              maxWidth: 400,
            }}
          >
            A calm digital space for readers, learners,
            <br />
            and creators. Track your reading journey,
            <br />
            and enjoy a refined reading experience.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <GoldBtn
              onClick={() => navigate("/browse")}
              style={{
                borderRadius: 999,
                padding: "15px 32px",
                fontSize: "0.95rem",
                boxShadow: "0 4px 20px rgba(200,169,110,0.4)",
              }}
            >
              Enter HIASTica <ArrowRight size={16} />
            </GoldBtn>

            <OutlineBtn
              onClick={() => navigate("/admin")}
              rounded
              style={{
                color: C.ink,
                border: `2px solid ${C.gold}`,
                padding: "13px 28px",
                fontSize: "0.95rem",
                display: canAccessAdmin ? "block" : "none",
              }}
            >
              Explore Features
            </OutlineBtn>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE STRIP ═══════════ */}
      <section
        style={{
          maxWidth: 1280,
          margin: "24px auto",
          padding: "0 48px 30px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: "#faf6f0",
            border: `1.5px solid ${C.goldBorder}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
            borderRadius: 20,
            padding: "32px 40px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureItem key={i} {...f} />
          ))}
        </div>

        {/* Italic quote */}
        <p
          style={{
            textAlign: "center",
            marginTop: 32,
            color: C.gold,
            fontStyle: "italic",
            fontSize: "1rem",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontFamily: fonts.serif,
          }}
        >
          <Sparkle size={13} />
          "A space to read, reflect, and grow."
          <Sparkle size={13} />
        </p>
      </section>
    </div>
  );
};

// ─── Feature Item ─────────────────────────────────────────────────────────────
const FeatureItem = ({
  icon,
  isImg,
  title,
  desc,
}: {
  icon: string;
  isImg: boolean;
  title: string;
  desc: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "10px 12px",
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        background: C.bg,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: `1px solid ${C.goldBorder}`,
      }}
    >
      <img
        src={icon}
        alt=""
        style={{
          width: isImg ? 26 : 24,
          height: isImg ? 26 : 24,
          objectFit: "contain",
          filter:
            "brightness(0) saturate(100%) invert(18%) sepia(15%) saturate(800%) hue-rotate(10deg)",
        }}
      />
    </div>
    <div>
      <p
        style={{
          margin: "0 0 4px",
          fontWeight: 700,
          fontSize: "0.88rem",
          color: C.ink,
          fontFamily: fonts.sans,
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "0.78rem",
          color: C.inkSoft,
          lineHeight: 1.55,
          fontFamily: fonts.sans,
        }}
      >
        {desc}
      </p>
    </div>
  </div>
);
