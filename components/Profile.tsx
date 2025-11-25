
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
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-start" }}>
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.displayName}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #D4AF37"
          }}
        />

        <div style={{ flex: 1 }}>
          {!editing ? (
            <>
              <h2 style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                {currentUser.displayName}
                {currentUser.isVerified && <span title="Certifié QC">⚜️</span>}
              </h2>

              <div style={{ fontSize: 13, color: "#D4AF37", marginBottom: 12 }}>
                @{currentUser.username} · {currentUser.city}
              </div>

              <p style={{ fontSize: 14, margin: "0 0 12px 0", whiteSpace: "pre-wrap", lineHeight: 1.4, color: "#ccc" }}>
                {currentUser.bio || t("your_bio_placeholder")}
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={() => setEditing(true)}
                    style={{
                    borderRadius: 4,
                    border: "1px solid #444",
                    padding: "6px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    background: "transparent",
                    color: "#e5e7eb",
                    cursor: "pointer",
                    textTransform: "uppercase"
                    }}
                >
                    {t("edit_profile")}
                </button>
                <div style={{
                    borderRadius: 4,
                    background: "rgba(212, 175, 55, 0.2)",
                    border: "1px solid #D4AF37",
                    padding: "6px 12px",
                    fontSize: 12,
                    color: "#D4AF37",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                }}>
                    🪙 {currentUser.coins} {t("coins")}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nom d’affichage"
                  style={{
                    borderRadius: 4,
                    border: "1px solid #333",
                    padding: "8px 12px",
                    fontSize: 13,
                    background: "#121212",
                    color: "#e5e7eb",
                    outline: "none"
                  }}
                />

                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="URL de la photo de profil"
                  style={{
                    borderRadius: 4,
                    border: "1px solid #333",
                    padding: "8px 12px",
                    fontSize: 13,
                    background: "#121212",
                    color: "#e5e7eb",
                    outline: "none"
                  }}
                />

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("your_bio_placeholder")}
                  style={{
                    borderRadius: 4,
                    border: "1px solid #333",
                    padding: "10px",
                    minHeight: 72,
                    fontSize: 13,
                    background: "#121212",
                    color: "#e5e7eb",
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  onClick={handleSave}
                  style={{
                    borderRadius: 4,
                    border: "none",
                    padding: "6px 16px",
                    background: "#D4AF37",
                    color: "#000",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "uppercase"
                  }}
                >
                  {t("save")}
                </button>

                <button
                  onClick={() => setEditing(false)}
                  style={{
                    borderRadius: 4,
                    border: "1px solid #444",
                    padding: "6px 16px",
                    background: "transparent",
                    color: "#cbd5e1",
                    fontSize: 12,
                    cursor: "pointer",
                    textTransform: "uppercase"
                  }}
                >
                  {t("cancel")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: 20,
          fontSize: 14,
          padding: "16px 0",
          borderTop: "1px solid #222",
          borderBottom: "1px solid #222",
          background: "#0a0a0a"
        }}
      >
        <div style={{textAlign: "center"}}>
          <div style={{fontWeight: 700, fontSize: 18, color: "#fff"}}>{myPosts.length}</div>
          <div style={{color: "#666", fontSize: 11, textTransform: "uppercase", marginTop: 4}}>{t("posts_count")}</div>
        </div>
        <div style={{textAlign: "center"}}>
          <div style={{fontWeight: 700, fontSize: 18, color: "#fff"}}>{followers.length}</div>
          <div style={{color: "#666", fontSize: 11, textTransform: "uppercase", marginTop: 4}}>{t("followers")}</div>
        </div>
        <div style={{textAlign: "center"}}>
          <div style={{fontWeight: 700, fontSize: 18, color: "#fff"}}>{following.length}</div>
          <div style={{color: "#666", fontSize: 11, textTransform: "uppercase", marginTop: 4}}>{t("following")}</div>
        </div>
      </div>

      {/* Grid */}
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
              paddingBottom: "100%",
              overflow: "hidden",
              background: "#1e293b"
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
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, opacity: 0.6, fontSize: 14, color: "#D4AF37" }}>
            Poste de quoi pour remplir ton profil! 🔥
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 24, marginBottom: 8, opacity: 0.5, fontSize: 10, color: "#9ca3af" }}>
        <p style={{ margin: 0 }}>Propulsé par <span style={{ color: "#D4AF37", fontWeight: "bold" }}>Nano Banana 🍌</span></p>
      </div>
    </div>
  );
};

export default Profile;
