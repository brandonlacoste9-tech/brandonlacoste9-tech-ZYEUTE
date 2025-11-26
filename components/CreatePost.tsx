import React, { useState } from "react";
import { Post, User, PostType, Song } from "../types";
import { DEMO_SONGS } from "../constants";
import { generateCaption, editImageWithGemini, generateHashtags } from "../services/geminiService";

interface CreatePostProps {
  currentUser: User;
  t: (key: string) => string;
  onCreatePost: (post: Post) => void;
}

const FILTERS = [
  { id: "none", name: "filter_none", style: "none" },
  { id: "vintage", name: "filter_vintage", style: "sepia(0.4) contrast(1.2)" },
  { id: "bw", name: "filter_bw", style: "grayscale(100%)" },
  { id: "poutine", name: "filter_poutine", style: "saturate(1.5) contrast(1.1)" },
  { id: "vhs", name: "filter_vhs", style: "contrast(1.2) saturate(1.3) sepia(0.3) hue-rotate(-15deg)" },
  { id: "glitch", name: "filter_glitch", style: "contrast(1.5) saturate(2) hue-rotate(180deg) invert(0.1)" },
  { id: "noir", name: "filter_noir", style: "grayscale(1) contrast(1.2) brightness(0.9)" },
];

const CreatePost: React.FC<CreatePostProps> = ({
  currentUser,
  t,
  onCreatePost,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongSelector, setShowSongSelector] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Editing State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isEditingAi, setIsEditingAi] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
    setCaption("");
    setAiPrompt("");
  };

  const handleGenerateCaption = async () => {
    if (!file) return;
    setIsGenerating(true);
    try {
      const generatedText = await generateCaption(file);
      setCaption(prev => (prev ? prev + "\n" + generatedText : generatedText));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!file) return;
    setIsGenerating(true);
    try {
      const hashtags = await generateHashtags(file);
      setCaption(prev => (prev ? prev + " " + hashtags : hashtags));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiEdit = async () => {
    if (!file || !aiPrompt.trim()) return;
    setIsEditingAi(true);
    try {
      const editedFile = await editImageWithGemini(file, aiPrompt);
      if (editedFile) {
        setFile(editedFile);
        setFileUrl(URL.createObjectURL(editedFile));
        setAiPrompt(""); // Clear prompt on success
      }
    } catch (error) {
      console.error("AI Edit failed", error);
      alert("Erreur lors de la modification IA. Réessayez.");
    } finally {
      setIsEditingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsPosting(true);
    try {
      const type: PostType = file.type.startsWith("video/")
        ? "video"
        : "photo";

      let finalCaption = caption.trim();
      if (!finalCaption) {
        finalCaption = await generateCaption(file);
      }

      const newPost: Post = {
        id: `p_${Date.now()}`,
        userId: currentUser.id,
        type,
        mediaUrl: fileUrl,
        caption: finalCaption,
        createdAt: Date.now(),
        likeUserIds: [],
        filter: selectedFilter.style,
        musicTrack: selectedSong ? `${selectedSong.artist} - ${selectedSong.title}` : undefined
      };

      onCreatePost(newPost);
      setCaption("");
      setFile(null);
      setFileUrl("");
      setSelectedFilter(FILTERS[0]);
      setSelectedSong(null);
      setAiPrompt("");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h2 style={{ fontSize: 20, margin: "0 0 10px 0", color: "#D4AF37", fontFamily: "sans-serif", letterSpacing: "1px" }}>{t("create")}</h2>

      {!file ? (
        <div style={{
            border: "1px dashed #D4AF37",
            borderRadius: 8,
            padding: 40,
            textAlign: "center",
            background: "rgba(212, 175, 55, 0.05)"
        }}>
          <label style={{ 
              display: "block", 
              cursor: "pointer", 
              fontSize: 14, 
              color: "#D4AF37", 
              fontWeight: 600
          }}>
            {t("upload_media").toUpperCase()}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Media Preview */}
          <div style={{ 
            position: "relative", 
            borderRadius: 8, 
            overflow: "hidden", 
            background: "#000",
            maxHeight: 320,
            display: "flex",
            justifyContent: "center"
          }}>
            {file.type.startsWith("video/") ? (
               <video 
                 src={fileUrl} 
                 style={{ maxWidth: "100%", maxHeight: 320, filter: selectedFilter.style }} 
                 controls 
               />
            ) : (
               <img 
                 src={fileUrl} 
                 style={{ maxWidth: "100%", maxHeight: 320, filter: selectedFilter.style }} 
               />
            )}
            <button
               type="button"
               onClick={() => { setFile(null); setFileUrl(""); }}
               style={{
                 position: "absolute", top: 10, right: 10,
                 background: "rgba(0,0,0,0.6)", color: "#fff",
                 border: "none", borderRadius: "50%",
                 width: 30, height: 30, cursor: "pointer"
               }}
            >✕</button>
            
            {/* Loading Overlay for AI */}
            {isEditingAi && (
               <div style={{
                 position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)",
                 display: "flex", alignItems: "center", justifyContent: "center",
                 flexDirection: "column", color: "#D4AF37", gap: 8
               }}>
                 <div style={{fontSize: 24}}>✨</div>
                 <div style={{fontSize: 12, fontWeight: "bold"}}>{t("generating")}</div>
               </div>
            )}
          </div>

          {/* AI Magic Edit (Images Only) */}
          {!file.type.startsWith("video/") && (
            <div style={{
              background: "linear-gradient(90deg, rgba(212, 175, 55, 0.1), rgba(0,0,0,0))",
              padding: 12, borderRadius: 8, border: "1px solid rgba(212, 175, 55, 0.3)"
            }}>
               <label style={{ fontSize: 12, color: "#D4AF37", fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}>
                 ⚡ {t("ai_edit_label")} <span style={{fontSize: 9, opacity: 0.7}}>(Gemini 2.5 Flash Image)</span>
               </label>
               <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                 <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={t("ai_edit_placeholder")}
                    style={{
                      flex: 1, borderRadius: 4, border: "1px solid #333", background: "#000",
                      color: "#fff", padding: "8px", fontSize: 13
                    }}
                 />
                 <button
                    type="button"
                    onClick={handleAiEdit}
                    disabled={isEditingAi || !aiPrompt.trim()}
                    style={{
                      background: "#D4AF37", color: "#000", border: "none", borderRadius: 4,
                      padding: "0 12px", fontWeight: "bold", cursor: !aiPrompt.trim() ? "default" : "pointer",
                      opacity: !aiPrompt.trim() ? 0.5 : 1
                    }}
                 >
                   GO
                 </button>
               </div>
            </div>
          )}

          {/* Sound Selector */}
          <div style={{ position: "relative" }}>
             <button 
               type="button" 
               onClick={() => setShowSongSelector(!showSongSelector)}
               style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  background: "#121212",
                  border: "1px solid #333",
                  color: selectedSong ? "#D4AF37" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer"
               }}
             >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  🎵 {selectedSong ? `${selectedSong.title} - ${selectedSong.artist}` : t("add_sound")}
                </span>
                <span>{showSongSelector ? "▲" : "▼"}</span>
             </button>
             
             {showSongSelector && (
               <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#1e1e1e",
                  zIndex: 10,
                  borderRadius: 8,
                  border: "1px solid #444",
                  marginTop: 4,
                  maxHeight: 200,
                  overflowY: "auto"
               }}>
                  <div 
                    onClick={() => { setSelectedSong(null); setShowSongSelector(false); }}
                    style={{ padding: "10px", borderBottom: "1px solid #333", cursor: "pointer", color: "#999" }}
                  >
                     🚫 Aucun son
                  </div>
                  {DEMO_SONGS.map(song => (
                    <div 
                       key={song.id}
                       onClick={() => { setSelectedSong(song); setShowSongSelector(false); }}
                       style={{ padding: "10px", borderBottom: "1px solid #333", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                    >
                       <img src={song.coverUrl} style={{ width: 32, height: 32, borderRadius: 4 }} />
                       <div>
                         <div style={{ fontSize: 13, fontWeight: "bold" }}>{song.title}</div>
                         <div style={{ fontSize: 11, color: "#ccc" }}>{song.artist}</div>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {/* Filters */}
          <div>
             <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, display: "block" }}>FILTRES</label>
             <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
               {FILTERS.map(f => (
                 <button
                   key={f.id}
                   type="button"
                   onClick={() => setSelectedFilter(f)}
                   style={{
                     flex: "0 0 auto",
                     padding: "8px 16px",
                     borderRadius: 20,
                     border: selectedFilter.id === f.id ? "1px solid #D4AF37" : "1px solid #333",
                     background: selectedFilter.id === f.id ? "rgba(212, 175, 55, 0.2)" : "#121212",
                     color: selectedFilter.id === f.id ? "#D4AF37" : "#ccc",
                     fontSize: 12,
                     cursor: "pointer"
                   }}
                 >
                   {t(f.name)}
                 </button>
               ))}
             </div>
          </div>

          {/* Caption Area with Ti-Guy Button */}
          <div style={{ position: "relative" }}>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("caption_placeholder")}
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #333",
                padding: "14px 48px 14px 14px", // Extra padding right for button
                minHeight: 100,
                background: "#121212",
                color: "#e5e7eb",
                fontSize: 14,
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
            />
            {/* The Ti-Guy Magic Button */}
            <button
              type="button"
              onClick={handleGenerateCaption}
              disabled={isGenerating}
              title="Demander à Ti-Guy (IA)"
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, #C6934B, #F3C982)",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isGenerating ? "default" : "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                transition: "transform 0.2s"
              }}
            >
               {isGenerating ? (
                 <span style={{ animation: "spin 1s linear infinite", display: "block", width: 14, height: 14, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%" }}></span>
               ) : (
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 2L9.91 8.26L3.66 10.34L9.91 12.42L12 18.68L14.09 12.42L20.34 10.34L14.09 8.26L12 2Z" />
                   <path d="M19 16L17.75 19.75L14 21L17.75 22.25L19 26L20.25 22.25L24 21L20.25 19.75L19 16Z" transform="translate(-4 -4) scale(0.8)" opacity="0.7"/>
                 </svg>
               )}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
             <button
              type="button"
              onClick={handleGenerateHashtags}
              disabled={isGenerating}
              style={{
                background: "transparent",
                border: "1px solid #475569",
                borderRadius: 4,
                padding: "6px 14px",
                color: "#94a3b8",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: isGenerating ? 0.7 : 1,
              }}
            >
               #️⃣ Hashtags
            </button>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

          <button
            type="submit"
            disabled={isPosting}
            style={{
              borderRadius: 4,
              border: "none",
              padding: "14px 20px",
              background: "linear-gradient(45deg, #D4AF37, #b8860b)",
              color: "#000",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginTop: 8
            }}
          >
            {isPosting ? t("posting") : t("post")}
          </button>
        </div>
      )}
    </form>
  );
};

export default CreatePost;