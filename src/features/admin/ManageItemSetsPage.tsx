import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  Plus,
  Trash2,
  Globe,
  Lock,
  Link as LinkIcon,
  Search,
  ChevronRight,
  FolderOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { ItemSetResponse, ItemResponse } from "../../types/metadata";
import { api } from "../../services/api";

const C = {
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldMid: "rgba(200,169,110,0.15)",
  goldBorder: "rgba(200,169,110,0.28)",
  goldDark: "#b8965a",
  ink: "#1a1208",
  inkMid: "#5c4a30",
  inkSoft: "#9a8060",
  danger: "#c0392b",
  dangerBg: "#fdf0ee",
  success: "#2d6e3a",
  successBg: "#edf7ee",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

// Extend ItemSetResponse to include isDeleted
interface ExtendedItemSetResponse extends ItemSetResponse {
  isDeleted?: boolean;
}

export const ManageItemSetsPage = () => {
  const navigate = useNavigate();
  const [itemSets, setItemSets] = useState<ExtendedItemSetResponse[]>([]);
  const [allItems, setAllItems] = useState<ItemResponse[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  
  // Status Filter State
  const [filterStatus, setFilterStatus] = useState<"active" | "deleted" | "all">("active");

  const [itemToAdd, setItemToAdd] = useState<number | string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeletingSet, setIsDeletingSet] = useState<number | null>(null);
  const [focusedSel, setFocusedSel] = useState(false);

  useEffect(() => {
    Promise.all([
      // Fetch item sets including deleted ones
      api.get("/api/item-sets/WithDeleted").then((r) => r.data),
      api.get("/api/items").then((r) => r.data),
    ])
      .then(([sets, items]) => {
        setItemSets(sets);
        setAllItems(items);
        if (sets.length > 0) setSelectedSetId(sets[0].id);
      })
      .catch((err) => console.error("Error loading ItemSets data:", err));
  }, []);

  const selectedSet = itemSets.find((s) => s.id === selectedSetId);
  const isSelectedSetDeleted = selectedSet?.isDeleted === true;

  const getItemTitle = (item: ItemResponse) =>
    item.metadataValues.find(
      (v) =>
        v.propertyLabel.toLowerCase().includes("title") || v.propertyLabel.includes("عنوان")
    )?.valueText ?? `Untitled #${item.id}`;

  // ── COLLECTION ACTIONS (SOFT DELETE & RESTORE) ──

  const handleDeleteSet = async (id: number) => {
    if (!confirm("Are you sure you want to delete this collection? (Soft Delete)")) return;

    setIsDeletingSet(id);
    try {
      await api.delete(`/api/item-sets/${id}`);
      setItemSets((prev) => prev.map(s => s.id === id ? { ...s, isDeleted: true } : s));
      
      // If we are viewing active only, deselect if it gets deleted
      if (filterStatus === "active" && selectedSetId === id) {
        setSelectedSetId(null);
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("An error occurred while deleting the collection.");
    } finally {
      setIsDeletingSet(null);
    }
  };

  const handleRestoreSet = async (id: number) => {
    if (!confirm("Are you sure you want to restore this collection?")) return;

    setIsDeletingSet(id);
    try {
      // Pass { id } in the body to match the Command expectations and avoid 400/415 errors
      await api.put(`/api/item-sets/Undelet/${id}`, { id: id });
      setItemSets((prev) => prev.map(s => s.id === id ? { ...s, isDeleted: false } : s));
    } catch (error) {
      console.error("Error restoring collection:", error);
      alert("An error occurred while restoring the collection.");
    } finally {
      setIsDeletingSet(null);
    }
  };

  // ── ITEM LINKING ACTIONS ──

  const handleAdd = async () => {
    if (!selectedSetId || !itemToAdd || isSelectedSetDeleted) return;
    if (selectedSet?.items?.some((i) => i.id === Number(itemToAdd))) {
      alert("This item already exists in the collection.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await api.post(
        `/api/item-sets/${selectedSetId}/items/${itemToAdd}`,
        {
          itemSetId: selectedSetId,
          itemId: Number(itemToAdd),
        }
      );

      if (res.status === 200 || res.status === 204) {
        const added = allItems.find((i) => i.id === Number(itemToAdd));
        if (added) {
          setItemSets((prev) =>
            prev.map((s) =>
              s.id === selectedSetId
                ? {
                    ...s,
                    items: [
                      ...(s.items || []),
                      {
                        id: added.id,
                        type: "Item" as const,
                        templateId: added.templateId,
                        ownerId: null,
                      },
                    ],
                  }
                : s
            )
          );
        }
        setItemToAdd("");
      }
    } catch (e) {
      console.error("Add item error:", e);
      alert("An error occurred while linking the item.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (itemId: number) => {
    if (isSelectedSetDeleted) return;
    if (!selectedSetId || !confirm("Remove this item from the collection? (The item won't be deleted from the library)")) return;
    
    setIsProcessing(true);
    try {
      const res = await api.delete(
        `/api/item-sets/${selectedSetId}/items/${itemId}`
      );

      if (res.status === 200 || res.status === 204) {
        setItemSets((prev) =>
          prev.map((s) =>
            s.id === selectedSetId
              ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
              : s
          )
        );
      }
    } catch (e) {
      console.error("Remove item error:", e);
      alert("An error occurred while removing the item.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── FILTER COLLECTIONS ──
  const filteredSets = itemSets.filter(set => {
    if (filterStatus === "active") return !set.isDeleted;
    if (filterStatus === "deleted") return set.isDeleted;
    return true; // all
  });

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
          paddingBottom: 24,
          borderBottom: `1.5px solid ${C.goldBorder}`,
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: C.gold,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Admin · Collections
          </p>
          <h1
            style={{
              fontFamily: serif,
              fontSize: "1.8rem",
              fontWeight: 800,
              color: C.ink,
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Manage Collections
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Create, delete, and link items to library collections.
          </p>
        </div>
        <button
          onClick={() => navigate("/itemsets/new")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: C.gold,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontFamily: sans,
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.15s",
            boxShadow: "0 2px 10px rgba(200,169,110,0.3)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.goldDark)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
        >
          <Plus size={15} /> New Collection
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ══ LEFT: Collections list ══ */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            position: "sticky",
            top: 24,
          }}
        >
          <div
            style={{
              background: C.goldLight,
              borderBottom: `1.5px solid ${C.goldBorder}`,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Folder size={16} color={C.gold} />
              <h2
                style={{
                  fontFamily: serif,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Collections
              </h2>
            </div>
          </div>
          
          {/* Status Filter */}
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.goldBorder}`, background: "#fdfaf6" }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "active" | "deleted" | "all")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: 8,
                border: `1px solid ${C.goldBorder}`,
                background: C.surface,
                color: filterStatus === "deleted" ? C.danger : C.inkMid,
                fontSize: "0.8rem",
                outline: "none",
                fontFamily: sans,
                cursor: "pointer"
              }}
            >
              <option value="active">Active Only</option>
              <option value="deleted">Deleted (Trash) Only</option>
              <option value="all">Show All</option>
            </select>
          </div>

          <div style={{ padding: "10px" }}>
            {filteredSets.length === 0 ? (
               <p style={{ textAlign: "center", fontSize: "0.8rem", color: C.inkSoft, padding: "20px 0" }}>No collections found.</p>
            ) : (
              filteredSets.map((set) => {
                const isActive = set.id === selectedSetId;
                const isDeleted = set.isDeleted;
                return (
                  <button
                    key={set.id}
                    onClick={() => setSelectedSetId(set.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "11px 12px",
                      borderRadius: 10,
                      marginBottom: 3,
                      border: `1.5px solid ${isActive ? C.gold : "transparent"}`,
                      background: isActive ? C.goldLight : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      opacity: isDeleted ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = isDeleted ? "#f1f1f1" : C.bg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ overflow: "hidden", display: "flex", alignItems: "center", gap: 6 }}>
                      {isDeleted && <AlertCircle size={12} color={C.danger} style={{ flexShrink: 0 }} />}
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            fontWeight: isActive ? 700 : 500,
                            color: isDeleted ? C.inkSoft : (isActive ? C.goldDark : C.inkMid),
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textDecoration: isDeleted ? "line-through" : "none"
                          }}
                        >
                          {set.title}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "0.68rem",
                            color: C.inkSoft,
                          }}
                        >
                          {set.items?.length ?? 0} items
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      color={isActive ? C.gold : C.inkSoft}
                      style={{ flexShrink: 0 }}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══ RIGHT: Collection editor ══ */}
        {selectedSet ? (
          <div
            style={{
              background: C.surface,
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              opacity: isSelectedSetDeleted ? 0.8 : 1,
            }}
          >
            {/* Collection info header */}
            <div
              style={{
                background: C.goldLight,
                borderBottom: `1.5px solid ${C.goldBorder}`,
                padding: "18px 24px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: isSelectedSetDeleted ? C.inkSoft : C.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderOpen size={22} color="#fff" strokeWidth={1.8} />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: serif,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: isSelectedSetDeleted ? C.inkSoft : C.ink,
                      margin: "0 0 4px",
                      textDecoration: isSelectedSetDeleted ? "line-through" : "none"
                    }}
                  >
                    {selectedSet.title}
                    {isSelectedSetDeleted && <span style={{ fontSize: "0.75rem", color: C.danger, marginLeft: 8, textDecoration: "none", display: "inline-block" }}>(Deleted)</span>}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8rem",
                      color: C.inkSoft,
                    }}
                  >
                    {selectedSet.description || "No description."}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {/* Public / Private badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    flexShrink: 0,
                    background: selectedSet.isPublic
                      ? "rgba(45,110,58,0.1)"
                      : "rgba(180,120,40,0.1)",
                    border: `1px solid ${
                      selectedSet.isPublic
                        ? "rgba(45,110,58,0.3)"
                        : "rgba(180,120,40,0.3)"
                    }`,
                    color: selectedSet.isPublic ? "#2d6e3a" : "#7c5010",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    letterSpacing: "0.04em",
                  }}
                >
                  {selectedSet.isPublic ? (
                    <><Globe size={12} /> Public</>
                  ) : (
                    <><Lock size={12} /> Private</>
                  )}
                </span>
                
                {/* Delete / Restore Actions */}
                {isSelectedSetDeleted ? (
                  <button
                    onClick={() => handleRestoreSet(selectedSet.id)}
                    disabled={isDeletingSet === selectedSet.id}
                    title="Restore Collection"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 32, height: 32, borderRadius: 8, background: C.successBg, border: "none",
                      color: C.success, cursor: "pointer", transition: "opacity 0.2s"
                    }}
                  >
                    <RefreshCw size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeleteSet(selectedSet.id)}
                    disabled={isDeletingSet === selectedSet.id}
                    title="Delete Collection"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 32, height: 32, borderRadius: 8, background: C.dangerBg, border: "none",
                      color: C.danger, cursor: "pointer", transition: "opacity 0.2s"
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Add item row */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: `1.5px solid ${C.goldBorder}`,
                background: "#fdfaf6",
                opacity: isSelectedSetDeleted ? 0.6 : 1,
                pointerEvents: isSelectedSetDeleted ? "none" : "auto",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: C.inkMid,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                <LinkIcon size={13} color={C.gold} /> Link Item to Collection
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <select
                    value={itemToAdd}
                    onChange={(e) => setItemToAdd(e.target.value)}
                    onFocus={() => setFocusedSel(true)}
                    onBlur={() => setFocusedSel(false)}
                    style={{
                      width: "100%",
                      appearance: "none",
                      background: C.surface,
                      border: `1.5px solid ${
                        focusedSel ? C.gold : C.goldBorder
                      }`,
                      borderRadius: 10,
                      padding: "10px 36px 10px 14px",
                      fontFamily: sans,
                      fontSize: "0.85rem",
                      color: itemToAdd ? C.ink : C.inkSoft,
                      outline: "none",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <option value="">Select an item to add...</option>
                    {allItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        #{item.id} — {getItemTitle(item)}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: C.inkSoft,
                      fontSize: 12,
                    }}
                  >
                    ▾
                  </span>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={isProcessing || !itemToAdd || isSelectedSetDeleted}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background:
                      !itemToAdd || isProcessing || isSelectedSetDeleted ? C.goldBorder : C.gold,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontFamily: sans,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor:
                      !itemToAdd || isProcessing || isSelectedSetDeleted ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (itemToAdd && !isProcessing && !isSelectedSetDeleted)
                      e.currentTarget.style.background = C.goldDark;
                  }}
                  onMouseLeave={(e) => {
                    if (itemToAdd && !isProcessing && !isSelectedSetDeleted)
                      e.currentTarget.style.background = C.gold;
                  }}
                >
                  <Plus size={15} /> Add to Collection
                </button>
              </div>
            </div>

            {/* Items list */}
            <div style={{ padding: "20px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: serif,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: C.ink,
                    margin: 0,
                  }}
                >
                  Linked Items
                </h3>
                <span
                  style={{
                    background: C.goldMid,
                    color: C.goldDark,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 999,
                    border: `1px solid ${C.goldBorder}`,
                  }}
                >
                  {selectedSet.items?.length ?? 0} items
                </span>
              </div>

              {!selectedSet.items || selectedSet.items.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    background: C.bg,
                    borderRadius: 14,
                    border: `1.5px dashed ${C.goldBorder}`,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: C.goldLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <Search size={24} color={C.gold} strokeWidth={1.5} />
                  </div>
                  <p
                    style={{
                      fontFamily: serif,
                      fontSize: "1rem",
                      color: C.inkMid,
                      margin: "0 0 4px",
                    }}
                  >
                    Collection is empty
                  </p>
                  <p
                    style={{ fontSize: "0.82rem", color: C.inkSoft, margin: 0 }}
                  >
                    Select an item above and click "Add to Collection".
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {selectedSet.items.map((setItem, idx) => {
                    const full = allItems.find((i) => i.id === setItem.id);
                    return (
                      <div
                        key={setItem.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          background: C.bg,
                          border: `1.5px solid ${C.goldBorder}`,
                          borderRadius: 12,
                          padding: "12px 16px",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = C.gold;
                          (e.currentTarget as HTMLDivElement).style.boxShadow =
                            "0 2px 10px rgba(200,169,110,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = C.goldBorder;
                          (e.currentTarget as HTMLDivElement).style.boxShadow =
                            "none";
                        }}
                      >
                        {/* Left: order + info */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: C.goldLight,
                              border: `1px solid ${C.goldBorder}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: C.goldDark,
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontFamily: serif,
                                fontWeight: 700,
                                fontSize: "0.92rem",
                                color: C.ink,
                              }}
                            >
                              {full
                                ? getItemTitle(full)
                                : `Item #${setItem.id}`}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.7rem",
                                color: C.inkSoft,
                                fontFamily: "monospace",
                              }}
                            >
                              ID: {setItem.id}
                            </p>
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemove(setItem.id)}
                          disabled={isProcessing || isSelectedSetDeleted}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: C.dangerBg,
                            border: `1px solid rgba(192,57,43,0.2)`,
                            color: C.danger,
                            borderRadius: 8,
                            padding: "7px 12px",
                            fontFamily: sans,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: (isProcessing || isSelectedSetDeleted) ? "not-allowed" : "pointer",
                            opacity: (isProcessing || isSelectedSetDeleted) ? 0.4 : 1,
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => {
                            if (!isProcessing && !isSelectedSetDeleted) e.currentTarget.style.background = "#fce8e5";
                          }}
                          onMouseLeave={(e) => {
                            if (!isProcessing && !isSelectedSetDeleted) e.currentTarget.style.background = C.dangerBg;
                          }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: C.surface,
              border: `1.5px dashed ${C.goldBorder}`,
              borderRadius: 16,
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: serif,
                fontSize: "1.1rem",
                color: C.inkSoft,
              }}
            >
              Select a collection from the left to manage its items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};