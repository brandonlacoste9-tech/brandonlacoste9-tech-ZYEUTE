
import React, { useState } from "react";
import { User, Notification, Message } from "../types";

interface InboxProps {
  currentUser: User;
  users: User[];
  notifications: Notification[];
  messages: Message[];
  t: (key: string) => string;
}

const Inbox: React.FC<InboxProps> = ({ currentUser, users, notifications, messages, t }) => {
  const [activeTab, setActiveTab] = useState<"notifications" | "messages">("notifications");

  const getUser = (id: string) => users.find(u => u.id === id) || users[0];

  const getNotifText = (type: string) => {
    switch (type) {
      case "like": return t("notif_like");
      case "comment": return t("notif_comment");
      case "follow": return t("notif_follow");
      case "gift": return t("notif_gift");
      default: return "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab Switcher */}
      <div style={{ display: "flex", borderBottom: "1px solid #333" }}>
        <button
          onClick={() => setActiveTab("notifications")}
          style={{
            flex: 1,
            padding: 16,
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "notifications" ? "2px solid #D4AF37" : "none",
            color: activeTab === "notifications" ? "#D4AF37" : "#666",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {t("notifications")}
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          style={{
            flex: 1,
            padding: 16,
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "messages" ? "2px solid #D4AF37" : "none",
            color: activeTab === "messages" ? "#D4AF37" : "#666",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {t("messages")}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {activeTab === "notifications" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {notifications.map(notif => {
              const actor = getUser(notif.actorId);
              return (
                <div key={notif.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <img src={actor.avatarUrl} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                    <div style={{ 
                      position: "absolute", bottom: 0, right: 0, 
                      fontSize: 12, background: "#000", borderRadius: "50%", width: 20, height: 20,
                      display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #333"
                    }}>
                      {notif.type === "like" && "❤️"}
                      {notif.type === "comment" && "💬"}
                      {notif.type === "follow" && "➕"}
                      {notif.type === "gift" && "🎁"}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14 }}>
                      <strong>{actor.username}</strong> <span style={{ color: "#ccc" }}>{getNotifText(notif.type)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>il y a {Math.floor((Date.now() - notif.createdAt) / 60000)} min</div>
                  </div>
                  {!notif.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4AF37" }} />}
                </div>
              );
            })}
            {notifications.length === 0 && <div style={{textAlign: "center", color: "#666", marginTop: 40}}>Rien à signaler chef! 🫡</div>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map(msg => {
              const otherUser = getUser(msg.fromId === currentUser.id ? msg.toId : msg.fromId);
              return (
                <div key={msg.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={otherUser.avatarUrl} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: "bold" }}>{otherUser.displayName}</div>
                    <div style={{ fontSize: 13, color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {msg.fromId === currentUser.id && "Toi: "} {msg.text}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>2h</div>
                </div>
              );
            })}
             {messages.length === 0 && <div style={{textAlign: "center", color: "#666", marginTop: 40}}>Ta boîte est vide 🕸️</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
