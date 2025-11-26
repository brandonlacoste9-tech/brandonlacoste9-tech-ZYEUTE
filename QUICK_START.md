# 🚀 ZYEUTÉ - Quick Start (5 Minutes)

Get Zyeuté running on your machine in 5 minutes!

---

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

---

## Step 2: Create Environment File (2 minutes)

Create a file named `.env.local` in the project root:

```env
# Supabase (Get from: https://app.supabase.com/project/_/settings/api)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini AI (Get from: https://ai.google.dev)
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# App Config
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Zyeuté
```

### Where to get your keys:

**Supabase**:
1. Go to [supabase.com](https://supabase.com) → New Project
2. Settings → API → Copy URL and anon key

**Gemini**:
1. Go to [ai.google.dev](https://ai.google.dev)
2. Get API Key → Copy key

---

## Step 3: Setup Database (2 minutes)

In Supabase:

1. **SQL Editor** → Run the schema from `SETUP_GUIDE.md` (lines 109-384)
2. **Storage** → Create two buckets:
   - `posts` (public)
   - `avatars` (public)

---

## Step 4: Run the App! 🎉

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

---

## What to Try First

1. **Sign Up** - Create an account with email/password
2. **Upload a Post** - Click the + button
3. **Try Ti-Guy AI** - Click "Demande à Ti-Guy" to generate a Quebec French caption!
4. **Explore** - Check out the explore page
5. **Edit Profile** - Go to Settings and upload an avatar

---

## Need More Help?

- **Full Setup Guide**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Troubleshooting**: See SETUP_GUIDE.md → Troubleshooting section
- **Project Overview**: See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

---

## Quick Troubleshooting

**"Missing environment variables"**
→ Make sure `.env.local` exists with all 3 keys

**"Bucket not found"**
→ Create `posts` and `avatars` buckets in Supabase Storage (make them public!)

**"Gemini API error"**
→ Check your API key is correct and you haven't exceeded 60 requests/minute

---

## 🔥 You're Ready to Build! ⚜️

*For detailed instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)*
