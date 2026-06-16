import { useState, useEffect } from "react";
import type {
  ItemResponse,
  ResourceTemplateResponse,
  ItemSetResponse,
} from "../../types/metadata";
import { Link, useLocation, useNavigate } from "react-router-dom";
import libraryHero from "../../assets/images/libraryHeroBrowse.png";
import ItemBottom from "../../assets/icons/ItemBottom.png";
import { api } from "../../services/api";
import {
  Search,
  Heart,
  ChevronDown,
  Book,
  ScrollText,
  FileText,
  Monitor,
  Package,
  Library,
} from "lucide-react";

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

// ── Category Definitions & Icons ─────────────────────────────────────────────
const CAT_CONFIG = [
  { label: "All Items", key: "all", icon: <Library size={16} /> },
  { label: "Books", key: "book", icon: <Book size={16} /> },
  { label: "Manuscripts", key: "manuscript", icon: <ScrollText size={16} /> },
  { label: "Articles", key: "article", icon: <FileText size={16} /> },
  { label: "Digital Items", key: "digital", icon: <Monitor size={16} /> },
  { label: "Other", key: "other", icon: <Package size={16} /> },
];

const BADGE_COLORS: Record<string, string> = {
  book: "#c8a96e",
  manuscript: "#7c5c2e",
  article: "#4a7c59",
  digital: "#4a6a9c",
  other: "#9a8060",
  default: "#9a8060",
};

