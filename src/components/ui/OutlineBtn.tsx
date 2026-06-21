// src/components/ui/OutlineBtn.tsx
import React from "react";
import { C, fonts } from "../../utils/theme";

interface OutlineBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  rounded?: boolean; // خيار لجعل الزر بيضاوي (مثل زر Back)
}

export const OutlineBtn = ({
  children,
  rounded = false,
  style,
  ...props
}: OutlineBtnProps) => {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        background: "transparent",
        border: `1.5px solid ${C.goldBorder}`,
        borderRadius: rounded ? 999 : 10,
        padding: rounded ? "9px 18px" : "10px 20px",
        fontFamily: fonts.sans,
        fontSize: rounded ? "0.85rem" : "0.88rem",
        fontWeight: 600,
        color: C.inkMid,
        cursor: "pointer",
        transition: "all 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = rounded ? C.goldLight : C.bg;
        if (rounded) {
          e.currentTarget.style.borderColor = C.gold;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        if (rounded) {
          e.currentTarget.style.borderColor = C.goldBorder;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};
