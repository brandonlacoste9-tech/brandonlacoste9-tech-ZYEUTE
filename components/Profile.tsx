
import React, { useState } from "react";
import { Post, User, Follow } from "../types";

interface ProfileProps {
  currentUser: User;
  users: User[];
  posts: Post[];
  follows: Follow[];
  t: (key: string) => string;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({
  currentUser,
  users,
  posts,
  follows,
  t,
  onUpdateUser,
}) => {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);

  const followers = follows.filter((f) => f.followingId === currentUser.id);
  const following = follows.filter((f) => f.followerId === currentUser.id);

  const myPosts = posts.filter((p) => p.userId === currentUser.id);

  const handleSave = () => {
    onUpdateUser({
      ...currentUser,
      displayName: displayName.trim() || currentUser.displayName,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || currentUser.avatarUrl,
    });
    setEditing(false);
  };

  return (
    <div style={{ padding: 0, minHeight: "100%", background: "#050505" }}>
      {/* Header Section with subtle gradient */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        padding: "40px 20px 30px 20px",
        background: "linear-gradient(to bottom, #0f172a 0%, #050505 100%)", // Subtle dark blue to black
        borderBottom: "1px solid #222"
      }}>
        
        {/* Avatar with glow */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.displayName}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #D4AF37",
              boxShadow: "0 0 25px rgba(212, 175, 55, 0.15)"
            }}
          />
          {editing && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 24 }}>✏️</span>
            </div>
          )}
        </div>

        {/* Name & Handle */}
        {!editing ? (
          <>
            <h2 style={{ 
              margin: "0 0 6px 0", 
              fontSize: 24, 
              fontWeight: 800, 
              color: "#fff", 
              display: "flex", 
              alignItems: "center", 
              gap: 8,
              letterSpacing: "0.5px"
            }}>
              {currentUser.displayName}
              {currentUser.isVerified && <span title="Certifié QC">⚜️</span>}
            </h2>
            <div style={{ fontSize: 14, color: "#D4AF37", marginBottom: 24, fontWeight: 500, letterSpacing: "0.5px" }}>
              @{currentUser.username} <span style={{color: "#444", margin: "0 6px"}}>|</span> {currentUser.city}
            </div>

            {/* Stats Row - Improved Layout */}
            <div style={{ 
              display: "flex", 
              gap: 40, 
              marginBottom: 24, 
              alignItems: "center",
              background: "rgba(255,255,255,0.03)",
              padding: "12px 24px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.05)"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: 22, color: "#fff" }}>{myPosts.length}</div>
                <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>{t("posts_count")}</div>
              </div>
              <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.1)" }}></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: 22, color: "#fff" }}>{followers.length}</div>
                <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>{t("followers")}</div>
              </div>
              <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.1)" }}></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: 22, color: "#fff" }}>{following.length}</div>
                <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>{t("following")}</div>
              </div>
            </div>

            {/* Bio */}
            <p style={{ 
              textAlign: "center", 
              fontSize: 14, 
              color: "#cbd5e1", 
              whiteSpace: "pre-wrap", 
              lineHeight: 1.6, 
              maxWidth: "85%",
              margin: "0 0 28px 0"
            }}>
              {currentUser.bio || t("your_bio_placeholder")}
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, width: "100%", justifyContent: "center" }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  height: 44,
                  padding: "0 28px",
                  borderRadius: 12,
                  border: "1px solid #333",
                  background: "#1e293b",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                {t("edit_profile")}
              </button>
              <div style={{
                height: 44,
                padding: "0 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                color: "#D4AF37",
                fontSize: 14,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <span>🪙</span>
                <span>{currentUser.coins}</span>
              </div>
            </div>
          </>
        ) : (
          /* Edit Mode */
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>Nom d'affichage</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  borderRadius: 12,
                  border: "1px solid #333",
                  padding: "14px",
                  fontSize: 14,
                  background: "#121212",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>URL Photo</label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={{
                  borderRadius: 12,
                  border: "1px solid #333",
                  padding: "14px",
                  fontSize: 14,
                  background: "#121212",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  borderRadius: 12,
                  border: "1px solid #333",
                  padding: "14px",
                  minHeight: 100,
                  fontSize: 14,
                  background: "#121212",
                  color: "#fff",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(45deg, #D4AF37, #b8860b)",
                  color: "#000",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {t("save")}
              </button>

              <button
                onClick={() => setEditing(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 12,
                  border: "1px solid #333",
                  background: "transparent",
                  color: "#ccc",
                  fontSize: 14,
                  cursor: "pointer"
                }}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid Content */}
      <div style={{ padding: 2, minHeight: 300 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          {myPosts.map((p) => (
            <div
              key={p.id}
              style={{
                position: "relative",
                paddingBottom: "100%", // 1:1 Aspect Ratio
                overflow: "hidden",
                background: "#1e293b",
                cursor: "pointer"
              }}
            >
              {p.type === "photo" ? (
                <img
                  src={p.mediaUrl}
                  alt={p.caption}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s"
                  }}
                />
              ) : (
                <>
                  <video
                    src={p.mediaUrl}
                    muted
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      fontSize: 12,
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                    }}
                  >
                    🎥
                  </div>
                </>
              )}
            </div>
          ))}

          {myPosts.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", opacity: 0.6, fontSize: 14, color: "#D4AF37" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
              Poste de quoi pour remplir ton profil! 🔥
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "32px 0 16px 0", opacity: 0.5, fontSize: 10, color: "#9ca3af" }}>
        <p style={{ margin: 0 }}>Propulsé par <span style={{ color: "#D4AF37", fontWeight: "bold" }}>Nano Banana 🍌</span></p>
      </div>
    </div>
  );
};

export default Profile;
