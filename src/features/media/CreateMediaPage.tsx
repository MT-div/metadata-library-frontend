import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateValueRequest } from "../../types/metadata";
import {
  UploadCloud,
  Save,
  Plus,
  Trash2,
  File,
  ArrowLeft,
  X,
} from "lucide-react";
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
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

interface PropertyOption {
  id: number;
  label: string;
}

export const CreateMediaPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [itemId, setItemId] = useState<number>(0);
  const [mediaValues, setMediaValues] = useState<CreateValueRequest[]>([]);
  const [availableProps, setAvailableProps] = useState<PropertyOption[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get("/api/properties")
      .then((res) => {
        setAvailableProps(res.data);
        if (res.data.length > 0) setSelectedPropId(res.data[0].id);
      })
      .catch((err) => console.error("Error fetching properties:", err));
  }, []);
  const handleFileSelect = (file: File) => setSelectedFile(file);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleAddValue = () => {
    if (!selectedPropId) return;
    setMediaValues((prev) => [
      ...prev,
      {
        propertyId: selectedPropId,
        valueText: "",
        type: "literal",
        language: "en",
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    if (itemId <= 0) {
      alert("Please enter a valid Item ID.");
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. تجهيز مصفوفة القيم تماماً كما يتوقعها C#
      const formattedValues = mediaValues.map((v) => ({
        propertyId: v.propertyId,
        valueText: v.valueText,
        type: "literal",
        language: "en",
      }));

      // 2. إنشاء الـ FormData لتطابق UploadMediaRequestDto في الباك اند
      const fd = new FormData();

      // انتبه: الأسماء هنا يجب أن تطابق خصائص الـ C# DTO تماماً
      fd.append("File", selectedFile);
      fd.append("ItemId", itemId.toString());
      fd.append("ValuesJson", JSON.stringify(formattedValues));

      // 3. إرسال الطلب المدمج لمرة واحدة فقط!
      // (افترضت أن هذا الـ Endpoint موجود داخل MediaController)
      const res = await api.post("/api/media/upload-with-metadata", fd, {
        headers: {
          "Content-Type": undefined, // هذا السطر يجبر Axios على عدم إرسال Header خاطئ
        },
      });
      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setSelectedFile(null);
          setItemId(0);
          setMediaValues([]);
          setSuccess(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }, 2200);
      }
    } catch (err) {
      console.error("Media upload error:", err);
      alert(
        "حدث خطأ أثناء رفع الملف أو حفظ البيانات. تأكد من أن الـ Item ID صحيح."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const inputStyle = (id: string | number): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${focusedField === id ? C.gold : C.goldBorder}`,
    borderRadius: 10,
    padding: "10px 14px",
    fontFamily: sans,
    fontSize: "0.88rem",
    color: C.ink,
    background: C.surface,
    outline: "none",
    transition: "border-color 0.2s",
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
            Admin · Media
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
            Upload Media
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Upload a file and attach descriptive metadata to it.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "transparent",
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 999,
            padding: "9px 18px",
            fontFamily: sans,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: C.inkMid,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.goldLight;
            e.currentTarget.style.borderColor = C.gold;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = C.goldBorder;
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* ── Card 1: Link to Item ── */}
          <SectionCard
            step="1"
            title="Link to Item"
            subtitle="Which item does this file belong to?"
          >
            <div style={{ maxWidth: 280 }}>
              <label style={labelStyle}>
                Item ID <span style={{ color: C.danger }}>*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 101"
                value={itemId || ""}
                onChange={(e) => setItemId(Number(e.target.value))}
                onFocus={() => setFocusedField("itemId")}
                onBlur={() => setFocusedField(null)}
                style={inputStyle("itemId")}
              />
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "0.72rem",
                  color: C.inkSoft,
                }}
              >
                The file must be linked to an existing item (book, manuscript,
                etc.)
              </p>
            </div>
          </SectionCard>

          {/* ── Card 2: File Upload ── */}
          <SectionCard
            step="2"
            title="Select File"
            subtitle="PDF, JPG, PNG, MP4, and more"
          >
            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${
                  isDragging
                    ? C.gold
                    : selectedFile
                    ? C.goldBorder
                    : C.goldBorder
                }`,
                background: isDragging
                  ? C.goldLight
                  : selectedFile
                  ? "#fdfaf6"
                  : C.bg,
                borderRadius: 14,
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: selectedFile ? "default" : "pointer",
                transition: "all 0.2s",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
                style={{ display: "none" }}
              />

              {selectedFile ? (
                /* File selected state */
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: C.goldLight,
                      border: `1.5px solid ${C.goldBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <File size={24} color={C.gold} strokeWidth={1.5} />
                  </div>
                  <div style={{ flexGrow: 1, overflow: "hidden" }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: C.ink,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedFile.name}
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "0.75rem",
                        color: C.inkSoft,
                      }}
                    >
                      {formatSize(selectedFile.size)} ·{" "}
                      {selectedFile.type || "unknown type"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: C.dangerBg,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: C.danger,
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                /* Empty state */
                <>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: isDragging
                        ? "rgba(200,169,110,0.25)"
                        : C.goldLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                      transition: "background 0.2s",
                    }}
                  >
                    <UploadCloud size={28} color={C.gold} strokeWidth={1.5} />
                  </div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: C.inkMid,
                    }}
                  >
                    {isDragging
                      ? "Drop file here"
                      : "Click to browse or drag & drop"}
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "0.78rem", color: C.inkSoft }}
                  >
                    PDF, JPG, PNG, MP4 — any size
                  </p>
                </>
              )}
            </div>
          </SectionCard>

          {/* ── Card 3: Optional metadata ── */}
          <SectionCard
            step="3"
            title="File Metadata"
            subtitle="Optional — add descriptive properties to this file"
          >
            {/* Add property row */}
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-end",
                padding: "14px 16px",
                background: C.bg,
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 12,
                marginBottom: mediaValues.length > 0 ? 16 : 0,
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <label style={{ ...labelStyle, marginBottom: 6 }}>
                  Add Property
                </label>
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(Number(e.target.value))}
                  style={{
                    width: "100%",
                    appearance: "none",
                    background: C.surface,
                    border: `1.5px solid ${C.goldBorder}`,
                    borderRadius: 10,
                    padding: "9px 32px 9px 12px",
                    fontFamily: sans,
                    fontSize: "0.85rem",
                    color: C.ink,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {availableProps.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    bottom: 10,
                    pointerEvents: "none",
                    color: C.inkSoft,
                    fontSize: 12,
                  }}
                >
                  ▾
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddValue}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: C.gold,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  fontFamily: sans,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = C.goldDark)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = C.gold)
                }
              >
                <Plus size={14} /> Add Field
              </button>
            </div>

            {/* Value rows */}
            {mediaValues.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mediaValues.map((val, idx) => {
                  const prop = availableProps.find(
                    (p) => p.id === val.propertyId
                  );
                  const fieldId = `media-${idx}`;
                  return (
                    <div
                      key={idx}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          minWidth: 110,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: C.inkMid,
                          padding: "4px 0",
                        }}
                      >
                        {prop?.label ?? "Property"}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Enter value..."
                        value={val.valueText ?? ""}
                        onChange={(e) => {
                          const u = [...mediaValues];
                          u[idx].valueText = e.target.value;
                          setMediaValues(u);
                        }}
                        onFocus={() => setFocusedField(fieldId)}
                        onBlur={() => setFocusedField(null)}
                        style={{ ...inputStyle(fieldId), flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setMediaValues(
                            mediaValues.filter((_, i) => i !== idx)
                          )
                        }
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: C.dangerBg,
                          border: "none",
                          color: C.danger,
                          cursor: "pointer",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.7")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {mediaValues.length === 0 && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: C.inkSoft,
                  fontStyle: "italic",
                  margin: "8px 0 0",
                }}
              >
                No metadata fields added yet. This section is optional.
              </p>
            )}
          </SectionCard>

          {/* ── Submit ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              paddingTop: 8,
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: "transparent",
                border: `1.5px solid ${C.goldBorder}`,
                borderRadius: 10,
                padding: "10px 20px",
                fontFamily: sans,
                fontSize: "0.88rem",
                fontWeight: 600,
                color: C.inkMid,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: success
                  ? "#edf7ee"
                  : isSubmitting
                  ? C.goldBorder
                  : C.gold,
                color: success ? "#2d6e3a" : "#fff",
                border: success ? "1.5px solid rgba(45,110,58,0.3)" : "none",
                borderRadius: 10,
                padding: "10px 28px",
                fontFamily: sans,
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow:
                  success || isSubmitting
                    ? "none"
                    : "0 2px 12px rgba(200,169,110,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !success)
                  e.currentTarget.style.background = C.goldDark;
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !success)
                  e.currentTarget.style.background = C.gold;
              }}
            >
              <Save size={16} />
              {isSubmitting
                ? "Uploading..."
                : success
                ? "✓ Upload Complete!"
                : "Upload & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Reusable Section Card ────────────────────────────────────────────────────
const C2 = {
  surface: "#FFFFFF",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldBorder: "rgba(200,169,110,0.28)",
  goldDark: "#b8965a",
  ink: "#1a1208",
  inkSoft: "#9a8060",
};
const serif2 = "'Georgia','Times New Roman',serif";
const sans2 = "'Poppins',system-ui,sans-serif";

const SectionCard = ({
  step,
  title,
  subtitle,
  children,
}: {
  step: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      background: C2.surface,
      border: `1.5px solid ${C2.goldBorder}`,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    }}
  >
    <div
      style={{
        background: C2.goldLight,
        borderBottom: `1.5px solid ${C2.goldBorder}`,
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: C2.gold,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: serif2,
          fontWeight: 800,
          fontSize: "0.9rem",
          color: "#fff",
        }}
      >
        {step}
      </div>
      <div>
        <h2
          style={{
            fontFamily: serif2,
            fontSize: "0.92rem",
            fontWeight: 700,
            color: C2.ink,
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p style={{ margin: 0, fontSize: "0.72rem", color: C2.inkSoft }}>
          {subtitle}
        </p>
      </div>
    </div>
    <div style={{ padding: "20px 22px" }}>{children}</div>
  </div>
);

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "#5c4a30",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  marginBottom: 8,
  fontFamily: sans2,
};
