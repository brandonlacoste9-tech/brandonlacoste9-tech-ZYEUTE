
import React, { useEffect, useRef, useState } from "react";
import { Post, User, Comment } from "../types";

interface FeedItemProps {
  post: Post;
  author: User;
  currentUser: User;
  comments: Comment[];
  isFollowingAuthor: boolean;
  isOwnPost: boolean;
  t: (key: string) => string;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onToggleFollow: (userId: string) => void;
}

const FeedItem: React.FC<FeedItemProps> = ({
  post,
  author,
  currentUser,
  comments,
  isFollowingAuthor,
  isOwnPost,
  t,
  onToggleLike,
  onAddComment,
  onToggleFollow,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const isLiked = post.likeUserIds.includes(currentUser.id);

  const handleTogglePlay = () => {
    if (post.type !== "video" || !videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleLike = () => {
    onToggleLike(post.id);
    if (!isLiked) {
      setHeartBurst(true);
    }
  };

  const handleShare = () => {
      alert("Lien copié! 🔗");
  };

  const handleGift = () => {
      alert(t("gift_sent"));
  };

  useEffect(() => {
    if (!heartBurst) return;
    const timer = setTimeout(() => setHeartBurst(false), 400);
    return () => clearTimeout(timer);
  }, [heartBurst]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText("");
    setShowComments(true);
  };

  return (
    <article
      style={{
        background: "#121212",
        borderRadius: 16,
        padding: 12,
        marginBottom: 24,
        border: "1px solid #2a2a2a",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* User Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div style={{ position: "relative" }}>
           <img
            src={author.avatarUrl}
            alt={author.displayName}
            style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                border: author.isLive ? "2px solid #ef4444" : "1px solid #D4AF37",
            }}
           />
           {author.isLive && (
               <div style={{
                   position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                   background: "#ef4444", color: "#fff", fontSize: 8, padding: "1px 4px", borderRadius: 4, fontWeight: "bold"
               }}>LIVE</div>
           )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 4 }}>
            {author.displayName}
            {author.isVerified && (
               <span title="Compte Certifié QC" style={{ fontSize: 14 }}>⚜️</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
              @{author.username} • {author.city}
          </div>
        </div>

        {!isOwnPost && (
          <button
            onClick={() => onToggleFollow(author.id)}
            style={{
              borderRadius: 4,
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              background: isFollowingAuthor ? "transparent" : "linear-gradient(45deg, #D4AF37, #C5A028)",
              border: isFollowingAuthor ? "1px solid #444" : "none",
              color: isFollowingAuthor ? "#94a3b8" : "#000",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            {isFollowingAuthor ? t("unfollow") : t("follow")}
          </button>
        )}
      </header>

      {/* Media */}
      <div
        style={{
          position: "relative",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 12,
          background: "#000",
          border: "1px solid #222",
        }}
        onDoubleClick={handleLike}
        onClick={post.type === "video" ? handleTogglePlay : undefined}
      >
        {post.type === "photo" ? (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            style={{
              width: "100%",
              maxHeight: 480,
              objectFit: "cover",
              display: "block",
              filter: post.filter || "none"
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={post.mediaUrl}
            style={{
              width: "100%",
              maxHeight: 520,
              objectFit: "cover",
              display: "block",
              filter: post.filter || "none"
            }}
            loop
            muted={false}
            playsInline
          />
        )}

        {/* Heart animation - FIRE for Malade */}
        {heartBurst && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 80,
                animation: "like-bounce 0.4s ease-out",
                filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))",
              }}
            >
              🔥
            </div>
          </div>
        )}

        {/* Play badge */}
        {post.type === "video" && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              padding: "6px 10px",
              borderRadius: 4,
              fontSize: 11,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              color: "#D4AF37",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
              border: "1px solid rgba(212, 175, 55, 0.3)"
            }}
          >
            <span>{isPlaying ? "⏸" : "▶️"}</span>
          </div>
        )}
        
        {/* Music Track (TikTok Style) */}
        <div style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            right: 80, // Space for play button
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(0,0,0,0.4)",
            padding: "4px 8px",
            borderRadius: 999,
            backdropFilter: "blur(2px)",
            border: "1px solid rgba(255,255,255,0.1)"
        }}>
            <span style={{ fontSize: 12 }}>🎵</span>
            <div style={{ overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                <div style={{ 
                    fontSize: 11, 
                    color: "#fff", 
                    display: "inline-block",
                }}>
                    {post.musicTrack || t("music_original")}
                </div>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
            <button
            onClick={handleLike}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: "transparent",
                color: isLiked ? "#D4AF37" : "#e2e8f0",
                transition: "all 0.2s",
            }}
            >
            <span style={{ fontSize: 22 }}>{isLiked ? "🔥" : "🤍"}</span>
            <span style={{ fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
                {isLiked ? t("like") : "Malade"}
            </span>
            </button>

            <button
            onClick={() => setShowComments((v) => !v)}
            style={{
                border: "none",
                padding: 0,
                background: "transparent",
                color: "#e2e8f0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
            }}
            >
            <span style={{ fontSize: 20 }}>🗣️</span>
            <span style={{ fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>{t("comment")}</span>
            </button>

            <button
            onClick={handleGift}
            style={{
                border: "none",
                padding: 0,
                background: "transparent",
                color: "#e2e8f0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
            }}
            title={t("gift")}
            >
            <span style={{ fontSize: 20 }}>🎁</span>
            </button>
        </div>

        <button
          onClick={handleShare}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 20
          }}
          title={t("share")}
        >
          📤
        </button>
      </div>

      {/* Gemini Intelligence Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{
          background: "linear-gradient(to right, #3b82f6, #a855f7)",
          fontSize: 10,
          color: "white",
          padding: "2px 8px",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontWeight: 600
        }}>
          {/* Sparkles Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>
          <span>Gemini Intelligence</span>
        </div>
      </div>

      {/* Caption */}
      <p
        style={{
          fontSize: 14,
          marginBottom: 12,
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
          color: "#e2e8f0",
        }}
      >
        <strong style={{ marginRight: 6, color: "#D4AF37" }}>{author.username}</strong>
        {highlightHashtags(post.caption)}
      </p>

      {/* Comments */}
      {showComments && (
        <div
          style={{
            marginTop: 8,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 12,
          }}
        >
          <div
            style={{
              maxHeight: 150,
              overflowY: "auto",
              marginBottom: 8,
            }}
          >
            {comments.map((c) => (
              <div key={c.id} style={{ fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>
                <strong style={{ color: "#D4AF37", fontSize: 12 }}>
                  {c.userId === currentUser.id ? "Moi" : author.username}
                </strong>{" "}
                <span style={{ color: "#cbd5e1" }}>{c.text}</span>
              </div>
            ))}
            {comments.length === 0 && (
              <div style={{ fontSize: 12, opacity: 0.5, fontStyle: "italic" }}>
                {t("no_comments")}
              </div>
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleSubmitComment} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t("add_comment_placeholder")}
              style={{
                flex: 1,
                borderRadius: 4,
                border: "1px solid #333",
                padding: "8px 12px",
                fontSize: 13,
                background: "#000",
                color: "#f1f5f9",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              style={{
                background: "transparent",
                border: "none",
                color: commentText.trim() ? "#D4AF37" : "#475569",
                fontWeight: 600,
                cursor: commentText.trim() ? "pointer" : "default",
              }}
            >
              {t("send")}
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

// Fixed regex to handle French accents
function highlightHashtags(text: string): React.ReactNode {
  const parts = text.split(/(#[a-zA-Z0-9_\u00C0-\u00FF]+)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("#")) {
      return (
        <span key={idx} style={{ color: "#D4AF37", fontWeight: 600 }}>
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export default FeedItem;
