import { useState, useEffect } from "react";
import type {
  ItemResponse,
  ResourceTemplateResponse,
  ItemSetResponse,
} from "../../types/metadata";
import { Link, useLocation } from "react-router-dom";
import libraryHero from "../../assets/images/libraryHeroBrowse.png";
import ItemBottom from "../../assets/icons/ItemBottom.png";

// uncomment when file is ready

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldMid: "rgba(200,169,110,0.18)",
  goldBorder: "rgba(200,169,110,0.30)",
  goldDark: "#b8965a",
  ink: "#1a1208",
  inkMid: "#5c4a30",
  inkSoft: "#9a8060",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

// ── Static category counts (replace with API data when /api/stats is ready) ──
// TODO: replace with fetch("/api/stats") when backend endpoint is available
const CATEGORIES = [
  { label: "All Items", count: 0, icon: "📚", key: "all" },
  { label: "Books", count: 0, icon: "📖", key: "book" },
  { label: "Manuscripts", count: 0, icon: "📜", key: "manuscript" },
  { label: "Articles", count: 0, icon: "📄", key: "article" },
  { label: "Collections", count: 0, icon: "🗂", key: "collection" },
  { label: "Digital Items", count: 0, icon: "💻", key: "digital" },
];

// ── Type badge colors ─────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  book: "#c8a96e",
  manuscript: "#7c5c2e",
  article: "#4a7c59",
  digital: "#4a6a9c",
  default: "#9a8060",
};

// ── Placeholder cover images per type ────────────────────────────────────────
// TODO: replace with real cover images from /api/items/{id}/cover when available
const COVER_COLORS: Record<string, string> = {
  book: "linear-gradient(145deg,#c8a040,#8b5e1a)",
  manuscript: "linear-gradient(145deg,#b8860b,#5c3a0a)",
  article: "linear-gradient(145deg,#6b8c6b,#2d4a2d)",
  digital: "linear-gradient(145deg,#5a7a9a,#2d4a6a)",
  default: "linear-gradient(145deg,#b09070,#6a4a2a)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getTypeBadge = (templateLabel: string) => {
  const l = templateLabel.toLowerCase();
  if (l.includes("كتاب") || l.includes("book"))
    return { label: "Book", key: "book" };
  if (l.includes("مخطوط") || l.includes("manuscript"))
    return { label: "Manuscript", key: "manuscript" };
  if (l.includes("مقالة") || l.includes("article"))
    return { label: "Article", key: "article" };
  if (l.includes("رقمي") || l.includes("digital"))
    return { label: "Digital Item", key: "digital" };
  return { label: templateLabel, key: "default" };
};

