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

export const FeedItem: React.FC<FeedItemProps> = ({
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
    setHeartBurst(true);
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
        background: "#020617",
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        border: "1px solid rgba(148,163,184,0.3)",
      }}
    >
      {/* User Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <img
          src={author.avatarUrl}
          alt={author.displayName}
          style={{
            width: 40,
            height: 40,
            borderRadius: "999px",
            objectFit: "cover",
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {author.displayName}{" "}
            <span style={{ opacity: 0.7, fontSize: 12 }}>
              @{author.username}
            </span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{author.city}</div>
        </div>

        {!isOwnPost && (
          <button
            onClick={() => onToggleFollow(author.id)}
            style={{
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              border: "none",
              background: isFollowingAuthor ? "#0f172a" : "#f97316",
              color: isFollowingAuthor ? "#e5e7eb" : "#111827",
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
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 8,
          background: "#020617",
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
            }}
            muted
            playsInline
          />
        )}

        {/* Heart animation */}
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
                fontSize: 64,
                animation: "like-bounce 0.4s ease-out",
              }}
            >
              🤍
            </div>
          </div>
        )}

        {/* Play badge */}
        {post.type === "video" && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 11,
              background: "rgba(15,23,42,0.7)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>{isPlaying ? "⏸" : "▶️"}</span>
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </div>
        )}
      </div>

      {/* Caption */}
      <p
        style={{
          fontSize: 14,
          marginBottom: 8,
          whiteSpace: "pre-wrap",
        }}
      >
        {highlightHashtags(post.caption)}
      </p>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        <button
          onClick={handleLike}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            border: "none",
            padding: "4px 10px",
            background: isLiked ? "#f97316" : "#0f172a",
            color: isLiked ? "#111827" : "#e5e7eb",
          }}
        >
          <span>{isLiked ? "❤️" : "🤍"}</span>
          <span>
            {post.likeUserIds.length} {t("like")}
          </span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          style={{
            borderRadius: 999,
            border: "none",
            padding: "4px 10px",
            background: "#0f172a",
            color: "#e5e7eb",
          }}
        >
          💬 {comments.length} {t("comment")}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div
          style={{
            marginTop: 4,
            borderTop: "1px solid rgba(148,163,184,0.4)",
            paddingTop: 6,
          }}
        >
          <div
            style={{
              maxHeight: 120,
              overflowY: "auto",
              marginBottom: 6,
            }}
          >
            {comments.map((c) => (
              <div key={c.id} style={{ fontSize: 12, marginBottom: 4 }}>
                <strong>{c.userId === currentUser.id ? "toi" : author.username}:</strong>{" "}
                {c.text}
              </div>
            ))}
            {comments.length === 0 && (
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                (aucun commentaire encore)
              </div>
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleSubmitComment}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t("add_comment_placeholder")}
              style={{
                width: "100%",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.5)",
                padding: "6px 10px",
                fontSize: 12,
                background: "#020617",
                color: "#e5e7eb",
              }}
            />
          </form>
        </div>
      )}
    </article>
  );
};

function highlightHashtags(text: string): React.ReactNode {
  const parts = text.split(/(\#[\p{L}\d_]+)/gu);
  return parts.map((part, idx) => {
    if (part.startsWith("#")) {
      return (
        <span key={idx} style={{ color: "#38bdf8" }}>
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}
