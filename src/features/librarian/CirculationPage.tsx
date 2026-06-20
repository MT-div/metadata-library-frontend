import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  UserCheck,
  UserX,
  UserPlus,
  Barcode,
  CheckCircle2,
  Undo2,
  Clock,
  Loader2,
} from "lucide-react";

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

// FIX: Tailwind animate-spin replaced with inline style throughout
const spinStyle: React.CSSProperties = { animation: "spin 1s linear infinite" };

interface Patron {
  id: number;
  fullName: string;
  nationalId: string;
}
interface CirculationRecord {
  id: number;
  copyId: number;
  patronId: number;
  patronName: string;
  itemTitle: string;
  barcode: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: string;
}

// ── Shared field label ────────────────────────────────────────────────────────
const FieldLabel = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: "0.78rem",
      fontWeight: 700,
      color: C.inkMid,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: 10,
      fontFamily: sans,
    }}
  >
    {icon} {children}
  </label>
);

// ── Shared barcode input ──────────────────────────────────────────────────────
const BarcodeInput = ({
  inputRef,
  value,
  onChange,
  placeholder,
  large = false,
}: {
  inputRef?: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  large?: boolean;
}) => (
  <input
    ref={inputRef}
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding: large ? "16px" : "13px 16px",
      borderRadius: 10,
      border: `1.5px solid ${C.gold}`,
      fontSize: large ? "1.2rem" : "1rem",
      fontFamily: "monospace",
      outline: "none",
      background: C.bg,
      textAlign: large ? "center" : "left",
      transition: "border-color 0.2s",
    }}
    onFocus={(e) =>
      (e.target.style.boxShadow = "0 0 0 3px rgba(200,169,110,0.18)")
    }
    onBlur={(e) => (e.target.style.boxShadow = "none")}
  />
);

