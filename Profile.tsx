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

export const Profile: React.FC<ProfileProps> = ({
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
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.displayName}
          style={{
            width: 72,
            height: 72,
            borderRadius: "999px",
            objectFit: "cover",
          }}
        />

        <div style={{ flex: 1 }}>
          {!editing ? (
            <>
              <h2 style={{ margin: 0, fontSize: 18 }}>
                {currentUser.displayName}
              </h2>

              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
                @{currentUser.username} · {currentUser.city}
              </div>

              <p style={{ fontSize: 13, marginTop: 0, whiteSpace: "pre-wrap" }}>
                {currentUser.bio || t("your_bio_placeholder")}
              </p>

              <button
                onClick={() => setEditing(true)}
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "6px 12px",
                  fontSize: 13,
                  background: "#0f172a",
                  color: "#e5e7eb",
                }}
              >
                {t("edit_profile")}
              </button>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nom d’affichage"
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.6)",
                    padding: "6px 10px",
                    fontSize: 13,
                    background: "#020617",
                    color: "#e5e7eb",
                  }}
                />

                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="URL de la photo de profil"
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.6)",
                    padding: "6px 10px",
                    fontSize: 13,
                    background: "#020617",
                    color: "#e5e7eb",
                  }}
                />

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("your_bio_placeholder")}
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.6)",
                    padding: 10,
                    minHeight: 72,
                    fontSize: 13,
                    background: "#020617",
                    color: "#e5e7eb",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={handleSave}
                  style={{
                    borderRadius: 999,
                    border: "none",
                    padding: "6px 12px",
                    background: "#f97316",
                    color: "#111827",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {t("save")}
                </button>

                <button
                  onClick={() => setEditing(false)}
                  style={{
                    borderRadius: 999,
                    border: "none",
                    padding: "6px 12px",
                    background: "#0f172a",
                    color: "#e5e7eb",
                    fontSize: 13,
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
          gap: 12,
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        <span>
          <strong>{myPosts.length}</strong> posts
        </span>
        <span>
          <strong>{followers.length}</strong> {t("followers")}
        </span>
        <span>
          <strong>{following.length}</strong> {t("following")}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 4,
        }}
      >
        {myPosts.map((p) => (
          <div
            key={p.id}
            style={{
              position: "relative",
              paddingBottom: "100%",
              overflow: "hidden",
              borderRadius: 8,
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
                    bottom: 4,
                    right: 4,
                    fontSize: 11,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.7)",
                  }}
                >
                  ▶
                </div>
              </>
            )}
          </div>
        ))}

        {myPosts.length === 0 && (
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            Poste quelque chose pour remplir ton profil 🔥
          </div>
        )}
      </div>
    </div>
  );
};
