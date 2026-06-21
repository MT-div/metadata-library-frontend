// src/components/ui/GoldBtn.tsx
import React from "react";
import { C, fonts } from "../../utils/theme";

interface GoldBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  success?: boolean;
}

export const GoldBtn = ({
  children,
  disabled,
  success,
  style,
  ...props
}: GoldBtnProps) => {
  return (
    <button
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: success ? "#edf7ee" : disabled ? C.goldBorder : C.gold,
        color: success ? "#2d6e3a" : "#fff",
        border: success ? "1.5px solid rgba(45,110,58,0.3)" : "none",
        borderRadius: 10,
        padding: "10px 24px",
        fontFamily: fonts.sans,
        fontSize: "0.88rem",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        boxShadow:
          success || disabled ? "none" : "0 2px 12px rgba(200,169,110,0.35)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !success) {
          e.currentTarget.style.background = C.goldDark;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !success) {
          e.currentTarget.style.background = C.gold;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};
