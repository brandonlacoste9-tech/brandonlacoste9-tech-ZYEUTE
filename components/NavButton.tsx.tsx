import React from "react";

const NavButton: React.FC<{
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      border: "none",
      padding: "10px 0",
      background: "transparent",
      color: active ? "#f97316" : "#e5e7eb",
      fontSize: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <span style={{ fontSize: 20 }}>{icon}</span>
    {label}
  </button>
);

export default NavButton;