export const CirculationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"checkout" | "return">("checkout");
  const [patronId, setPatronId] = useState("");
  const [patronData, setPatronData] = useState<Patron | null>(null);
  const [patronError, setPatronError] = useState(false);
  const [isVerifyingPatron, setIsVerifyingPatron] = useState(false);
  const [checkoutBarcode, setCheckoutBarcode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [returnBarcode, setReturnBarcode] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<CirculationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const checkoutBarcodeRef = useRef<HTMLInputElement>(null);
  const returnBarcodeRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get<CirculationRecord[]>(
        "/api/Circulation/history"
      );
      const sorted = res.data.sort(
        (a, b) =>
          new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
      );
      setHistory(sorted.slice(0, 10));
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadHistory();
    })();
  }, [loadHistory]);

  // ── Patron Verification ──
  const verifyPatron = async () => {
    const inputId = patronId.trim();
    if (!inputId) {
      setPatronData(null);
      setPatronError(false);
      return;
    }
    setIsVerifyingPatron(true);
    setPatronError(false);
    try {
      // 👇 1. نستخدم الـ Endpoint الخاص بالبحث بدلاً من الـ ID المباشر
      const res = await api.get<Patron[]>(`/api/Patrons?search=${inputId}`);

      // 👇 2. بما أن البحث يعيد مصفوفة (قد تحتوي تشابهات)، نبحث عن التطابق التام للرقم الوطني
      const exactMatch = res.data.find(
        (p) => p.nationalId.toLowerCase() === inputId.toLowerCase()
      );

      if (exactMatch) {
        setPatronData(exactMatch);
        // Auto focus barcode input after successful patron scan
        setTimeout(() => checkoutBarcodeRef.current?.focus(), 100);
      } else {
        // إذا لم نجد تطابقاً تاماً، نرمي خطأ ليتم التقاطه في الأسفل
        throw new Error("Patron not found");
      }
    } catch (err: unknown) {
      console.error("Patron verification failed:", err);
      setPatronData(null);
      setPatronError(true);
    } finally {
      setIsVerifyingPatron(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronData || !checkoutBarcode.trim()) return;
    setIsCheckingOut(true);
    setCheckoutSuccess(null);
    try {
      await api.post("/api/Circulation/checkout", {
        barcode: checkoutBarcode.trim(),
        patronId: patronData.id,
      });
      setCheckoutSuccess(
        `Item ${checkoutBarcode} checked out to ${patronData.fullName}!`
      );
      setCheckoutBarcode("");
      loadHistory();
      setTimeout(() => setCheckoutSuccess(null), 3000);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response)
        alert(err.response.data || "Checkout error.");
      else alert("Network error processing checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBarcode.trim()) return;
    setIsReturning(true);
    setReturnSuccess(null);
    try {
      await api.post("/api/Circulation/return", {
        barcode: returnBarcode.trim(),
      });
      setReturnSuccess(`Item ${returnBarcode} returned successfully!`);
      setReturnBarcode("");
      loadHistory();
      setTimeout(() => setReturnSuccess(null), 3000);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response)
        alert(err.response.data || "Return error.");
      else alert("Network error processing return.");
    } finally {
      setIsReturning(false);
    }
  };

  const handleUndo = async (recordId: number) => {
    // TODO: implement POST /api/Circulation/undo/{id} on the backend
    alert(
      "Backend note: add POST /api/Circulation/undo/{id} to reverse the operation."
    );
    setHistory((prev) => prev.filter((h) => h.id !== recordId));
  };

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
            Desk Operations
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
            Circulation Desk
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Scan barcodes to rapidly checkout or return library items.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ══ LEFT: Forms ══ */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              borderBottom: `1.5px solid ${C.goldBorder}`,
            }}
          >
            {(["checkout", "return"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setTimeout(() => {
                    if (tab === "checkout")
                      document.getElementById("patronInput")?.focus();
                    else returnBarcodeRef.current?.focus();
                  }, 100);
                }}
                style={{
                  flex: 1,
                  padding: "18px",
                  border: "none",
                  background: activeTab === tab ? C.goldLight : "transparent",
                  color: activeTab === tab ? C.goldDark : C.inkMid,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  fontFamily: sans,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background 0.2s",
                  borderBottom:
                    activeTab === tab
                      ? `2px solid ${C.gold}`
                      : "2px solid transparent",
                }}
              >
                {tab === "checkout" ? (
                  <>
                    <ArrowRight size={17} /> Checkout
                  </>
                ) : (
                  <>
                    <ArrowLeft size={17} /> Return
                  </>
                )}
              </button>
            ))}
          </div>

          <div style={{ padding: "32px 40px" }}>
            {/* ── CHECKOUT TAB ── */}
            {activeTab === "checkout" && (
              <form
                onSubmit={handleCheckout}
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {/* Step 1: Patron */}
                <div
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.goldBorder}`,
                    borderRadius: 12,
                    padding: "20px",
                  }}
                >
                  <FieldLabel icon={<Search size={14} color={C.gold} />}>
                    1. Identify Patron
                  </FieldLabel>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      id="patronInput"
                      type="text"
                      placeholder="Scan or type Patron ID..."
                      value={patronId}
                      onChange={(e) => setPatronId(e.target.value)}
                      onBlur={(e) => {
                        verifyPatron();
                        (e.target as HTMLInputElement).style.borderColor =
                          C.goldBorder;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          verifyPatron();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "11px 14px",
                        borderRadius: 8,
                        border: `1.5px solid ${C.goldBorder}`,
                        fontSize: "0.9rem",
                        fontFamily: "monospace",
                        outline: "none",
                        background: C.surface,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = C.gold)}
                    />
                    <button
                      type="button"
                      onClick={verifyPatron}
                      style={{
                        background: C.gold,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "0 20px",
                        fontWeight: 700,
                        fontFamily: sans,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = C.goldDark)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = C.gold)
                      }
                    >
                      {/* FIX: was className="animate-spin" */}
                      {isVerifyingPatron ? (
                        <Loader2 size={17} style={spinStyle} />
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>

                  {/* Patron verified */}
                  {patronData && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: C.success,
                        background: C.successBg,
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      <UserCheck size={17} /> Verified: {patronData.fullName}
                    </div>
                  )}

                  {/* Patron not found */}
                  {patronError && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: C.dangerBg,
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: `1px solid rgba(192,57,43,0.2)`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: C.danger,
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        <UserX size={17} /> Patron not found in the system.
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/librarian/patrons/new", {
                            state: { returnTo: "/librarian/circulation" },
                          })
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          background: C.danger,
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: "0.73rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <UserPlus size={13} /> Add Patron
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2: Barcode */}
                <div
                  style={{
                    opacity: patronData ? 1 : 0.45,
                    pointerEvents: patronData ? "auto" : "none",
                    transition: "opacity 0.3s",
                  }}
                >
                  <FieldLabel icon={<Barcode size={14} color={C.gold} />}>
                    2. Scan or Type Item Barcode
                  </FieldLabel>
                  <BarcodeInput
                    inputRef={
                      checkoutBarcodeRef as React.RefObject<HTMLInputElement>
                    }
                    value={checkoutBarcode}
                    onChange={setCheckoutBarcode}
                    placeholder="e.g. B-10001..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    !patronData || !checkoutBarcode.trim() || isCheckingOut
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    background:
                      !patronData || !checkoutBarcode.trim()
                        ? C.goldBorder
                        : C.gold,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: "1rem",
                    fontWeight: 700,
                    fontFamily: sans,
                    cursor:
                      !patronData || !checkoutBarcode.trim()
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (patronData && checkoutBarcode.trim() && !isCheckingOut)
                      e.currentTarget.style.background = C.goldDark;
                  }}
                  onMouseLeave={(e) => {
                    if (patronData && checkoutBarcode.trim())
                      e.currentTarget.style.background = C.gold;
                  }}
                >
                  {/* FIX: was className="animate-spin" */}
                  {isCheckingOut ? (
                    <Loader2 size={19} style={spinStyle} />
                  ) : (
                    "Complete Checkout"
                  )}
                </button>

                {checkoutSuccess && (
                  <div
                    style={{
                      textAlign: "center",
                      color: C.success,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={17} /> {checkoutSuccess}
                  </div>
                )}
              </form>
            )}

            {/* ── RETURN TAB ── */}
            {activeTab === "return" && (
              <form
                onSubmit={handleReturn}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  padding: "20px 0",
                }}
              >
                <div>
                  <FieldLabel icon={<Barcode size={14} color={C.gold} />}>
                    Scan Item to Return
                  </FieldLabel>
                  <BarcodeInput
                    inputRef={
                      returnBarcodeRef as React.RefObject<HTMLInputElement>
                    }
                    value={returnBarcode}
                    onChange={setReturnBarcode}
                    placeholder="Scan book barcode..."
                    large
                  />
                  <p
                    style={{
                      textAlign: "center",
                      margin: "10px 0 0",
                      fontSize: "0.8rem",
                      color: C.inkSoft,
                    }}
                  >
                    The system will automatically process the return and clear
                    the patron's record.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!returnBarcode.trim() || isReturning}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: !returnBarcode.trim() ? C.goldBorder : C.gold,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: "1rem",
                    fontWeight: 700,
                    fontFamily: sans,
                    cursor: !returnBarcode.trim() ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (returnBarcode.trim() && !isReturning)
                      e.currentTarget.style.background = C.goldDark;
                  }}
                  onMouseLeave={(e) => {
                    if (returnBarcode.trim())
                      e.currentTarget.style.background = C.gold;
                  }}
                >
                  {/* FIX: was className="animate-spin" */}
                  {isReturning ? (
                    <Loader2 size={19} style={spinStyle} />
                  ) : (
                    "Process Return"
                  )}
                </button>

                {returnSuccess && (
                  <div
                    style={{
                      textAlign: "center",
                      color: C.success,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={17} /> {returnSuccess}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* ══ RIGHT: Recent History ══ */}
        <div
          style={{
            background: C.bg,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 16,
            overflow: "hidden",
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
            <Clock size={16} color={C.goldDark} />
            <h3
              style={{
                margin: 0,
                fontFamily: serif,
                fontWeight: 700,
                fontSize: "0.92rem",
                color: C.ink,
              }}
            >
              Recent Operations
            </h3>
          </div>

          <div
            style={{
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: "calc(100vh - 220px)",
              overflowY: "auto",
            }}
          >
            {loadingHistory ? (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: C.inkSoft,
                  margin: "20px 0",
                  fontStyle: "italic",
                }}
              >
                Loading history...
              </p>
            ) : history.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: C.inkSoft,
                  margin: "20px 0",
                }}
              >
                No recent operations.
              </p>
            ) : (
              history.map((record, idx) => {
                const isReturn = record.status.toLowerCase() === "returned";
                return (
                  <div
                    key={record.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.goldBorder}`,
                      borderRadius: 10,
                      padding: "12px",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: isReturn ? C.successBg : C.goldLight,
                        color: isReturn ? C.success : C.goldDark,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isReturn ? (
                        <ArrowLeft size={15} />
                      ) : (
                        <ArrowRight size={15} />
                      )}
                    </div>

                    <div style={{ flexGrow: 1, overflow: "hidden" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: isReturn ? C.success : C.goldDark,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {isReturn ? "Returned" : "Checked Out"}
                      </p>
                      <p
                        style={{
                          margin: "2px 0",
                          fontSize: "0.83rem",
                          fontWeight: 600,
                          color: C.ink,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={record.itemTitle}
                      >
                        {record.itemTitle || record.barcode}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.7rem",
                          color: C.inkSoft,
                        }}
                      >
                        {isReturn
                          ? `By: ${record.patronName}`
                          : `To: ${record.patronName}`}
                      </p>
                    </div>

                    {idx < 3 && (
                      <button
                        onClick={() => handleUndo(record.id)}
                        title="Undo"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: C.inkSoft,
                          cursor: "pointer",
                          padding: 4,
                          flexShrink: 0,
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = C.danger)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = C.inkSoft)
                        }
                      >
                        <Undo2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FIX: keyframe for spin animation (was relying on Tailwind animate-spin) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
