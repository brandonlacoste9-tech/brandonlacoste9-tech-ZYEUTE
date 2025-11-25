
import React from "react";
import { DEMO_SONGS } from "../constants";

interface DiscoverProps {
  t: (key: string) => string;
}

const HASHTAGS = ["#Québec", "#Hiver", "#Poutine", "#Canadiens", "#Montréal", "#Gaspésie", "#HumourQC", "#Construction"];

const Discover: React.FC<DiscoverProps> = ({ t }) => {
  return (
    <div style={{ padding: 16 }}>
      {/* Search Bar */}
      <div style={{ marginBottom: 20 }}>
        <input 
          type="text" 
          placeholder={t("search_placeholder")}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#121212",
            color: "#fff",
            fontSize: 14,
            outline: "none"
          }}
        />
      </div>

      {/* Banner */}
      <div style={{ 
        height: 140, 
        borderRadius: 12, 
        background: "linear-gradient(120deg, #D4AF37, #b8860b)",
        marginBottom: 24,
        display: "flex", 
        alignItems: "center", 
        padding: 20,
        position: "relative",
        overflow: "hidden"
      }}>
         <div style={{ zIndex: 1, color: "#000" }}>
           <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, textTransform: "uppercase" }}>Concours Poutine</h2>
           <p style={{ margin: "4px 0 0 0", fontSize: 13, fontWeight: 600 }}>Gagne des billets pour le festival!</p>
           <button style={{ marginTop: 10, border: "none", background: "#000", color: "#D4AF37", padding: "6px 12px", borderRadius: 4, fontWeight: "bold", cursor: "pointer" }}>Participer</button>
         </div>
         <div style={{ position: "absolute", right: -20, bottom: -20, fontSize: 100, opacity: 0.3 }}>🍟</div>
      </div>

      {/* Trending Hashtags */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, color: "#D4AF37", marginBottom: 12 }}>{t("trending_hashtags")}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HASHTAGS.map(tag => (
            <span key={tag} style={{
              background: "#1e293b",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 13,
              color: "#e2e8f0",
              border: "1px solid #333",
              cursor: "pointer"
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Trending Sounds */}
      <div>
        <h3 style={{ fontSize: 16, color: "#D4AF37", marginBottom: 12 }}>{t("trending_sounds")}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DEMO_SONGS.map((song, i) => (
            <div key={song.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: "bold", color: "#666", width: 20 }}>{i + 1}</div>
              <img src={song.coverUrl} style={{ width: 40, height: 40, borderRadius: 4 }} alt="cover" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{song.title}</div>
                <div style={{ fontSize: 12, color: "#999" }}>{song.artist}</div>
              </div>
              <button style={{ background: "transparent", border: "1px solid #444", borderRadius: "50%", width: 32, height: 32, color: "#fff", cursor: "pointer" }}>▶</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discover;
