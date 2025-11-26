# 🚀 ZYEUTÉ - QUICK START GUIDE 🚀

## **GET IT RUNNING IN 30 MINUTES**

### **Prerequisites**
```bash
node -v    # Need v18+
npm -v     # Need v9+
git --version
```

## **STEP 1: CLONE & SETUP** (5 min)

```bash
# Clone the repo
git clone https://github.com/brandonlacoste9-tech/brandonlacoste9-tech-ZYEUTE.git
cd brandonlacoste9-tech-ZYEUTE

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

## **STEP 2: SUPABASE SETUP** (10 min)

### **A. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. **IMPORTANT**: Choose **Canada (Central)** region for Quebec users!
4. Wait for provisioning (~2 minutes)

### **B. Get Your Keys**
1. Go to Project Settings → API
2. Copy **Project URL** and **anon/public key**

### **C. Add to .env.local**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **D. Run Database Migrations**

1. Go to Supabase SQL Editor
2. Run this schema:

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
  fire_score INTEGER DEFAULT 0,
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
  city TEXT,
  fire_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts NOT NULL,
  user_id UUID REFERENCES public.users NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Follows table
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.users NOT NULL,
  following_id UUID REFERENCES public.users NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Fires table (like system)
CREATE TABLE public.fires (
  user_id UUID REFERENCES public.users NOT NULL,
  post_id UUID REFERENCES public.posts NOT NULL,
  fire_level INTEGER CHECK (fire_level BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fires ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);
```

### **E. Enable Authentication Providers**

1. Go to Authentication → Providers
2. Enable:
   - ✅ Email (already enabled)
   - ✅ Google OAuth
   - ✅ Facebook OAuth
   - ✅ Apple Sign In

## **STEP 3: GOOGLE GEMINI API** (5 min)

### **A. Get API Key**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create new key (free tier: 60 requests/min)

### **B. Add to .env.local**
```bash
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

## **STEP 4: RUN LOCALLY** (2 min)

```bash
# Start dev server
npm run dev

# Should open at http://localhost:5173
```

## **STEP 5: TEST FEATURES** (8 min)

### **A. Test Authentication**
1. Click "Sign up"
2. Create account with email
3. Check Supabase → Authentication to see user

### **B. Test Ti-Guy AI**
1. Click "+" to create post
2. Upload an image
3. Click "Demande à Ti-Guy" (AI caption button)
4. Watch magic happen! 🤖

### **C. Test Social Features**
- Create a post
- Like (fire) a post
- Comment on a post
- Follow a user

## **🎉 YOU'RE DONE! IT WORKS!**

## **TROUBLESHOOTING**

### **Problem: Supabase connection fails**
```bash
# Check your .env.local file
cat .env.local

# Make sure URL and key are correct
# Restart dev server
npm run dev
```

### **Problem: Gemini API errors**
```bash
# Check API key is valid
# Check you haven't exceeded free tier limits
# Try again in 1 minute
```

### **Problem: Images won't upload**
1. Check Supabase Storage
2. Create bucket named "posts"
3. Make it public
4. Try again

## **NEXT STEPS**

### **Deploy to Production**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### **Invite Beta Users**
1. Share your Vercel URL
2. Get feedback in Discord/Slack
3. Iterate quickly!

## **RESOURCES**

- 📚 [Supabase Docs](https://supabase.com/docs)
- 🤖 [Gemini API Docs](https://ai.google.dev/docs)
- ⚡ [Vite Docs](https://vitejs.dev)
- ⚛️ [React Docs](https://react.dev)

# 🔥 BONNE CHANCE, CHAMPION! ⚜️

*Need help? Open an issue on GitHub!*

*Propulsé par Nano Banana 🍌 | Made with ❤️ in Quebec*
