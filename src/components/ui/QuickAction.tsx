// src/components/ui/QuickAction.tsx
import React from "react";
import { ArrowRight } from "lucide-react";
import { C } from "../../utils/theme";

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

export const QuickAction = ({
  icon,
  title,
  subtitle,
  onClick,
}: QuickActionProps) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      background: "transparent",
      border: "none",
      borderRadius: 10,
      cursor: "pointer",
      transition: "background 0.15s",
      textAlign: "left",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        flexShrink: 0,
        background: C.goldMid,
        color: C.goldDark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
    <div style={{ flexGrow: 1 }}>
      <p
        style={{
          margin: "0 0 2px",
          fontSize: "0.9rem",
          fontWeight: 700,
          color: C.ink,
        }}
      >
        {title}
      </p>
      <p style={{ margin: 0, fontSize: "0.75rem", color: C.inkSoft }}>
        {subtitle}
      </p>
    </div>
    <ArrowRight size={15} color={C.gold} style={{ flexShrink: 0 }} />
  </button>
);
