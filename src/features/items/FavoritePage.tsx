// src/features/items/FavoritePage.tsx
import { Link, useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { useFavorites } from "../../hooks/itemsHooks/useFavorites";
import { Heart, Search } from "lucide-react";
import libraryHero from "../../assets/images/libraryHeroBrowse.png";
import ItemBottom from "../../assets/icons/ItemBottom.png";
import {
  extractMetadataValue,
  extractYear,
  computeRating,
} from "../../utils/helpers";

const BADGE_COLORS: Record<string, string> = {
  book: C.gold,
  manuscript: "#7c5c2e",
  article: "#4a7c59",
  digital: "#4a6a9c",
  other: C.inkSoft,
  default: C.inkSoft,
};

const COVER_COLORS: Record<string, string> = {
  book: "linear-gradient(145deg,#c8a040,#8b5e1a)",
  manuscript: "linear-gradient(145deg,#b8860b,#5c3a0a)",
  article: "linear-gradient(145deg,#6b8c6b,#2d4a2d)",
  digital: "linear-gradient(145deg,#5a7a9a,#2d4a6a)",
  other: "linear-gradient(145deg,#b09070,#6a4a2a)",
  default: "linear-gradient(145deg,#b09070,#6a4a2a)",
};

const getTypeBadge = (templateLabel: string) => {
  const l = templateLabel.toLowerCase();
  if (l.includes("book") || l.includes("كتاب"))
    return { label: "Book", key: "book" };
  if (l.includes("manuscript") || l.includes("مخطوط"))
    return { label: "Manuscript", key: "manuscript" };
  if (l.includes("article") || l.includes("مقال") || l.includes("journal"))
    return { label: "Article", key: "article" };
  if (
    l.includes("digital") ||
    l.includes("رقمي") ||
    l.includes("audio") ||
    l.includes("video")
  )
    return { label: "Digital Item", key: "digital" };
  return { label: templateLabel, key: "default" };
};

// ─────────────────────────────────────────────────────────────────────────────
export const FavoritePage = () => {
  const navigate = useNavigate();
  const {
    templates,
    loading,
    search,
    setSearch,
    view,
    setView,
    removeBookmark,
    filtered,
  } = useFavorites();

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "calc(100vh - 72px)",
        fontFamily: fonts.sans,
      }}
    >
      {/* ══════════ HERO SECTION ══════════ */}
      <div
        style={{ padding: "40px 48px 0", position: "relative", minHeight: 240 }}
      >
        <div
          style={{
            position: "absolute",
            height: "170%",
            width: "55%",
            right: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <img
            src={libraryHero}
            alt="Library Interior"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
        <div
          style={{
            maxWidth: 1280,
            padding: "0 48px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "flex-end",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ paddingBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: C.surface,
                border: `1px solid ${C.goldBorder}`,
                borderRadius: 999,
                padding: "5px 14px",
                marginBottom: 18,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <Heart size={12} color={C.danger} fill={C.danger} />
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: C.inkMid,
                  letterSpacing: "0.03em",
                }}
              >
                Personal Collection
              </span>
            </div>
            <h1
              style={{
                fontFamily: fonts.serif,
                margin: "0 0 4px",
                fontSize: "clamp(2.2rem,4vw,3.2rem)",
                fontWeight: 800,
                color: C.ink,
                lineHeight: 1.1,
              }}
            >
              Your Favorite
            </h1>
            <h1
              style={{
                fontFamily: fonts.serif,
                margin: "0 0 18px",
                fontSize: "clamp(2.2rem,4vw,3.2rem)",
                fontWeight: 800,
                color: C.gold,
                lineHeight: 1.1,
                fontStyle: "italic",
                position: "relative",
              }}
            >
              Items
            </h1>
            <div style={{ position: "relative" }}>
              <img
                src={ItemBottom}
                alt="Highlight"
                style={{
                  width: 240,
                  objectFit: "cover",
                  display: "block",
                  position: "absolute",
                  left: -25,
                  top: -80,
                }}
              />
            </div>
            <p
              style={{
                color: C.inkMid,
                fontSize: "0.92rem",
                lineHeight: 1.65,
                maxWidth: 380,
                margin: 0,
              }}
            >
              Access all the books, manuscripts, and articles you've saved for
              later reading and research.
            </p>
          </div>
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -40,
            right: 200,
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: `2px solid ${C.goldBorder}`,
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Search bar ── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "8px 48px 0",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={18}
              color={C.inkSoft}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                paddingLeft: 40,
                paddingRight: 12,
                paddingTop: 10,
                paddingBottom: 10,
                border: "none",
                fontFamily: fonts.sans,
                fontSize: "0.95rem",
                color: C.ink,
                background: "transparent",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              width: 1,
              height: 24,
              background: C.goldBorder,
              margin: "0 10px",
            }}
          />
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <ViewBtn active={view === "grid"} onClick={() => setView("grid")}>
              ⊞
            </ViewBtn>
            <ViewBtn active={view === "list"} onClick={() => setView("list")}>
              ☰
            </ViewBtn>
          </div>
        </div>
      </div>

      {/* ── Body content ── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 48px 60px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: fonts.sans,
              fontSize: "0.9rem",
              color: C.inkSoft,
              fontWeight: 600,
            }}
          >
            Showing {filtered.length} saved items
          </p>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: C.inkSoft,
              fontStyle: "italic",
            }}
          >
            Loading favorites...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: C.surface,
              borderRadius: 16,
              border: `1.5px dashed ${C.goldBorder}`,
            }}
          >
            <Heart
              size={48}
              color={C.goldBorder}
              style={{ margin: "0 auto 16px" }}
            />
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: "1.3rem",
                fontWeight: 700,
                color: C.inkMid,
                margin: "0 0 8px",
              }}
            >
              {search
                ? "No matches found in your favorites"
                : "Your favorites list is empty"}
            </p>
            <p
              style={{ color: C.inkSoft, fontSize: "0.9rem", marginBottom: 24 }}
            >
              {search
                ? "Try a different search term."
                : "Browse the library and click the heart icon to save items here."}
            </p>
            {!search && (
              <GoldBtn
                onClick={() => navigate("/browse")}
                style={{
                  borderRadius: 999,
                  padding: "10px 24px",
                  fontWeight: 700,
                }}
              >
                Browse Catalog
              </GoldBtn>
            )}
          </div>
        ) : view === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))",
              gap: 24,
            }}
          >
            {filtered.map((item) => {
              const title =
                extractMetadataValue(item, ["title", "عنوان"]) ??
                `Untitled #${item.id}`;
              const author =
                extractMetadataValue(item, ["author", "كاتب", "مؤلف"]) ??
                "Unknown Author";
              const year = extractYear(item) ?? "—";
              const tpl = templates.find((t) => t.id === item.templateId);
              const badgeConfig = getTypeBadge(tpl?.label || "");
              const coverGrad =
                COVER_COLORS[badgeConfig.key] ?? COVER_COLORS.default;
              const badgeColor =
                BADGE_COLORS[badgeConfig.key] ?? BADGE_COLORS.default;
              const rating = computeRating(item.id);

              return (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: C.surface,
                      borderRadius: 16,
                      overflow: "hidden",
                      border: `1.5px solid ${C.goldBorder}`,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow =
                        "0 14px 36px rgba(200,169,110,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 12px rgba(0,0,0,0.05)";
                    }}
                  >
                    {/* Cover image */}
                    <div
                      style={{
                        height: 160,
                        background: coverGrad,
                        position: "relative",
                        padding: 14,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          background: badgeColor,
                          color: "#fff",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 999,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {badgeConfig.label}
                      </span>

                      <button
                        onClick={(e) => removeBookmark(e, item.id)}
                        title="Remove from favorites"
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.95)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        <Heart size={18} fill={C.danger} color={C.danger} />
                      </button>
                    </div>

                    {/* Card body */}
                    <div
                      style={{
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: fonts.serif,
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: C.ink,
                          margin: "0 0 6px",
                          height: "2.6em",
                          lineHeight: "1.3em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={title}
                      >
                        {title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: C.inkSoft,
                          margin: "0 0 16px",
                          fontStyle: "italic",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        by {author}
                      </p>

                      <div
                        style={{
                          marginTop: "auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: `1px solid ${C.goldBorder}`,
                          paddingTop: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: C.inkSoft,
                            fontWeight: 600,
                            fontFamily: "monospace",
                          }}
                        >
                          ID: {item.id}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: C.goldDark,
                              fontWeight: 700,
                            }}
                          >
                            {year}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              fontSize: "0.75rem",
                            }}
                          >
                            <span style={{ color: C.gold }}>★</span>
                            <span style={{ fontWeight: 600, color: C.inkMid }}>
                              {rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              border: `1.5px solid ${C.goldBorder}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 150px 130px 80px 80px 50px",
                background: C.goldLight,
                borderBottom: `1.5px solid ${C.goldBorder}`,
                padding: "12px 18px",
              }}
            >
              {["#", "Title", "Author", "Category", "Year", "Rating", ""].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: C.inkSoft,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </span>
                )
              )}
            </div>
            {filtered.map((item, idx) => {
              const title =
                extractMetadataValue(item, ["title", "عنوان"]) ??
                `Untitled #${item.id}`;
              const author =
                extractMetadataValue(item, ["author", "كاتب", "مؤلف"]) ?? "—";
              const year = extractYear(item) ?? "—";
              const tpl = templates.find((t) => t.id === item.templateId);
              const badgeConfig = getTypeBadge(tpl?.label || "");
              const badgeColor =
                BADGE_COLORS[badgeConfig.key] ?? BADGE_COLORS.default;
              const rating = computeRating(item.id);

              return (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr 150px 130px 80px 80px 50px",
                    padding: "13px 18px",
                    alignItems: "center",
                    borderBottom:
                      idx < filtered.length - 1
                        ? `1px solid ${C.goldBorder}`
                        : "none",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.goldLight)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: C.inkSoft,
                      fontFamily: "monospace",
                    }}
                  >
                    {item.id}
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.serif,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: C.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      paddingRight: 10,
                    }}
                  >
                    {title}
                  </span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: C.inkMid,
                      fontStyle: "italic",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      paddingRight: 10,
                    }}
                  >
                    {author}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: badgeColor + "22",
                      color: badgeColor,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                      border: `1px solid ${badgeColor}44`,
                      whiteSpace: "nowrap",
                      width: "fit-content",
                    }}
                  >
                    {badgeConfig.label}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: C.inkSoft }}>
                    {year}
                  </span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 3 }}
                  >
                    <span style={{ color: C.gold }}>★</span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: C.inkMid,
                      }}
                    >
                      {rating}
                    </span>
                  </div>
                  <button
                    onClick={(e) => removeBookmark(e, item.id)}
                    title="Remove from favorites"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Heart size={18} fill={C.danger} color={C.danger} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ViewBtn = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    style={{
      width: 36,
      height: 36,
      borderRadius: 8,
      border: `1.5px solid ${active ? C.gold : "transparent"}`,
      background: active ? C.goldLight : "transparent",
      color: active ? C.goldDark : C.inkSoft,
      cursor: "pointer",
      fontSize: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
    }}
  >
    {children}
  </button>
);
