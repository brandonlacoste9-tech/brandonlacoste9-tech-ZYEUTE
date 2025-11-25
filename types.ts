
export type Language = "fr" | "en";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  city: string;
  isVerified?: boolean;
  isLive?: boolean;
  coins: number; // Virtual currency balance
}

export interface Follow {
  followerId: string;
  followingId: string;
}

export type PostType = "photo" | "video";

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  mediaUrl: string;
  caption: string;
  createdAt: number;
  likeUserIds: string[];
  musicTrack?: string;
  filter?: string;
  speed?: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: number;
}

export interface Notification {
  id: string;
  userId: string; // Receiver
  type: "like" | "comment" | "follow" | "gift";
  actorId: string; // Who did it
  postId?: string;
  createdAt: number;
  read: boolean;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  createdAt: number;
}

export interface TranslationMap {
  [key: string]: {
    fr: string;
    en: string;
  };
}
