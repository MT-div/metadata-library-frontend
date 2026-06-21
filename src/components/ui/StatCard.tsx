// src/components/ui/StatCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  link: string;
  loading: boolean;
  alert?: boolean; // خاصية اختيارية لدعم التنبيهات اللونية (مثل الإعارات المتأخرة)
}

export const StatCard = ({
  title,
  value,
  icon,
  link,
  loading,
  alert = false,
}: StatCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(link)}
      style={{
        background: C.surface,
        border: `1.5px solid ${alert ? "rgba(192,57,43,0.3)" : C.goldBorder}`,
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = alert
          ? "0 10px 24px rgba(192,57,43,0.15)"
          : "0 10px 24px rgba(200,169,110,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: alert ? C.dangerBg : C.goldLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: alert ? C.danger : C.goldDark,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: alert ? C.danger : C.inkSoft,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "1.6rem",
            fontWeight: 800,
            color: C.ink,
            fontFamily: fonts.serif,
            lineHeight: 1,
          }}
        >
          {loading ? "·  ·  ·" : value}
        </p>
      </div>
    </div>
  );
};
