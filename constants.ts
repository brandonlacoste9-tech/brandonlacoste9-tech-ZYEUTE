import { User, Post, Comment, Follow, TranslationMap, Song, Notification, Message } from "./types";

const now = Date.now();
const minutes = (n: number) => n * 60 * 1000;

export const DEMO_USERS: User[] = [
  {
    id: "u1",
    username: "mtl_bouffe",
    displayName: "MTL Bouffe & Vibes",
    avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=poutine",
    bio: "La meilleure poutine à 3h du matin 🍟🧀\n📍 Plateau Mont-Royal",
    city: "Montréal",
    isVerified: true,
    isLive: true,
    coins: 1500,
  },
  {
    id: "u2",
    username: "rando_quebec",
    displayName: "Explo Québec 🌲",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=gaspesie",
    bio: "Amoureux du plein air. Gaspésie, Charlevoix, Laurentides. 🏔️",
    city: "Gaspésie",
    isVerified: true,
    coins: 300,
  },
  {
    id: "u3",
    username: "memes_construction",
    displayName: "Cône Orange",
    avatarUrl: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=cone",
    bio: "Saison officielle du Québec : l'hiver et la construction 🚧❄️",
    city: "Partout au QC",
    isLive: true,
    coins: 50,
  },
  {
    id: "u4",
    username: "vie_de_chateau",
    displayName: "Vieux-Québec",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=quebec",
    bio: "L'histoire et le charme de la Capitale Nationale ⚜️",
    city: "Québec",
    isVerified: true,
    coins: 5000,
  },
];

export const CURRENT_USER_ID = "u1";

export const DEMO_SONGS: Song[] = [
  { id: "s1", title: "Les Étoiles filantes", artist: "Les Cowboys Fringants", coverUrl: "https://placehold.co/40/222/FFF?text=CF", duration: 265 },
  { id: "s2", title: "1990", artist: "Jean Leloup", coverUrl: "https://placehold.co/40/333/FFF?text=JL", duration: 240 },
  { id: "s3", title: "Dégénérations", artist: "Mes Aïeux", coverUrl: "https://placehold.co/40/444/FFF?text=MA", duration: 180 },
  { id: "s4", title: "Fous n'importe où", artist: "Charlotte Cardin", coverUrl: "https://placehold.co/40/555/FFF?text=CC", duration: 210 },
  { id: "s5", title: "Chicoutimi", artist: "Les Colocs", coverUrl: "https://placehold.co/40/666/FFF?text=LC", duration: 200 },
];

export const DEMO_FOLLOWS: Follow[] = [
  { followerId: "u1", followingId: "u2" },
  { followerId: "u1", followingId: "u3" },
  { followerId: "u2", followingId: "u1" },
  { followerId: "u4", followingId: "u1" },
];

export const DEMO_POSTS: Post[] = [
  {
    id: "p1",
    userId: "u3",
    type: "video",
    mediaUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    caption: "On a encore pogné un détour... 🚧 C'est pas mêlant, y'a des cônes partout! #montreal #construction #traffic",
    createdAt: now - minutes(15),
    likeUserIds: ["u1", "u2", "u4"],
    musicTrack: "Les Cowboys Fringants - Les Étoiles filantes",
    filter: "none",
  },
  {
    id: "p2",
    userId: "u1",
    type: "photo",
    mediaUrl:
      "https://images.pexels.com/photos/1580466/pexels-photo-1580466.jpeg?auto=compress&w=800",
    caption: "Une banquise ou de la poutine? 🤔 Sais pas, mais c'est beau pareil. #hiver #quebec #frette",
    createdAt: now - minutes(45),
    likeUserIds: ["u2"],
    musicTrack: "Céline Dion - My Heart Will Go On",
    filter: "contrast(1.2) brightness(1.1)",
  },
  {
    id: "p3",
    userId: "u2",
    type: "photo",
    mediaUrl:
      "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&w=800",
    caption: "Le Rocher Percé ce matin. Y fait pas chaud mais ça vaut la peine! 🌊💙 #gaspesie #roadtrip",
    createdAt: now - minutes(120),
    likeUserIds: ["u1"],
    musicTrack: "La Bottine Souriante - La Ziguezon",
    filter: "sepia(0.4)",
  },
  {
    id: "p4",
    userId: "u4",
    type: "photo",
    mediaUrl:
      "https://images.pexels.com/photos/3342739/pexels-photo-3342739.jpeg?auto=compress&w=800",
    caption: "Petit tour sur la terrasse Dufferin. Le Château est majestueux ce soir 🏰✨ #quebeccity #vieuxquebec",
    createdAt: now - minutes(200),
    likeUserIds: ["u1", "u2", "u3"],
    musicTrack: "Simple Plan - Welcome to My Life",
    filter: "grayscale(100%)",
  },
];

