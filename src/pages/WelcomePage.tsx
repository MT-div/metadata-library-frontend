import { useNavigate } from "react-router-dom";

import openBookIcon from "../assets/icons/open-book.png";
import compassIcon from "../assets/icons/compass.svg";
import usersIcon from "../assets/icons/users.svg";
import bookMarkedIcon from "../assets/icons/book-marked.svg";
import vasePng from "../assets/icons/vase.png";
import libraryHero from "../assets/images/libraryHero5.png";
import backVase from "../assets/icons/backVase.png"; // uncomment when file is ready

// ─── 4-point star ────────────────────────────────────────────────────────────
const Sparkle = ({
  size = 14,
  color = "#c8a96e",
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

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: "#F7F3ED",
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
          bottom: -55, // sits above the feature strip
          left: -20,
          width: 220,
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
          bottom: -75, // sits above the feature strip
          left: -20,
          width: 220,
          zIndex: 0,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.10))",
          pointerEvents: "none",
        }}
      />
      {/* <img
        src={vasePng}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          bottom: -55, // sits above the feature strip
          right: -20,
          width: 220,
          zIndex: 4,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.10))",
          pointerEvents: "none",
        }}
      /> */}
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
          border: "3px solid #c8a96e",
          opacity: 0.4,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── Vase plant — absolute (not fixed!) so it stays in page flow ── */}

      {/* ═══════════ HERO ═══════════ */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 48px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // equal halves — balanced layout
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
              background: "#f0e8d8",
              border: "1px solid #dbc9a4",
              borderRadius: 999,
              padding: "7px 16px",
              marginBottom: 16,
            }}
          >
            <Sparkle size={24} />
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#8a6a3a",
                fontFamily: "sans-serif",
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
                color: "#1a1208",
              }}
            >
              Welcome to
            </span>
            <span
              style={{
                display: "block",
                fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
                fontWeight: 800,
                color: "#c8a96e",
                fontStyle: "italic",
              }}
            >
              HIASTica
            </span>
          </h1>

          {/* Body */}
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1rem",
              color: "#5c4a30",
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
            <button
              onClick={() => navigate("/browse")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#c8a96e",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "15px 32px",
                fontSize: "0.95rem",
                fontWeight: 700,
                fontFamily: "sans-serif",
                cursor: "pointer",
                transition: "background 0.2s",
                boxShadow: "0 4px 20px rgba(200,169,110,0.4)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#b8965a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#c8a96e")
              }
            >
              Enter HIASTica <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate("/admin")}
              style={{
                background: "transparent",
                color: "#3d2b0e",
                border: "2px solid #c8a96e",
                borderRadius: 999,
                padding: "13px 28px",
                fontSize: "0.95rem",
                fontWeight: 600,
                fontFamily: "sans-serif",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0e8d8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Explore Features
            </button>
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
            border: "1.5px solid rgba(200,169,110,0.2)",
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
            color: "#c8a96e",
            fontStyle: "italic",
            fontSize: "1rem",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontFamily: "'Georgia', serif",
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
        background: "#f5efe5",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: "1px solid rgba(200,169,110,0.3)",
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
          color: "#1a1208",
          fontFamily: "sans-serif",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "0.78rem",
          color: "#7a5c30",
          lineHeight: 1.55,
          fontFamily: "sans-serif",
        }}
      >
        {desc}
      </p>
    </div>
  </div>
);
