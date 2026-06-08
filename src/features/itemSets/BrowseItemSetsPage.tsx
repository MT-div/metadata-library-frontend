import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  FolderOpen,
  Globe,
  Lock,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import type { ItemSetResponse } from "../../types/metadata";

const C = {
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldMid: "rgba(200,169,110,0.15)",
  goldBorder: "rgba(200,169,110,0.30)",
  goldDark: "#b8965a",
  ink: "#1a1208",
  inkMid: "#5c4a30",
  inkSoft: "#9a8060",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

export const BrowseItemSetsPage = () => {
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/itemsets")
      .then((r) => r.json())
      .then((data) => {
        setItemSets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleOpenSet = (setId: number) =>
    navigate("/browse", { state: { itemSet: setId.toString() } });

  const filtered = itemSets.filter(
    (s) =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const publicCount = itemSets.filter((s) => s.isPublic).length;
  const privateCount = itemSets.length - publicCount;
  const totalItems = itemSets.reduce(
    (acc, s) => acc + (s.items?.length || 0),
    0
  );

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "calc(100vh - 72px)",
        fontFamily: sans,
      }}
    >
      {/* ══════════ HERO ══════════ */}
      <div
        style={{
          // background: `linear-gradient(to bottom, #ede7db, ${C.bg})`,
          background: C.bg,
          borderBottom: `1.5px solid ${C.goldBorder}`,
          padding: "44px 48px 36px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 20,
              position: "relative",
              zIndex: 2,
            }}
          >
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
                  padding: "5px 14px",
                  marginBottom: 14,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <FolderOpen size={13} color={C.gold} />
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: C.ink,
                    letterSpacing: "0.04em",
                  }}
                >
                  Library Collections
                </span>
              </div>

              <h1
                style={{
                  fontFamily: serif,
                  fontSize: "clamp(1.8rem,3vw,2.6rem)",
                  fontWeight: 800,
                  color: C.ink,
                  margin: "0 0 8px",
                  letterSpacing: "-0.02em",
                }}
              >
                Browse Collections
              </h1>
              <p style={{ color: C.inkSoft, fontSize: "0.9rem", margin: 0 }}>
                <span style={{ color: C.gold, fontWeight: 700 }}>
                  {itemSets.length}
                </span>{" "}
                collections
                {" · "}
                <span style={{ color: C.gold, fontWeight: 700 }}>
                  {totalItems}
                </span>{" "}
                total items
              </p>
            </div>

            {/* New collection button */}
            <button
              onClick={() => navigate("/itemsets/new")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: C.gold,
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "12px 24px",
                fontSize: "0.88rem",
                fontWeight: 700,
                fontFamily: sans,
                cursor: "pointer",
                transition: "background 0.2s",
                boxShadow: "0 4px 16px rgba(200,169,110,0.35)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.goldDark)
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
            >
              <Plus size={16} /> New Collection
            </button>
          </div>

          {/* ── Stats row ── */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Total Collections", value: itemSets.length, icon: "🗂" },
              { label: "Public", value: publicCount, icon: "🌐" },
              { label: "Private", value: privateCount, icon: "🔒" },
              { label: "Total Items", value: totalItems, icon: "📄" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: C.surface,
                  border: `1.5px solid ${C.goldBorder}`,
                  borderRadius: 14,
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  minWidth: 150,
                }}
              >
                <span style={{ fontSize: 22 }}>{stat.icon}</span>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.68rem",
                      color: C.inkSoft,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: C.ink,
                      fontFamily: serif,
                    }}
                  >
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ SEARCH + CONTENT ══════════ */}
      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 0px 60px" }}
      >
        {/* Search bar */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 14,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <Search size={17} color={C.inkSoft} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search collections by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: sans,
              fontSize: "0.88rem",
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
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
          <span
            style={{ fontSize: "0.78rem", color: C.inkSoft, flexShrink: 0 }}
          >
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: C.inkSoft,
              fontStyle: "italic",
            }}
          >
            Loading collections...
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div
            style={{
              textAlign: "center",
              padding: "72px 24px",
              background: C.surface,
              borderRadius: 20,
              border: `1.5px dashed ${C.goldBorder}`,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: C.goldLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Folder size={34} color={C.gold} strokeWidth={1.5} />
            </div>
            <h3
              style={{
                fontFamily: serif,
                fontSize: "1.3rem",
                fontWeight: 700,
                color: C.ink,
                margin: "0 0 8px",
              }}
            >
              {search
                ? "No collections match your search"
                : "No collections yet"}
            </h3>
            <p
              style={{
                color: C.inkSoft,
                fontSize: "0.88rem",
                margin: "0 0 24px",
              }}
            >
              {search
                ? "Try different keywords."
                : "Create your first collection to organize items."}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/itemsets/new")}
                style={{
                  background: C.gold,
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  padding: "11px 28px",
                  fontFamily: sans,
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(200,169,110,0.35)",
                }}
              >
                <Plus size={15} /> Create Collection
              </button>
            )}
          </div>
        ) : (
          /* ── Grid ── */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 22,
            }}
          >
            {filtered.map((set) => (
              <CollectionCard
                key={set.id}
                set={set}
                onOpen={() => handleOpenSet(set.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Collection Card ───────────────────────────────────────────────────────────
const CollectionCard = ({
  set,
  onOpen,
}: {
  set: ItemSetResponse;
  onOpen: () => void;
}) => {
  const itemCount = set.items?.length || 0;

  // Deterministic pastel cover color based on id
  const COVERS = [
    "linear-gradient(145deg,#c8a040,#8b5e1a)",
    "linear-gradient(145deg,#b8860b,#5c3a0a)",
    "linear-gradient(145deg,#b09070,#6a4a2a)",
  ];
  const cover = COVERS[set.id % COVERS.length];

  return (
    <div
      onClick={onOpen}
      style={{
        background: C.surface,
        border: `1.5px solid ${C.goldBorder}`,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-5px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 14px 36px rgba(200,169,110,0.22)";
        (e.currentTarget as HTMLDivElement).style.borderColor = C.gold;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(0,0,0,0.05)";
        (e.currentTarget as HTMLDivElement).style.borderColor = C.goldBorder;
      }}
    >
      {/* Cover strip */}
      <div
        style={{
          height: 90,
          background: cover,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Folder icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(255,255,255,0.22)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Folder size={28} color="#fff" strokeWidth={1.5} />
        </div>

        {/* Public / Private badge */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(4px)",
            border: `1px solid ${
              set.isPublic ? "rgba(74,156,90,0.4)" : "rgba(180,120,40,0.4)"
            }`,
            color: set.isPublic ? "#2d6e3a" : "#7c5010",
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            letterSpacing: "0.04em",
          }}
        >
          {set.isPublic ? (
            <>
              <Globe size={11} /> Public
            </>
          ) : (
            <>
              <Lock size={11} /> Private
            </>
          )}
        </span>

        {/* Item count bubble */}
        <span
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(4px)",
            color: C.inkMid,
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            border: `1px solid ${C.goldBorder}`,
          }}
        >
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "18px 20px 20px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            fontFamily: serif,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: C.ink,
            margin: "0 0 8px",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {set.title}
        </h3>

        <p
          style={{
            fontSize: "0.82rem",
            color: C.inkSoft,
            lineHeight: 1.6,
            margin: "0 0 auto",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.6em",
          }}
        >
          {set.description || "No description for this collection."}
        </p>

        {/* Footer */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${C.goldBorder}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: -6 }}>
            {/* Item count mini-bar */}
            <div
              style={{
                height: 4,
                width: Math.min(itemCount * 8, 80),
                background: C.gold,
                borderRadius: 999,
                minWidth: 8,
              }}
            />
            <div
              style={{
                height: 4,
                width: 80,
                background: C.goldBorder,
                borderRadius: 999,
                marginLeft: -Math.min(itemCount * 8, 80),
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: C.gold,
              transition: "gap 0.2s",
            }}
          >
            Browse <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