export const DEMO_COMMENTS: Comment[] = [
  {
    id: "c1",
    postId: "p1",
    userId: "u1",
    text: "Ark, j'arrive de là pis j'ai attendu 20 minutes 😤",
    createdAt: now - minutes(10),
  },
  {
    id: "c2",
    postId: "p2",
    userId: "u2",
    text: "Malade la photo! C'est où exactement?",
    createdAt: now - minutes(40),
  },
  {
    id: "c3",
    postId: "p3",
    userId: "u4",
    text: "Faut que j'y retourne cet été, c'est trop beau.",
    createdAt: now - minutes(100),
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "u1", type: "like", actorId: "u2", postId: "p2", createdAt: now - minutes(20), read: false },
  { id: "n2", userId: "u1", type: "comment", actorId: "u2", postId: "p2", createdAt: now - minutes(15), read: false },
  { id: "n3", userId: "u1", type: "follow", actorId: "u3", createdAt: now - minutes(60), read: true },
  { id: "n4", userId: "u1", type: "gift", actorId: "u4", postId: "p2", createdAt: now - minutes(5), read: false },
];

export const DEMO_MESSAGES: Message[] = [
  { id: "m1", fromId: "u2", toId: "u1", text: "Heille salut! On va tu glisser tantôt?", createdAt: now - minutes(120) },
  { id: "m2", fromId: "u4", toId: "u1", text: "T'as vu mon dernier post sur le Château?", createdAt: now - minutes(300) },
];

export const TRANSLATIONS: TranslationMap = {
  feed: { fr: "Fil", en: "Feed" },
  discover: { fr: "Découvrir", en: "Discover" },
  create: { fr: "Créer", en: "Create" },
  inbox: { fr: "Boîte", en: "Inbox" },
  profile: { fr: "Mon Espace", en: "Profile" },
  
  like: { fr: "Malade", en: "Sick" },
  comment: { fr: "Jasette", en: "Chat" },
  share: { fr: "Gosse", en: "Share" },
  add_comment_placeholder: {
    fr: "Dis de quoi...",
    en: "Add a comment...",
  },
  post: { fr: "Publier", en: "Post" },
  posting: { fr: "Envoi en cours...", en: "Posting..." },
  caption_placeholder: {
    fr: "Quessé qui se passe? (Utilise des #)",
    en: "Write a caption...",
  },
  upload_media: {
    fr: "Téléverser photo/vidéo",
    en: "Upload media",
  },
  edit_profile: { fr: "Modifier le profil", en: "Edit profile" },
  save: { fr: "Enregistrer", en: "Save" },
  cancel: { fr: "Annuler", en: "Cancel" },
  followers: { fr: "Abonnés", en: "Followers" },
  following: { fr: "Abonnements", en: "Following" },
  your_bio_placeholder: {
    fr: "Parle-nous de toi... (Ex: Fan du CH 🏒)",
    en: "Introduce yourself...",
  },
  follow: { fr: "S'abonner", en: "Follow" },
  unfollow: { fr: "Désabonner", en: "Unfollow" },
  ia_caption: { fr: "Légende IA ✨", en: "IA Caption" },
  generating: { fr: "Ça pense...", en: "Thinking..." },
  no_comments: { fr: "Pas encore de jasette...", en: "No comments yet" },
  send: { fr: "Envoyer", en: "Send" },
  view_count: { fr: "Vues", en: "Views" },
  posts_count: { fr: "Publis", en: "Posts" },
  foryou: { fr: "Pour toi", en: "For You" },
  following_feed: { fr: "Tes chums", en: "Following" },
  stories: { fr: "Statuts", en: "Stories" },
  music_original: { fr: "Son original", en: "Original sound" },
  gift: { fr: "Cadeau", en: "Gift" },
  gift_sent: { fr: "Cadeau envoyé! 🎁 (-10 cennes)", en: "Gift sent!" },
  filter_none: { fr: "Normal", en: "Normal" },
  filter_vintage: { fr: "Rétro", en: "Vintage" },
  filter_bw: { fr: "Noir & Blanc", en: "B&W" },
  filter_poutine: { fr: "Poutine", en: "Vivid" },
  
  // Discover & Inbox
  search_placeholder: { fr: "Chercher (ex: poutine, hiver)", en: "Search" },
  trending_hashtags: { fr: "Tendances du moment 🔥", en: "Trending" },
  trending_sounds: { fr: "Sons populaires 🎵", en: "Trending Sounds" },
  notifications: { fr: "Quoi de neuf", en: "Notifications" },
  messages: { fr: "Jases", en: "Messages" },
  add_sound: { fr: "Ajouter un son", en: "Add Sound" },
  coins: { fr: "Cennes", en: "Coins" },
  recharge: { fr: "Recharger", en: "Recharge" },
  notif_like: { fr: "a trouvé ta publi malade!", en: "liked your post." },
  notif_comment: { fr: "a jasé sur ta publication.", en: "commented on your post." },
  notif_follow: { fr: "commence à te suivre.", en: "started following you." },
  notif_gift: { fr: "t'a envoyé un cadeau! 🎁", en: "sent you a gift!" },
  
  // AI Features
  ai_edit_label: { fr: "Modif Magique (IA)", en: "Magic Edit (AI)" },
  ai_edit_placeholder: { fr: "Ex: Ajoute un chapeau de cowboy...", en: "Ex: Add a cowboy hat..." }
};