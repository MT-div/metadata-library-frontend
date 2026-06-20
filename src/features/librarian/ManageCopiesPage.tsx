import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import type { ItemResponse, ItemCopyResponse } from "../../types/metadata";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Barcode,
  Info,
  Archive,
  Loader2,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldMid: "rgba(200,169,110,0.15)", // تمت الإضافة هنا لحل الخطأ
  goldBorder: "rgba(200,169,110,0.28)",
  goldDark: "#b8965a",
  ink: "#1a1208",
  inkMid: "#5c4a30",
  inkSoft: "#9a8060",
  danger: "#c0392b",
  dangerBg: "#fdf0ee",
  success: "#2d6e3a",
  successBg: "#edf7ee",
  blue: "#2d6e9a",
  blueBg: "#e8f0f5",
  orange: "#b8860b",
  orangeBg: "#fcf6e8",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

export const ManageCopiesPage = () => {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [copies, setCopies] = useState<ItemCopyResponse[]>([]);

  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");

  // Add Copy Form State
  const [newBarcode, setNewBarcode] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // 1. تعريف الدالة هنا للأعلى واستخدام useCallback لحل أخطاء الـ dependencies
  // 1. الدالة الأساسية لجلب النسخ
  const handleSelectItem = useCallback(async (itemId: number) => {
    setSelectedItemId(itemId);
    setLoadingCopies(true);
    try {
      const res = await api.get<ItemCopyResponse[]>(
        `/api/item-copies?itemId=${itemId}`
      );

      // 👇 الحماية القصوى: التأكد من أن الرد هو مصفوفة فعلاً، وإلا نجعلها مصفوفة فارغة
      const validCopies = Array.isArray(res.data) ? res.data : [];
      setCopies(validCopies);

      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error fetching copies:", error);
      setCopies([]); // في حال حدوث خطأ 404 أو غيره، نعيدها مصفوفة فارغة
    } finally {
      setLoadingCopies(false);
    }
  }, []);
  // 2. الـ useEffect بعد تعريف الدالة
  useEffect(() => {
    api
      .get<ItemResponse[]>("/api/items")
      .then((res) => {
        setItems(res.data);
        if (res.data.length > 0) {
          handleSelectItem(res.data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching items:", err))
      .finally(() => setLoadingItems(false));
  }, [handleSelectItem]);

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !newBarcode.trim()) return;

    // التأكد من أنها مصفوفة قبل البحث داخلها
    if (
      Array.isArray(copies) &&
      copies.some(
        (c) => c.barcode?.toLowerCase() === newBarcode.trim().toLowerCase()
      )
    ) {
      alert("This barcode is already registered for this item!");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        itemId: selectedItemId,
        barcode: newBarcode.trim(),
        notes: newNotes.trim() || null,
      };

      await api.post("/api/item-copies", payload);

      const copiesRes = await api.get<ItemCopyResponse[]>(
        `/api/item-copies?itemId=${selectedItemId}`
      );

      // 👇 الحماية مرة أخرى عند تحديث القائمة بعد الإضافة
      setCopies(Array.isArray(copiesRes.data) ? copiesRes.data : []);

      setNewBarcode("");
      setNewNotes("");
      barcodeInputRef.current?.focus();
    } catch (error: unknown) {
      console.error("Error adding copy:", error);
      if (error instanceof AxiosError && error.response) {
        alert(error.response.data || "Failed to add copy.");
      } else {
        alert("Network error. Failed to add copy.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCopy = async (copyId: number) => {
    if (!confirm("Are you sure you want to delete this physical copy?")) return;

    setIsProcessing(true);
    try {
      await api.delete(`/api/item-copies/${copyId}`);
      setCopies((prev) => prev.filter((c) => c.id !== copyId));
    } catch (error: unknown) {
      console.error("Error deleting copy:", error);
      if (error instanceof AxiosError && error.response) {
        alert(
          error.response.data ||
            "Failed to delete copy. It might be currently borrowed."
        );
      } else {
        alert("Network error. Failed to delete copy.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getItemTitle = (item: ItemResponse) => {
    const titleObj = item.metadataValues.find(
      (v) =>
        v.propertyLabel.toLowerCase().includes("title") ||
        v.propertyLabel.includes("عنوان")
    );
    return titleObj?.valueText || `Untitled #${item.id}`;
  };

  const filteredItems = items.filter((item) => {
    const title = getItemTitle(item).toLowerCase();
    const query = search.toLowerCase();
    return title.includes(query) || item.id.toString() === query;
  });

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Available", color: C.success, bg: C.successBg };
      case 1:
        return { label: "Borrowed", color: C.orange, bg: C.orangeBg };
      case 2:
        return { label: "Reference Only", color: C.blue, bg: C.blueBg };
      case 3:
        return { label: "Maintenance", color: C.danger, bg: C.dangerBg };
      default:
        return { label: "Unknown", color: C.inkSoft, bg: C.bg };
    }
  };

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
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
            Librarian · Inventory
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
            Item Copies Management
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Add physical barcodes to catalog items to make them available for
            circulation.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ══ LEFT: Items List ══ */}
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
              gap: 8,
            }}
          >
            <Archive size={16} color={C.goldDark} />
            <h2
              style={{
                fontFamily: serif,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              Catalog Items
            </h2>
          </div>

          <div
            style={{
              padding: "12px",
              borderBottom: `1px solid ${C.goldBorder}`,
              background: C.bg,
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                color={C.inkSoft}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 10px 8px 32px",
                  borderRadius: 8,
                  border: `1px solid ${C.goldBorder}`,
                  fontSize: "0.8rem",
                  fontFamily: sans,
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div
            style={{
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              padding: "10px",
            }}
          >
            {loadingItems ? (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: C.inkSoft,
                  padding: "20px 0",
                }}
              >
                Loading items...
              </p>
            ) : filteredItems.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: C.inkSoft,
                  padding: "20px 0",
                }}
              >
                No items found.
              </p>
            ) : (
              filteredItems.map((item) => {
                const isActive = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px",
                      borderRadius: 10,
                      marginBottom: 4,
                      border: `1.5px solid ${
                        isActive ? C.gold : "transparent"
                      }`,
                      background: isActive ? C.goldLight : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = C.bg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? C.goldDark : C.ink,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {getItemTitle(item)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: C.inkSoft,
                        fontFamily: "monospace",
                      }}
                    >
                      ID: {item.id}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══ RIGHT: Copies Management ══ */}
        {selectedItem ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                background: C.surface,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  background: C.goldLight,
                  borderBottom: `1.5px solid ${C.goldBorder}`,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: C.gold,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookOpen size={22} color="#fff" />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: serif,
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: C.ink,
                      margin: "0 0 4px",
                    }}
                  >
                    {getItemTitle(selectedItem)}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8rem",
                      color: C.inkSoft,
                      fontFamily: "monospace",
                    }}
                  >
                    Item ID: {selectedItem.id}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddCopy}
                style={{
                  padding: "20px 24px",
                  background: C.bg,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 200px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: C.inkMid,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    <Barcode size={14} color={C.gold} /> Scan New Barcode{" "}
                    <span style={{ color: C.danger }}>*</span>
                  </label>
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    required
                    placeholder="e.g. B-10001"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: `1.5px solid ${C.goldBorder}`,
                      fontSize: "0.95rem",
                      fontFamily: "monospace",
                      outline: "none",
                      textTransform: "uppercase",
                    }}
                  />
                </div>
                <div style={{ flex: "2 1 250px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: C.inkMid,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Second Edition, Donated..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: `1px solid ${C.goldBorder}`,
                      fontSize: "0.9rem",
                      fontFamily: sans,
                      outline: "none",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || !newBarcode.trim()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background:
                      isProcessing || !newBarcode.trim()
                        ? C.goldBorder
                        : C.gold,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor:
                      isProcessing || !newBarcode.trim()
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.2s",
                    height: "42px",
                  }}
                >
                  {isProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}{" "}
                  Add Copy
                </button>
              </form>
            </div>

            <div
              style={{
                background: C.surface,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: `1px solid ${C.goldBorder}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: serif,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  Physical Copies Inventory
                </h3>
                <span
                  style={{
                    background: C.goldMid,
                    color: C.goldDark,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 999,
                  }}
                >
                  {copies.length} Copies Total
                </span>
              </div>

              {loadingCopies ? (
                <div
                  style={{ padding: 60, textAlign: "center", color: C.inkSoft }}
                >
                  Loading copies...
                </div>
              ) : copies.length === 0 ? (
                <div style={{ padding: "60px 24px", textAlign: "center" }}>
                  <Barcode
                    size={32}
                    color={C.goldBorder}
                    style={{ margin: "0 auto 12px" }}
                  />
                  <p
                    style={{
                      fontFamily: serif,
                      fontSize: "1.1rem",
                      color: C.inkMid,
                      margin: "0 0 6px",
                    }}
                  >
                    No copies found
                  </p>
                  <p
                    style={{ color: C.inkSoft, fontSize: "0.85rem", margin: 0 }}
                  >
                    Scan a barcode above to add the first physical copy.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#fdfaf6",
                          borderBottom: `1.5px solid ${C.goldBorder}`,
                        }}
                      >
                        {["ID", "Barcode", "Status", "Notes", "Actions"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                padding: "12px 20px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: C.inkSoft,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(copies) ? copies : []).map(
                        (copy, idx) => {
                          const badge = getStatusBadge(copy.status);
                          return (
                            <tr
                              key={copy.id}
                              style={{
                                borderBottom:
                                  idx < copies.length - 1
                                    ? `1px solid ${C.goldBorder}`
                                    : "none",
                              }}
                            >
                              <td
                                style={{
                                  padding: "14px 20px",
                                  fontFamily: "monospace",
                                  fontSize: "0.8rem",
                                  color: C.inkSoft,
                                }}
                              >
                                #{copy.id}
                              </td>
                              <td
                                style={{
                                  padding: "14px 20px",
                                  fontFamily: "monospace",
                                  fontSize: "0.95rem",
                                  fontWeight: 700,
                                  color: C.ink,
                                }}
                              >
                                {copy.barcode}
                              </td>
                              <td style={{ padding: "14px 20px" }}>
                                <span
                                  style={{
                                    background: badge.bg,
                                    color: badge.color,
                                    border: `1px solid ${badge.color}40`,
                                    padding: "4px 10px",
                                    borderRadius: 6,
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    display: "inline-block",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {badge.label}
                                </span>
                              </td>
                              <td
                                style={{ padding: "14px 20px", maxWidth: 200 }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "0.8rem",
                                    color: C.inkMid,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={copy.notes || ""}
                                >
                                  {copy.notes || "—"}
                                </p>
                              </td>
                              <td style={{ padding: "14px 20px" }}>
                                <button
                                  onClick={() => handleDeleteCopy(copy.id)}
                                  disabled={isProcessing}
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 8,
                                    background: C.dangerBg,
                                    border: "none",
                                    color: C.danger,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: isProcessing
                                      ? "not-allowed"
                                      : "pointer",
                                    transition: "opacity 0.15s",
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
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
              padding: "80px 24px",
              textAlign: "center",
              alignSelf: "start",
            }}
          >
            <Info
              size={32}
              color={C.goldBorder}
              style={{ margin: "0 auto 16px" }}
            />
            <p
              style={{
                fontFamily: serif,
                fontSize: "1.1rem",
                color: C.inkSoft,
              }}
            >
              Select an item from the catalog list to manage its physical
              copies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
