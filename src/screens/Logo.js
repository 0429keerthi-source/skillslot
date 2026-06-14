// Logo.js — shared SkillSlot logo component
import React from "react";

function Logo({ size = "md" }) {
  const sizes = {
    sm: { skill: 16, slot: 16, bar: 24, barH: 2 },
    md: { skill: 20, slot: 20, bar: 30, barH: 2.5 },
    lg: { skill: 32, slot: 32, bar: 48, barH: 3 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{
          fontSize: s.skill,
          fontWeight: 700,
          color: "#1a1a1a",
          letterSpacing: "-0.5px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>Skill</span>
        <span style={{
          fontSize: s.slot,
          fontWeight: 300,
          color: "#1D9E75",
          letterSpacing: "-0.5px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>Slot</span>
      </div>
      <div style={{
        width: s.bar,
        height: s.barH,
        background: "#1D9E75",
        borderRadius: 99,
        marginTop: 2,
      }} />
    </div>
  );
}

export default Logo;
