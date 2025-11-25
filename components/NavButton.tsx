
import React from "react";

const NavButton: React.FC<{
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  isCenter?: boolean;
}> = ({ label, icon, active, onClick, isCenter }) => {
  if (isCenter) {
      return (
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <button
                onClick={onClick}
                style={{
                width: 44,
                height: 32,
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(to right, #00f2ea, #ff0050)", // TikTok style split or Gold
                color: "#fff",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)"
                }}
            >
                <div style={{ background: "#000", width: 38, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{color: "#fff", fontSize: 20}}>+</span>
                </div>
            </button>
        </div>
      );
  }

  return (
    <button
        onClick={onClick}
        style={{
        flex: 1,
        border: "none",
        padding: "12px 0",
        background: "transparent",
        color: active ? "#fff" : "#666", 
        fontSize: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        gap: 4,
        transition: "color 0.2s"
        }}
    >
        <span style={{ fontSize: 20, color: active ? "#D4AF37" : "#666" }}>{icon}</span>
        <span style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
    </button>
  );
};

export default NavButton;
