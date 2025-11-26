# 🔥⚜️ ZYEUTÉ - STRATÉGIE DE LANCEMENT ⚜️🔥

## **PHASE 1: PRÉPARATION TECHNIQUE** (2-4 semaines)

### **Infrastructure**
- Frontend: Vercel Edge (optimized for Montreal/Quebec)
- Backend: Supabase (Canada region)
- CDN: Cloudflare with Quebec POP
- AI: Google Gemini API ✅
- Analytics: Plausible (privacy-first)

### **Environment Setup**
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### **Database Schema (Supabase)**
```sql
-- Users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  region TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT[],
  region TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
```

## **PHASE 2: LANCEMENT BÊTA** (4-8 semaines)

### **Week 1-2: Invite-Only Beta (100 utilisateurs)**

**Qui inviter**:
- 20 créateurs de contenu québécois
- 20 étudiants (UdeM, Laval, Concordia)
- 20 artistes locaux
- 20 influenceurs micro (1K-10K followers)
- 20 personnes de différentes régions

**Métriques à suivre**:
- Crashes / bugs critiques
- Temps de chargement
- Taux de rétention J1, J7, J30
- Posts par utilisateur

**Canaux de feedback**:
- Discord privé "Zyeuté Beta Crew"
- Formulaire Google Forms
- Sessions Zoom hebdomadaires

### **Week 3-4: Beta Expansion (1,000 utilisateurs)**

**Marketing**:
- Posts sur Reddit r/Quebec, r/Montreal
- Groupes Facebook québécois
- Stories Instagram des beta users
- Bouche-à-oreille (referral codes)

## **PHASE 3: LANCEMENT PUBLIC** (Semaine de la Saint-Jean!)

### **Timing Stratégique**: 24 juin 2025 (Saint-Jean-Baptiste)
**Pourquoi?**:
- Fierté québécoise au max ⚜️
- Tout le monde est en mode fête
- Média coverage garanti

### **Jour J - Plan d'Exécution**

- **6h00**: Lancement App Store & Google Play
- **9h00**: Communiqué de presse
- **10h00**: Posts coordonnés des 50 créateurs
- **12h00**: Événement live à Montréal
- **18h00**: Live spectacle avec artistes québécois
- **21h00**: Feux d'artifice virtuels dans l'app

### **Marketing Blitz**

**Digital**:
- Reddit: r/Quebec, r/Montreal
- Facebook: Groupes "Spotted:", pages de quartiers
- Instagram: Carousel ads ciblés Québec
- TikTok: Vidéos virales "#ZyeutéÇa"

**Physique**:
- Affiches dans métros Montréal/Québec
- Stickers distribués à la Saint-Jean
- Flyers dans universités, cafés

**Partenariats**:
- Couche-Tard: Codes promo
- BIXI: Publicité sur vélos
- Festival Osheaga: Présence

## **PHASE 4: CROISSANCE** (Mois 1-6)

### **Objectifs**
- **Mois 1**: 50K utilisateurs actifs
- **Mois 3**: 150K utilisateurs actifs
- **Mois 6**: 500K utilisateurs actifs

### **Stratégies de Rétention**

1. **Daily Challenges**:
   - "Poste une poutine aujourd'hui"
   - "Montre ton quartier"
   - "Partage ta chanson québécoise préférée"

2. **Creator Program**:
   - Top 100 créateurs = revenus partagés
   - Support technique dédié

3. **Events**:
   - Meetups mensuels par région
   - Zyeuté Awards
   - Collaborations avec festivals

### **Monétisation** (Mois 3+)

**Revenue Streams**:
1. Virtual Gifts (70% créateur, 30% plateforme)
2. Premium ($4.99/mois)
3. Business Accounts ($49/mois)
4. Native Ads (CPM $5-10)

## **BUDGET ESTIMÉ** (6 premiers mois)

### **Tech Stack** (~$2,000/mois)
- Vercel Pro: $250/mois
- Supabase Pro: $250/mois
- Gemini API: $500/mois
- CDN/Storage: $300/mois
- Monitoring: $200/mois

### **Marketing** (~$10,000 premier mois, puis $3,000/mois)
- Influencer partnerships: $5,000
- Digital ads: $3,000
- Physical marketing: $1,000
- Events: $1,000

**Total Runway**: $30K pour 6 mois

## **SUCCESS METRICS**

### **Year 1 Goals**
- ✅ 100K MAU
- ✅ 60% DAU/MAU ratio
- ✅ $300K ARR
- ✅ Top 50 Social App (Canada)

# 🔥 ON EST PRÊTS! ALLONS-Y! ⚜️

*Propulsé par l'esprit québécois 🍁*
