
import React, { useState } from "react";
import FeedItem from "./components/FeedItem";
import CreatePost from "./components/CreatePost";
import Profile from "./components/Profile";
import NavButton from "./components/NavButton";
import Inbox from "./components/Inbox";
import Discover from "./components/Discover";
import LiveOverlay from "./components/LiveOverlay";
import { DEMO_POSTS, DEMO_USERS, DEMO_COMMENTS, DEMO_FOLLOWS, DEMO_NOTIFICATIONS, DEMO_MESSAGES, TRANSLATIONS, CURRENT_USER_ID } from "./constants";
import { Post, User, Comment, Follow } from "./types";

const App: React.FC = () => {
  const [tab, setTab] = useState<"feed" | "discover" | "create" | "inbox" | "profile">("feed");
  const [feedType, setFeedType] = useState<"foryou" | "following">("foryou");
  
  // State for data
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS);
  const [follows, setFollows] = useState<Follow[]>(DEMO_FOLLOWS);
  
  // State for infinite scroll
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // State for Live Stream
  const [activeLiveUser, setActiveLiveUser] = useState<User | null>(null);

  const currentUser = users.find((u) => u.id === CURRENT_USER_ID) || users[0];

  const t = (key: string) => TRANSLATIONS[key]?.fr || key; // Default to French

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (tab !== "feed") return;
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    
    // Trigger load more when near bottom (150px threshold)
    if (scrollHeight - scrollTop <= clientHeight + 150) {
      loadMorePosts();
    }
  };

  const loadMorePosts = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    // Simulate network delay and fetch
    setTimeout(() => {
      const newPosts = Array.from({ length: 3 }).map((_, i) => {
        const randomSourcePost = DEMO_POSTS[Math.floor(Math.random() * DEMO_POSTS.length)];
        return {
          ...randomSourcePost,
          id: `p_more_${Date.now()}_${i}`,
          createdAt: Date.now() - Math.floor(Math.random() * 10000000),
          caption: randomSourcePost.caption + (Math.random() > 0.5 ? " 🔥" : " ⚜️"),
          likeUserIds: [], // New posts start with 0 likes
        };
      });

      setPosts((prev) => [...prev, ...newPosts]);
      setIsLoadingMore(false);
    }, 1500);
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const isLiked = p.likeUserIds.includes(currentUser.id);
        return {
          ...p,
          likeUserIds: isLiked
            ? p.likeUserIds.filter((id) => id !== currentUser.id)
            : [...p.likeUserIds, currentUser.id],
        };
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      postId,
      userId: currentUser.id,
      text,
      createdAt: Date.now(),
    };
    setComments((prev) => [...prev, newComment]);
  };

  const handleToggleFollow = (userId: string) => {
    const isFollowing = follows.some(
      (f) => f.followerId === currentUser.id && f.followingId === userId
    );
    if (isFollowing) {
      setFollows((prev) =>
        prev.filter(
          (f) => !(f.followerId === currentUser.id && f.followingId === userId)
        )
      );
    } else {
      setFollows((prev) => [
        ...prev,
        { followerId: currentUser.id, followingId: userId },
      ]);
    }
  };

  const handleCreatePost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setTab("feed");
    setFeedType("foryou"); 
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  // Filter posts logic
  const filteredPosts = posts.filter(p => {
    if (feedType === "foryou") return true;
    const isFollowing = follows.some(f => f.followerId === currentUser.id && f.followingId === p.userId);
    const isMe = p.userId === currentUser.id;
    return isFollowing || isMe;
  });

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#050505",
        color: "#e5e7eb",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <header
        style={{
          padding: "12px 16px",
          background: "rgba(5, 5, 5, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
           {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24,
              height: 24,
              border: "2px dashed #D4AF37",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
               <div style={{ 
                 width: 0, 
                 height: 0, 
                 borderTop: "5px solid transparent",
                 borderBottom: "5px solid transparent",
                 borderLeft: "8px solid #D4AF37",
                 marginLeft: 2
               }} />
            </div>
            <strong
              style={{
                background: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: 20,
                fontFamily: "sans-serif",
                letterSpacing: "4px",
                fontWeight: 800
              }}
            >
              ZYEUTÉ
            </strong>
          </div>
          
          {/* Feed Toggles */}
          {tab === "feed" && (
            <div style={{ display: "flex", gap: 16, fontSize: 15, fontWeight: 700 }}>
               <button 
                  onClick={() => setFeedType("following")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: feedType === "following" ? "#fff" : "#666",
                    cursor: "pointer",
                    padding: 0,
                    transition: "color 0.2s"
                  }}
               >
                 {t("following_feed")}
               </button>
               <div style={{ width: 1, background: "#333", height: 14, alignSelf: "center" }} />
               <button 
                  onClick={() => setFeedType("foryou")}
                  style={{
                     background: "transparent",
                     border: "none",
                     color: feedType === "foryou" ? "#fff" : "#666",
                     cursor: "pointer",
                     padding: 0,
                     transition: "color 0.2s"
                  }}
               >
                 {t("foryou")}
               </button>
            </div>
          )}
          
          {tab !== "feed" && (
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
               {t(tab)}
            </div>
          )}

          <div style={{ width: 24 }} />
        </div>
      </header>

      <main
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 0 40px 0",
          scrollbarWidth: "none",
        }}
      >
        {tab === "feed" && (
          <>
            {/* Stories / Statuts Bar */}
            <div style={{ 
              display: "flex", 
              gap: 12, 
              padding: "12px 12px 16px 12px", 
              overflowX: "auto",
              scrollbarWidth: "none",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              marginBottom: 8
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 64 }}>
                <div style={{ position: "relative" }}>
                   <img 
                      src={currentUser.avatarUrl} 
                      style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid #333", opacity: 0.8 }} 
                   />
                   <div style={{
                     position: "absolute", bottom: 0, right: 0,
                     background: "#D4AF37", width: 20, height: 20,
                     borderRadius: "50%", display: "flex", alignItems: "center",
                     justifyContent: "center", border: "2px solid #000",
                     color: "#000", fontSize: 16, fontWeight: "bold"
                   }}>+</div>
                </div>
                <span style={{ fontSize: 11, color: "#999" }}>Toi</span>
              </div>
              
              {users.filter(u => u.id !== currentUser.id).map(user => (
                <div 
                  key={user.id} 
                  onClick={() => {
                    if (user.isLive) {
                       setActiveLiveUser(user);
                    }
                  }}
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    gap: 6, 
                    minWidth: 64,
                    cursor: user.isLive ? "pointer" : "default" 
                  }}
                >
                  <div style={{ 
                     padding: 3, 
                     borderRadius: "50%", 
                     background: user.isLive 
                        ? "linear-gradient(45deg, #ef4444, #f87171)" 
                        : "linear-gradient(45deg, #D4AF37, #b38728)",
                     animation: user.isLive ? "pulse-border 2s infinite" : "none"
                  }}>
                    <img 
                        src={user.avatarUrl} 
                        style={{ 
                          width: 56, height: 56, 
                          borderRadius: "50%", 
                          border: "2px solid #000", 
                          display: "block" 
                        }} 
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "#ccc", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.username}
                  </span>
                  {user.isLive && <span style={{fontSize: 8, background: "#ef4444", color: "white", padding: "1px 4px", borderRadius: 4, marginTop: -4, zIndex: 1}}>LIVE</span>}
                </div>
              ))}
            </div>

            {/* Posts List */}
            <div style={{ padding: "0 12px" }}>
              {filteredPosts.length > 0 ? filteredPosts.map((post) => {
                const author = users.find((u) => u.id === post.userId) || users[0];
                const postComments = comments.filter((c) => c.postId === post.id);
                const isFollowing = follows.some(
                  (f) => f.followerId === currentUser.id && f.followingId === author.id
                );
                return (
                  <FeedItem
                    key={post.id}
                    post={post}
                    author={author}
                    currentUser={currentUser}
                    comments={postComments}
                    isFollowingAuthor={isFollowing}
                    isOwnPost={author.id === currentUser.id}
                    t={t}
                    onToggleLike={handleToggleLike}
                    onAddComment={handleAddComment}
                    onToggleFollow={handleToggleFollow}
                  />
                );
              }) : (
                 <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
                   <div style={{ fontSize: 40, marginBottom: 10 }}>🕸️</div>
                   {t("no_posts_yet")} <br/> 
                   {feedType === "following" && "Abonne-toi à du monde!"}
                 </div>
              )}
              
              <div style={{ padding: 20, textAlign: "center", opacity: 0.7 }}>
                {isLoadingMore ? (
                  <span style={{ animation: "pulse 1s infinite", color: "#D4AF37", fontWeight: 600 }}>CHARGEMENT... ⚜️</span>
                ) : (
                  <span style={{ fontSize: 12, color: "#64748b" }}>C'est toute pour l'instant!</span>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "discover" && <Discover t={t} />}

        {tab === "create" && (
          <CreatePost
            currentUser={currentUser}
            t={t}
            onCreatePost={handleCreatePost}
          />
        )}

        {tab === "inbox" && (
          <Inbox 
            currentUser={currentUser}
            users={users}
            notifications={DEMO_NOTIFICATIONS}
            messages={DEMO_MESSAGES}
            t={t}
          />
        )}

        {tab === "profile" && (
          <Profile
            currentUser={currentUser}
            users={users}
            posts={posts}
            follows={follows}
            t={t}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      <nav
        style={{
          display: "flex",
          background: "#0a0a0a",
          borderTop: "1px solid rgba(212, 175, 55, 0.2)",
          paddingBottom: "safe-area-inset-bottom",
        }}
      >
        <NavButton
          label={t("feed")}
          icon="🏠"
          active={tab === "feed"}
          onClick={() => setTab("feed")}
        />
        <NavButton
          label={t("discover")}
          icon="🔍"
          active={tab === "discover"}
          onClick={() => setTab("discover")}
        />
        <NavButton
          label=""
          icon="➕"
          active={tab === "create"}
          onClick={() => setTab("create")}
          isCenter
        />
        <NavButton
          label={t("inbox")}
          icon="💬"
          active={tab === "inbox"}
          onClick={() => setTab("inbox")}
        />
        <NavButton
          label={t("profile")}
          icon="👤"
          active={tab === "profile"}
          onClick={() => setTab("profile")}
        />
      </nav>
      
      {/* Live Overlay */}
      {activeLiveUser && (
        <LiveOverlay 
          username={activeLiveUser.username} 
          onClose={() => setActiveLiveUser(null)} 
        />
      )}

      <style>
        {`
          @keyframes like-bounce {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
          }
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
          @keyframes pulse-border {
             0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
             70% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
             100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}
      </style>
    </div>
  );
};

export default App;