// ─────────────────────────────────────────────────────────────────────────────
export const BrowseItemsPage = () => {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [tplId, setTplId] = useState<string>(location.state?.template ?? "all");
  const [setId, setSetId] = useState<string>(location.state?.itemSet ?? "all");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [catFilter, setCatFilter] = useState("all");

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    Promise.all([
      fetch("/api/items").then((r) => r.json()),
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/itemsets").then((r) => r.json()),
    ])
      .then(([i, t, s]) => {
        setItems(i);
        setTemplates(t);
        setItemSets(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const extract = (item: ItemResponse, labels: string[]) =>
    item.metadataValues.find((v) =>
      labels.some((l) => v.propertyLabel.includes(l))
    )?.valueText ?? null;

  // TODO: extract year from metadata when date property is standardized
  const extractYear = (item: ItemResponse) =>
    extract(item, ["تاريخ", "سنة", "Date", "Year", "year"]) ?? null;

  // TODO: extract rating from /api/items/{id}/ratings when endpoint is ready
  const MOCK_RATING = (id: number) => (3.5 + (id % 15) * 0.1).toFixed(1);

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.metadataValues.some((v) =>
        v.valueText?.toLowerCase().includes(search.toLowerCase())
      );
    const matchTpl = tplId === "all" || item.templateId?.toString() === tplId;
    let matchSet = true;
    if (setId !== "all") {
      const s = itemSets.find((s) => s.id.toString() === setId);
      matchSet = s?.items?.some((i) => i.id === item.id) ?? false;
    }
    return matchSearch && matchTpl && matchSet;
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Category pill counts ──────────────────────────────────────────────────
  const cats = CATEGORIES.map((c) => ({
    ...c,
    count:
      c.key === "all"
        ? items.length
        : items.filter((it) => {
            const tpl = templates.find((t) => t.id === it.templateId);
            return tpl ? getTypeBadge(tpl.label).key === c.key : false;
          }).length,
  }));

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "calc(100vh - 72px)",
        fontFamily: sans,
      }}
    >
      {/* ══════════ HERO SECTION ══════════ */}
      <div
        style={{
          // background: C.bg,
          padding: "40px 48px 0",
          position: "relative",
          minHeight: 240,
        }}
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
            alt="HIASTica Library Interior"
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
            padding: "0  48px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "flex-end",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Left: title */}
          <div style={{ paddingBottom: 32 }}>
            {/* Badge */}
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
              <span style={{ fontSize: 12, color: C.gold }}>✦</span>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: C.inkMid,
                  letterSpacing: "0.03em",
                }}
              >
                Explore Our Collection
              </span>
            </div>

            <h1
              style={{
                fontFamily: serif,
                margin: "0 0 4px",
                fontSize: "clamp(2.2rem,4vw,3.2rem)",
                fontWeight: 800,
                color: C.ink,
                lineHeight: 1.1,
              }}
            >
              Discover Our
            </h1>
            <h1
              style={{
                fontFamily: serif,
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
            <div
              style={{
                position: "relative",
              }}
            >
              <img
                src={ItemBottom}
                alt="ItemBottom"
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
              Browse through unique resources, books, manuscripts,
              <br />
              and digital items from our library.
            </p>
          </div>

          {/* Right: hero image */}
          {/* TODO: replace src with actual hero image path once added to assets */}
        </div>

        {/* Decorative gold blob */}
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

      {/* ══════════ SEARCH + FILTER BAR ══════════ */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "8px 24px 0",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: C.bg,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 2px 16px rgba(0,0,0,0.6)",
          }}
        >
          {/* Search */}
          <div
            style={{
              position: "relative",
              flex: "1 1 260px",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                color: C.inkSoft,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search items, titles, authors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                paddingLeft: 38,
                paddingRight: 12,
                paddingTop: 9,
                paddingBottom: 9,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 10,
                fontFamily: sans,
                fontSize: "0.85rem",
                color: C.ink,
                background: C.surface,

                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e) => (e.target.style.borderColor = C.goldBorder)}
            />
          </div>

          {/* All Types */}
          <Select
            value={tplId}
            onChange={(v) => {
              setTplId(v);
              setPage(1);
            }}
          >
            <option value="all">All Types</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>

          {/* All Collections */}
          <Select
            value={setId}
            onChange={(v) => {
              setSetId(v);
              setPage(1);
            }}
          >
            <option value="all">All Collections</option>
            {itemSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </Select>

          {/* Sort */}
          {/* TODO: wire sortBy to API when /api/items?sort= is supported */}
          <Select value={sortBy} onChange={setSortBy}>
            <option value="newest">Date Added</option>
            <option value="title">Title A–Z</option>
            <option value="rating">Top Rated</option>
          </Select>

          {/* View toggles */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginLeft: "auto",
              flexShrink: 0,
            }}
          >
            <ViewBtn active={view === "grid"} onClick={() => setView("grid")}>
              ⊞
            </ViewBtn>
            <ViewBtn active={view === "list"} onClick={() => setView("list")}>
              ☰
            </ViewBtn>
          </div>
        </div>
      </div>

      {/* ══════════ BODY ══════════ */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 48px 60px",
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* ── LEFT: Category tabs + Items ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category pills row */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {cats.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setCatFilter(c.key);
                  setPage(1);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: catFilter === c.key ? C.goldLight : C.surface,
                  border: `1.5px solid ${
                    catFilter === c.key ? C.gold : C.goldBorder
                  }`,
                  borderRadius: 12,
                  padding: "10px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow:
                    catFilter === c.key
                      ? `0 2px 12px rgba(200,169,110,0.25)`
                      : "none",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: catFilter === c.key ? C.goldMid : C.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {c.icon}
                </span>
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.7rem",
                      color: C.inkSoft,
                      fontWeight: 400,
                    }}
                  >
                    {c.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: catFilter === c.key ? C.gold : C.ink,
                      fontFamily: serif,
                    }}
                  >
                    {c.count.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
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
              Loading items...
            </div>
          ) : paged.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                background: C.surface,
                borderRadius: 16,
                border: `1.5px dashed ${C.goldBorder}`,
              }}
            >
              <p
                style={{
                  fontFamily: serif,
                  fontSize: "1.2rem",
                  color: C.inkMid,
                  margin: "0 0 8px",
                }}
              >
                No items found
              </p>
              <p style={{ color: C.inkSoft, fontSize: "0.85rem" }}>
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : view === "grid" ? (
            /* ── GRID VIEW ── */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
                gap: 20,
              }}
            >
              {paged.map((item) => {
                const title =
                  extract(item, ["عنوان", "Title"]) ?? `Untitled #${item.id}`;
                const author =
                  extract(item, ["مؤلف", "كاتب", "Author"]) ?? "Unknown";
                const year = extractYear(item) ?? "—";
                const tpl = templates.find((t) => t.id === item.templateId);
                const badge = tpl
                  ? getTypeBadge(tpl.label)
                  : { label: "Item", key: "default" };
                const coverGrad =
                  COVER_COLORS[badge.key] ?? COVER_COLORS.default;
                const badgeColor =
                  BADGE_COLORS[badge.key] ?? BADGE_COLORS.default;
                const rating = MOCK_RATING(item.id); // TODO: replace with real rating from API

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
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform =
                          "translateY(-5px)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 14px 36px rgba(200,169,110,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform =
                          "translateY(0)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 2px 12px rgba(0,0,0,0.05)";
                      }}
                    >
                      {/* Cover image */}
                      {/* TODO: replace gradient with <img src={item.coverUrl}/> when cover API is ready */}
                      <div
                        style={{
                          height: 140,
                          background: coverGrad,
                          position: "relative",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                          padding: 10,
                        }}
                      >
                        {/* Type badge */}
                        <span
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            background: badgeColor,
                            color: "#fff",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 999,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {badge.label}
                        </span>
                        {/* Bookmark button — TODO: wire to /api/bookmarks when available */}
                        <button
                          onClick={(e) => {
                            e.preventDefault(); /* TODO: POST /api/bookmarks */
                          }}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.9)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          🔖
                        </button>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: "14px 14px 16px" }}>
                        <h3
                          style={{
                            fontFamily: serif,
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: C.ink,
                            lineHeight: 1.3,
                            margin: "0 0 4px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {title}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.78rem",
                            color: C.inkSoft,
                            margin: "0 0 12px",
                            fontStyle: "italic",
                          }}
                        >
                          by {author}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: "0.75rem",
                              color: C.inkSoft,
                            }}
                          >
                            <span>📅</span> {year}
                            <span style={{ marginLeft: 6 }}>📖</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
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
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 150px 130px 80px 80px",
                  background: C.goldLight,
                  borderBottom: `1.5px solid ${C.goldBorder}`,
                  padding: "12px 18px",
                }}
              >
                {["#", "Title", "Author", "Template", "Year", "Rating"].map(
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
              {paged.map((item, idx) => {
                const title =
                  extract(item, ["عنوان", "Title"]) ?? `Untitled #${item.id}`;
                const author = extract(item, ["مؤلف", "كاتب", "Author"]) ?? "—";
                const year = extractYear(item) ?? "—";
                const tpl = templates.find((t) => t.id === item.templateId);
                const badge = tpl
                  ? getTypeBadge(tpl.label)
                  : { label: "Item", key: "default" };
                const badgeColor =
                  BADGE_COLORS[badge.key] ?? BADGE_COLORS.default;
                const rating = MOCK_RATING(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 1fr 150px 130px 80px 80px",
                      padding: "13px 18px",
                      alignItems: "center",
                      borderBottom:
                        idx < paged.length - 1
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
                    onClick={() => (window.location.href = `/items/${item.id}`)}
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
                        fontFamily: serif,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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
                      }}
                    >
                      {author}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        background: badgeColor + "22",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 999,
                        border: `1px solid ${badgeColor}44`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {badge.label}
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
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PAGINATION ── */}
        </div>

        {/* ── RIGHT: Filters sidebar ── */}
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            background: C.bg,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            padding: "20px 18px",
            position: "sticky",
            top: 88,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <h3
            style={{
              fontFamily: serif,
              fontSize: "1.05rem",
              fontWeight: 700,
              color: C.ink,
              margin: "0 0 18px",
            }}
          >
            Filters
          </h3>

          <FilterLabel>Item Type</FilterLabel>
          <SelectFull
            value={tplId}
            onChange={(v) => {
              setTplId(v);
              setPage(1);
            }}
          >
            <option value="all">All Types</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </SelectFull>

          <div style={{ height: 18 }} />

          {/* TODO: Date Range slider — wire to API filter when /api/items?dateFrom=&dateTo= is available */}
          <FilterLabel>Date Range</FilterLabel>
          <div style={{ padding: "4px 0 8px" }}>
            <input
              type="range"
              min={1000}
              max={2024}
              defaultValue={1700}
              style={{ width: "100%", accentColor: C.gold }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.72rem",
                color: C.inkSoft,
                marginTop: 4,
              }}
            >
              <span>1700</span>
              <span>2024</span>
            </div>
          </div>

          <div style={{ height: 10 }} />

          {/* TODO: Language filter — wire to /api/items?language= when supported */}
          <FilterLabel>Language</FilterLabel>
          <SelectFull value="all" onChange={() => {}}>
            <option value="all">All Languages</option>
            <option value="ar">Arabic</option>
            <option value="en">English</option>
            <option value="fr">French</option>
          </SelectFull>

          <div style={{ height: 18 }} />

          <FilterLabel>Sort By</FilterLabel>
          <SelectFull value={sortBy} onChange={setSortBy}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A–Z</option>
          </SelectFull>

          <div style={{ height: 20 }} />

          {/* Apply Filters */}
          <button
            onClick={() => setPage(1)}
            style={{
              width: "100%",
              background: C.gold,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "11px",
              fontFamily: sans,
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s",
              boxShadow: "0 4px 16px rgba(200,169,110,0.35)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = C.goldDark)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
          >
            Apply Filters ▼
          </button>
        </aside>
      </div>
    </div>
  );
};

// ── Small reusable style components ──────────────────────────────────────────
const C2 = {
  gold: "#c8a96e",
  goldBorder: "rgba(200,169,110,0.30)",
  goldLight: "#f0e8d8",
  ink: "#1a1208",
  inkSoft: "#9a8060",
  bg: "#F7F3ED",
};
const sans2 = "'Poppins',system-ui,sans-serif";

const Select = ({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: "none",
        background: C.surface,
        border: `1.5px solid ${C2.goldBorder}`,
        borderRadius: 10,
        padding: "9px 32px 9px 12px",
        fontFamily: sans2,
        fontSize: "0.83rem",
        color: C2.ink,
        cursor: "pointer",
        outline: "none",
      }}
    >
      {children}
    </select>
    <span
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: C2.inkSoft,
        fontSize: 12,
      }}
    >
      ▾
    </span>
  </div>
);

const SelectFull = ({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) => (
  <div style={{ position: "relative" }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: "none",
        width: "100%",
        background: C.surface,
        border: `1.5px solid ${C2.goldBorder}`,
        borderRadius: 10,
        padding: "9px 32px 9px 12px",
        fontFamily: sans2,
        fontSize: "0.82rem",
        color: C2.ink,
        cursor: "pointer",
        outline: "none",
      }}
    >
      {children}
    </select>
    <span
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: C2.inkSoft,
        fontSize: 12,
      }}
    >
      ▾
    </span>
  </div>
);

const FilterLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      margin: "0 0 7px",
      fontSize: "0.72rem",
      fontWeight: 700,
      color: C2.inkSoft,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      fontFamily: sans2,
    }}
  >
    {children}
  </p>
);

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
      border: `1.5px solid ${C2.goldBorder}`,
      background: active ? C2.gold : C.surface,
      color: active ? "#fff" : C2.inkSoft,
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
