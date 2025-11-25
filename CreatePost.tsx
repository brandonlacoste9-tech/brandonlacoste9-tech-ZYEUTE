import React, { useState } from "react";
import { Post, User, PostType } from "../types";
import { generateCaption } from "../services/geminiService";

interface CreatePostProps {
  currentUser: User;
  t: (key: string) => string;
  onCreatePost: (post: Post) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({
  currentUser,
  t,
  onCreatePost,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const handleGenerateCaption = async () => {
    if (!file) return;
    setIsGenerating(true);
    try {
      const generatedText = await generateCaption(file);
      setCaption(generatedText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsPosting(true);
    try {
      const url = URL.createObjectURL(file);
      const type: PostType = file.type.startsWith("video/")
        ? "video"
        : "photo";

      // If user provided no caption, try to generate one automatically before posting
      let finalCaption = caption.trim();
      if (!finalCaption) {
        finalCaption = await generateCaption(file);
      }

      const newPost: Post = {
        id: `p_${Date.now()}`,
        userId: currentUser.id,
        type,
        mediaUrl: url,
        caption: finalCaption,
        createdAt: Date.now(),
        likeUserIds: [],
      };

      onCreatePost(newPost);
      setCaption("");
      setFile(null);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2 style={{ fontSize: 18 }}>{t("create")}</h2>

      <label style={{ fontSize: 13 }}>{t("upload_media")}</label>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        style={{ fontSize: 13 }}
      />

      {file && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleGenerateCaption}
            disabled={isGenerating}
            style={{
              background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
              border: "none",
              borderRadius: 999,
              padding: "4px 12px",
              color: "white",
              fontSize: 11,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              opacity: isGenerating ? 0.7 : 1,
            }}
          >
            {isGenerating ? "⏳..." : "✨ IA Caption"}
          </button>
        </div>
      )}

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={t("caption_placeholder")}
        style={{
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.6)",
          padding: 10,
          minHeight: 80,
          background: "#020617",
          color: "#e5e7eb",
          fontSize: 13,
          resize: "vertical",
        }}
      />

      <button
        type="submit"
        disabled={!file || isPosting}
        style={{
          borderRadius: 999,
          border: "none",
          padding: "8px 14px",
          background: !file ? "rgba(148,163,184,0.3)" : "#f97316",
          color: !file ? "#9ca3af" : "#111827",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {isPosting ? "..." : t("post")}
      </button>
    </form>
  );
};
