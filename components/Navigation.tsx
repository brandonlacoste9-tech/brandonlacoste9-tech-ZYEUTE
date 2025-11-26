
import React from "react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onCreateClick }) => {
  
  const getButtonStyle = (tabName: string) => {
    const isActive = activeTab === tabName;
    return {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: 4,
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: isActive ? "#fff" : "#666",
      transition: "color 0.2s",
      padding: "8px 0"
    };
  };

  const iconColor = (tabName: string) => activeTab === tabName ? "#fff" : "#666";
  const strokeWidth = (tabName: string) => activeTab === tabName ? 2.5 : 2;

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      background: "rgba(5, 5, 5, 0.95)",
      backdropFilter: "blur(10px)",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      paddingBottom: "env(safe-area-inset-bottom, 20px)",
      paddingTop: 8,
      maxWidth: 480,
      margin: "0 auto"
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", height: 50, padding: "0 8px" }}>
        
        {/* 1. FIL (Home) */}
        <button 
          onClick={() => onTabChange('feed')}
          style={getButtonStyle('feed')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor('feed')} strokeWidth={strokeWidth('feed')} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.5px" }}>Fil</span>
        </button>

        {/* 2. DÉCOUVRIR (Discover) */}
        <button 
          onClick={() => onTabChange('discover')}
          style={getButtonStyle('discover')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor('discover')} strokeWidth={strokeWidth('discover')} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.5px" }}>Découvrir</span>
        </button>

        {/* 3. CRÉER (+) - The "Gold" Button */}
        <div style={{ flex: 1, display: "flex", justifySelf: "center", alignItems: "center", justifyContent: "center", height: "100%", paddingBottom: 8 }}>
          <button 
            onClick={onCreateClick}
            style={{
              position: "relative",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0
            }}
          >
            {/* Split effect container */}
            <div style={{
              position: "relative",
              width: 48,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {/* Left/Right Offset colors mimicking TikTok split but Gold/White */}
              <div style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: 8, transform: "translateX(2px)", opacity: 0.2 }}></div>
              <div style={{ position: "absolute", inset: 0, background: "#D4AF37", borderRadius: 8, transform: "translateX(-2px)", opacity: 0.2 }}></div>
              
              {/* Main Button */}
              <div style={{
                position: "relative",
                width: 44,
                height: 32,
                background: "linear-gradient(to right, #C6934B, #F3C982)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(212, 175, 55, 0.3)"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* 4. BOÎTE (Inbox) */}
        <button 
          onClick={() => onTabChange('inbox')}
          style={getButtonStyle('inbox')}
        >
          <div style={{ position: "relative" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor('inbox')} strokeWidth={strokeWidth('inbox')} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {/* Notification Dot */}
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #000" }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.5px" }}>Boîte</span>
        </button>

        {/* 5. MON ESPACE (Profile) */}
        <button 
          onClick={() => onTabChange('profile')}
          style={getButtonStyle('profile')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor('profile')} strokeWidth={strokeWidth('profile')} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.5px" }}>Profil</span>
        </button>

      </div>
    </nav>
  );
};

export default Navigation;
