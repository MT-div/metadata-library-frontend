import React from "react";
import { C } from "../../utils/theme";

interface IconBtnProps {
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
}

export const IconBtn = ({
  icon,
  onClick,
  danger,
  disabled,
  title,
}: IconBtnProps) => {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: "none",
        background: disabled ? "#f1f5f9" : danger ? C.dangerBg : C.goldLight,
        color: disabled ? "#94a3b8" : danger ? C.danger : C.goldDark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.75";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {icon}
    </button>
  );
};
