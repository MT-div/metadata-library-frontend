// src/hooks/useBrowseItems.ts
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { itemService } from "../../services/itemService";
import { metadataService } from "../../services/metadataService";
import type { ItemResponse } from "../../types/item.types";
import type { ResourceTemplateResponse } from "../../types/template.types";
import type { ItemSetResponse } from "../../types/itemSet.types";
import { extractMetadataValue, extractYear } from "../../utils/helpers";

interface PendingFilters {
  tplId: string;
  yearFrom: string;
  yearTo: string;
  languageFilter: string;
  sortBy: string;
}

export const useBrowseItems = () => {
  const location = useLocation();

  const [items, setItems] = useState<ItemResponse[]>([]);
  const [templates, setTemplates] = useState<ResourceTemplateResponse[]>([]);
  const [itemSets, setItemSets] = useState<ItemSetResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ── Applied sidebar filters ──
  const [appliedFilters, setAppliedFilters] = useState<PendingFilters>({
    tplId: "all",
    yearFrom: "",
    yearTo: "",
    languageFilter: "all",
    sortBy: "newest",
  });

  // ── Pending sidebar filters ──
  const [pendingFilters, setPendingFilters] = useState<PendingFilters>({
    tplId: "all",
    yearFrom: "",
    yearTo: "",
    languageFilter: "all",
    sortBy: "newest",
  });

  // Load More State
  const [visibleCount, setVisibleCount] = useState(12);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      itemService.getItems().then((r) => r.data),
      metadataService.getTemplates().then((r) => r.data),
      itemService.getItemSets().then((r) => r.data),
      itemService.getBookmarks().then((r) => r.data),
    ])
      .then(([i, t, s, b]) => {
        setItems(i);
        setTemplates(t);
        setItemSets(s);
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

    setBookmarks((prev) =>
      isFavorited ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );

    try {
      if (isFavorited) {
        await itemService.removeBookmark(itemId);
      } else {
        await itemService.addBookmark(itemId);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
      setBookmarks((prev) =>
        isFavorited ? [...prev, itemId] : prev.filter((id) => id !== itemId)
      );
    }
  };

  const determineCategory = (item: ItemResponse) => {
    const tplLabel =
      templates.find((t) => t.id === item.templateId)?.label.toLowerCase() ||
      "";
    const title =
      extractMetadataValue(item, ["عنوان", "title"])?.toLowerCase() || "";
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

  const availableLanguages = Array.from(
    new Set(
      items
        .flatMap((i) => i.metadataValues.map((v) => v.language))
        .filter((l): l is string => Boolean(l && l !== "null"))
    )
  );

  const handleApplyFilters = () => {
    setAppliedFilters({ ...pendingFilters });
    setVisibleCount(12);
  };

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

  const effectiveSortBy =
    topSortBy !== "newest" ? topSortBy : appliedFilters.sortBy;

  filtered = filtered.sort((a, b) => {
    if (effectiveSortBy === "newest") return b.id - a.id;
    if (effectiveSortBy === "oldest") return a.id - b.id;
    if (effectiveSortBy === "title") {
      const titleA = extractMetadataValue(a, ["title", "عنوان"]) || "";
      const titleB = extractMetadataValue(b, ["title", "عنوان"]) || "";
      return titleA.localeCompare(titleB);
    }
    return 0;
  });

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return {
    items,
    templates,
    itemSets,
    loading,
    search,
    setSearch,
    topTplId,
    setTopTplId,
    topSetId,
    setTopSetId,
    topSortBy,
    setTopSortBy,
    catFilter,
    setCatFilter,
    view,
    setView,
    pendingFilters,
    setPendingFilters,
    setVisibleCount,
    bookmarks,
    toggleBookmark,
    determineCategory,
    availableLanguages,
    handleApplyFilters,
    visibleItems,
    hasMore,
  };
};