const COVER_COLORS: Record<string, string> = {
  book: "linear-gradient(145deg,#c8a040,#8b5e1a)",
  manuscript: "linear-gradient(145deg,#b8860b,#5c3a0a)",
  article: "linear-gradient(145deg,#6b8c6b,#2d4a2d)",
  digital: "linear-gradient(145deg,#5a7a9a,#2d4a6a)",
  other: "linear-gradient(145deg,#b09070,#6a4a2a)",
  default: "linear-gradient(145deg,#b09070,#6a4a2a)",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendingFilters {
  tplId: string;
  yearFrom: string;
  yearTo: string;
  languageFilter: string;
  sortBy: string;
}

// ─────────────────────────────────────────────────────────────────────────────
export const BrowseItemsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // ── Instant filters (top bar) ──
  const [search, setSearch] = useState("");
  const [topTplId, setTopTplId] = useState<string>(
    location.state?.template ?? "all"
  );
  const [topSetId, setTopSetId] = useState<string>(
    location.state?.itemSet ?? "all"
  );
  const [topSortBy, setTopSortBy] = useState("newest");
  const [catFilter, setCatFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  // ── Applied sidebar filters (only change on Apply click) ──
  const [appliedFilters, setAppliedFilters] = useState<PendingFilters>({
    tplId: "all",
    yearFrom: "",
    yearTo: "",
    languageFilter: "all",
    sortBy: "newest",
  });

  // ── Pending sidebar filters (change as user interacts) ──
  const [pendingFilters, setPendingFilters] = useState<PendingFilters>({
    tplId: "all",
    yearFrom: "",
    yearTo: "",
    languageFilter: "all",
    sortBy: "newest",
  });

  // Load More State
  const [visibleCount, setVisibleCount] = useState(12);

  // Bookmarks State — loaded from API
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/api/items").then((r) => r.data),
      api.get("/api/resource-templates").then((r) => r.data),
      api.get("/api/item-sets").then((r) => r.data),
      api.get("/api/bookmarks").then((r) => r.data),
    ])
      .then(([i, t, s, b]) => {
        setItems(i);
        setTemplates(t);
        setItemSets(s);
        // normalise: accept array of ids or array of objects with id field
        const ids: number[] = Array.isArray(b)
          ? b.map((x: number | { id: number }) =>
              typeof x === "number" ? x : Number(x.id)
            )
          : [];
        setBookmarks(ids);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading browse data:", err);
        setLoading(false);
      });
  }, []);

  const toggleBookmark = async (e: React.MouseEvent, itemId: number) => {
    e.preventDefault();
    const isFavorited = bookmarks.includes(itemId);

    // Optimistic UI update
    setBookmarks((prev) =>
      isFavorited ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );

    try {
      if (isFavorited) {
        await api.delete(`/api/bookmarks/${itemId}`);
      } else {
        await api.post(`/api/bookmarks/${itemId}`);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
      // Revert on failure
      setBookmarks((prev) =>
        isFavorited ? [...prev, itemId] : prev.filter((id) => id !== itemId)
      );
    }
  };

  const extract = (item: ItemResponse, labels: string[]) =>
    item.metadataValues.find((v) =>
      labels.some((l) =>
        v.propertyLabel.toLowerCase().includes(l.toLowerCase())
      )
    )?.valueText ?? null;

  const extractYear = (item: ItemResponse) => {
    const yearStr = extract(item, ["تاريخ", "سنة", "date", "year", "issued"]);
    return yearStr ? parseInt(yearStr.replace(/\D/g, ""), 10) : null;
  };

  const MOCK_RATING = (id: number) => (3.5 + (id % 15) * 0.1).toFixed(1);

  // ── Smart Category Logic ──
  const determineCategory = (item: ItemResponse) => {
    const tplLabel =
      templates.find((t) => t.id === item.templateId)?.label.toLowerCase() ||
      "";
    const title = extract(item, ["عنوان", "title"])?.toLowerCase() || "";
    const setsStr = itemSets
      .filter((s) => s.items?.some((i) => i.id === item.id))
      .map((s) => s.title.toLowerCase())
      .join(" ");

    const searchString = `${tplLabel} ${title} ${setsStr}`;

    if (searchString.includes("book") || searchString.includes("كتاب"))
      return "book";
    if (searchString.includes("manuscript") || searchString.includes("مخطوط"))
      return "manuscript";
    if (
      searchString.includes("article") ||
      searchString.includes("مقال") ||
      searchString.includes("journal")
    )
      return "article";
    if (
      searchString.includes("digital") ||
      searchString.includes("رقمي") ||
      searchString.includes("audio") ||
      searchString.includes("video")
    )
      return "digital";
    return "other";
  };

  // ── Dynamic Languages ──
  const availableLanguages = Array.from(
    new Set(
      items
        .flatMap((i) => i.metadataValues.map((v) => v.language))
        .filter((l): l is string => Boolean(l && l !== "null"))
    )
  );

  // ── Apply sidebar filters ──
  const handleApplyFilters = () => {
    setAppliedFilters({ ...pendingFilters });
    setVisibleCount(12);
  };

  // ── Filtering Logic ──
  // Merge: top-bar filters are instant; sidebar filters use appliedFilters
  const effectiveTplId = topTplId !== "all" ? topTplId : appliedFilters.tplId;

  let filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.metadataValues.some((v) =>
        v.valueText?.toLowerCase().includes(search.toLowerCase())
      ) ||
      item.id.toString() === search;

    const matchTpl =
      effectiveTplId === "all" ||
      item.templateId?.toString() === effectiveTplId;

    let matchSet = true;
    if (topSetId !== "all") {
      const s = itemSets.find((s) => s.id.toString() === topSetId);
      matchSet = s?.items?.some((i) => i.id === item.id) ?? false;
    }

    const matchCat =
      catFilter === "all" || determineCategory(item) === catFilter;

    const matchLang =
      appliedFilters.languageFilter === "all" ||
      item.metadataValues.some(
        (v) => v.language === appliedFilters.languageFilter
      );

    let matchDate = true;
    const itemYear = extractYear(item);
    if (appliedFilters.yearFrom && itemYear)
      matchDate = matchDate && itemYear >= parseInt(appliedFilters.yearFrom);
    if (appliedFilters.yearTo && itemYear)
      matchDate = matchDate && itemYear <= parseInt(appliedFilters.yearTo);
    if ((appliedFilters.yearFrom || appliedFilters.yearTo) && !itemYear)
      matchDate = false;

    return (
      matchSearch && matchTpl && matchSet && matchCat && matchLang && matchDate
    );
  });

  // ── Sorting: top-bar sortBy takes priority ──
  const effectiveSortBy =
    topSortBy !== "newest" ? topSortBy : appliedFilters.sortBy;

  filtered = filtered.sort((a, b) => {
    if (effectiveSortBy === "newest") return b.id - a.id;
    if (effectiveSortBy === "oldest") return a.id - b.id;
    if (effectiveSortBy === "title") {
      const titleA = extract(a, ["title", "عنوان"]) || "";
      const titleB = extract(b, ["title", "عنوان"]) || "";
      return titleA.localeCompare(titleB);
    }
    return 0;
  });

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const cats = CAT_CONFIG.map((c) => ({
    ...c,
    count:
      c.key === "all"
        ? items.length
        : items.filter((it) => determineCategory(it) === c.key).length,
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
              Browse through unique resources, books, manuscripts,
              <br />
              and digital items from our library.
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

      {/* ══════════ SEARCH BAR ══════════ */}
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
          <div style={{ position: "relative", flex: "1 1 260px" }}>
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
              placeholder="Search items, titles, authors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(12);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                paddingLeft: 40,
                paddingRight: 12,
                paddingTop: 9,
                paddingBottom: 9,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 10,
                fontFamily: sans,
                fontSize: "0.88rem",
                color: C.ink,
                background: C.surface,
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e) => (e.target.style.borderColor = C.goldBorder)}
            />
          </div>

          {/* Instant: All Types */}
          <Select
            value={topTplId}
            onChange={(v) => {
              setTopTplId(v);
              setVisibleCount(12);
            }}
          >
            <option value="all">All Types</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>

          {/* Instant: All Collections */}
          <Select
            value={topSetId}
            onChange={(v) => {
              setTopSetId(v);
              setVisibleCount(12);
            }}
          >
            <option value="all">All Collections</option>
            {itemSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </Select>

          {/* Instant: Sort */}
          <Select
            value={topSortBy}
            onChange={(v) => {
              setTopSortBy(v);
              setVisibleCount(12);
            }}
          >
            <option value="newest">Date Added</option>
            <option value="title">Title A–Z</option>
            <option value="oldest">Oldest First</option>
          </Select>

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
          position: "relative",
          zIndex: 3,
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
                  setVisibleCount(12);
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
                    color: C.goldDark,
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
                      fontWeight: 600,
                      textTransform: "uppercase",
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
          ) : visibleItems.length === 0 ? (
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
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
                  gap: 20,
                }}
              >
                {visibleItems.map((item) => {
                  const title =
                    extract(item, ["عنوان", "Title"]) ?? `Untitled #${item.id}`;
                  const author =
                    extract(item, ["مؤلف", "كاتب", "Author", "Creator"]) ??
                    "Unknown";
                  const year = extractYear(item) ?? "—";
                  const catKey = determineCategory(item);
                  const badgeConfig =
                    CAT_CONFIG.find((c) => c.key === catKey) || CAT_CONFIG[0];
                  const coverGrad =
                    COVER_COLORS[catKey] ?? COVER_COLORS.default;
                  const badgeColor =
                    BADGE_COLORS[catKey] ?? BADGE_COLORS.default;
                  const rating = MOCK_RATING(item.id);
                  const isFavorited = bookmarks.includes(Number(item.id));

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
                        {/* Cover */}
                        <div
                          style={{
                            height: 140,
                            background: coverGrad,
                            position: "relative",
                            padding: 10,
                          }}
                        >
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
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {badgeConfig.label}
                          </span>

                          <button
                            onClick={(e) => toggleBookmark(e, Number(item.id))}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.9)",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "transform 0.2s",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.1)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          >
                            <Heart
                              size={16}
                              fill={isFavorited ? C.gold : "transparent"}
                              color={isFavorited ? C.gold : C.inkSoft}
                              strokeWidth={isFavorited ? 0 : 2}
                            />
                          </button>
                        </div>

                        {/* Card body */}
                        <div
                          style={{
                            padding: "14px 14px 16px",
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <h3
                            style={{
                              fontFamily: serif,
                              fontSize: "0.95rem",
                              fontWeight: 700,
                              color: C.ink,
                              lineHeight: 1.3,
                              margin: "0 0 4px",
                              height: "2.6em",
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
                              fontSize: "0.78rem",
                              color: C.inkSoft,
                              margin: "0 0 12px",
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
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginTop: "auto",
                              borderTop: `1px solid ${C.goldBorder}`,
                              paddingTop: 10,
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
                              <span
                                style={{ fontWeight: 600, color: C.inkMid }}
                              >
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

              {hasMore && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 40,
                  }}
                >
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    style={{
                      background: "transparent",
                      border: `1.5px solid ${C.gold}`,
                      color: C.goldDark,
                      padding: "12px 32px",
                      borderRadius: 999,
                      fontFamily: sans,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = C.goldLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Load More <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </>
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
                  gridTemplateColumns: "48px 1fr 150px 130px 80px 80px",
                  background: C.goldLight,
                  borderBottom: `1.5px solid ${C.goldBorder}`,
                  padding: "12px 18px",
                }}
              >
                {["#", "Title", "Author", "Category", "Year", "Rating"].map(
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
              {visibleItems.map((item, idx) => {
                const title =
                  extract(item, ["عنوان", "Title"]) ?? `Untitled #${item.id}`;
                const author = extract(item, ["مؤلف", "كاتب", "Author"]) ?? "—";
                const year = extractYear(item) ?? "—";
                const catKey = determineCategory(item);
                const badgeConfig =
                  CAT_CONFIG.find((c) => c.key === catKey) || CAT_CONFIG[0];
                const badgeColor = BADGE_COLORS[catKey] ?? BADGE_COLORS.default;
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
                        idx < visibleItems.length - 1
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
                        color: badgeColor,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 999,
                        border: `1px solid ${badgeColor}44`,
                        whiteSpace: "nowrap",
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
                  </div>
                );
              })}
              {hasMore && (
                <div
                  style={{
                    padding: 16,
                    textAlign: "center",
                    borderTop: `1px solid ${C.goldBorder}`,
                    background: C.surface,
                  }}
                >
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    style={{
                      background: "none",
                      border: "none",
                      color: C.goldDark,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Load More Results...
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Filters sidebar ── */}
        <aside
          style={{
            width: 240,
            flexShrink: 0,
            background: C.bg,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            padding: "20px 18px",
            position: "sticky",
            top: 88,
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
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
            Refine Search
          </h3>

          <FilterLabel>Item Type</FilterLabel>
          <SelectFull
            value={pendingFilters.tplId}
            onChange={(v) => setPendingFilters((p) => ({ ...p, tplId: v }))}
          >
            <option value="all">All Types</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </SelectFull>

          <div style={{ height: 18 }} />

          <FilterLabel>Publication Year</FilterLabel>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              placeholder="From"
              value={pendingFilters.yearFrom}
              onChange={(e) =>
                setPendingFilters((p) => ({ ...p, yearFrom: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 8,
                fontSize: "0.8rem",
                outline: "none",
                fontFamily: sans,
                color: C.ink,
                background: C.surface,
              }}
            />
            <span style={{ color: C.inkSoft, fontSize: "0.8rem" }}>-</span>
            <input
              type="number"
              placeholder="To"
              value={pendingFilters.yearTo}
              onChange={(e) =>
                setPendingFilters((p) => ({ ...p, yearTo: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 8,
                fontSize: "0.8rem",
                outline: "none",
                fontFamily: sans,
                color: C.ink,
                background: C.surface,
              }}
            />
          </div>

          <div style={{ height: 18 }} />

          <FilterLabel>Language</FilterLabel>
          <SelectFull
            value={pendingFilters.languageFilter}
            onChange={(v) =>
              setPendingFilters((p) => ({ ...p, languageFilter: v }))
            }
          >
            <option value="all">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </SelectFull>

          <div style={{ height: 18 }} />

          <FilterLabel>Sort By</FilterLabel>
          <SelectFull
            value={pendingFilters.sortBy}
            onChange={(v) => setPendingFilters((p) => ({ ...p, sortBy: v }))}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A–Z</option>
          </SelectFull>

          <div style={{ height: 20 }} />

          <button
            onClick={handleApplyFilters}
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
  ink: "#1a1208",
  inkSoft: "#9a8060",
  surface: "#FFFFFF",
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
        background: C2.surface,
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
    <ChevronDown
      size={12}
      color={C2.inkSoft}
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
      }}
    />
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
        background: C2.surface,
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
    <ChevronDown
      size={12}
      color={C2.inkSoft}
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
      }}
    />
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
      background: active ? C2.gold : C2.surface,
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
