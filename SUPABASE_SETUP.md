# 🛡️ SUPABASE SETUP GUIDE - Zyeuté Moderation System

Complete guide to setting up the AI moderation and safety features in Supabase.

---

## 📋 **PREREQUISITES**

- ✅ Supabase project created
- ✅ Supabase CLI installed (optional but recommended)
- ✅ Admin access to Supabase SQL Editor

---

## ⚡ **QUICK START (5 minutes)**

### **Step 1: Run SQL Migration**

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/migrations/001_moderation_system.sql`
5. Click **Run** (F5)

You should see: **"Zyeuté Moderation System tables created successfully! 🛡️⚜️"**

### **Step 2: Add Admin User**

Run this SQL to make yourself an admin:

```sql
-- Replace with your user email
UPDATE users
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

### **Step 3: Verify Tables**

Check that all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'moderation_logs',
  'user_strikes',
  'content_reports',
  'blocked_users',
  'restricted_users'
);
```

You should see **5 rows** returned.

---

## 📊 **TABLE SCHEMAS**

### **1. moderation_logs**

Stores all AI moderation analysis results.

```sql
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL, -- 'post', 'comment', 'bio', 'message', 'story'
  content_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- AI Analysis
  ai_severity TEXT NOT NULL, -- 'safe', 'low', 'medium', 'high', 'critical'
  ai_categories TEXT[], -- ['bullying', 'hate_speech', etc.]
  ai_confidence INT, -- 0-100
  ai_reason TEXT NOT NULL,
  ai_action TEXT NOT NULL, -- 'allow', 'flag', 'hide', 'remove', 'ban'
  ai_context_note TEXT,
  
  -- Human Review
  human_reviewed BOOLEAN DEFAULT FALSE,
  human_reviewer_id UUID REFERENCES users(id),
  human_decision TEXT, -- 'approve', 'remove', 'ban', 'dismiss'
  human_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'removed', 'dismissed'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_moderation_logs_user` - Query by user
- `idx_moderation_logs_status` - Filter by status
- `idx_moderation_logs_severity` - Filter by severity
- `idx_moderation_logs_content` - Query by content
- `idx_moderation_logs_created` - Sort by date

### **2. user_strikes**

Strike system for user violations.

```sql
CREATE TABLE user_strikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Strike Info
  strike_count INT DEFAULT 0,
  strikes JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"date": "ISO", "reason": "text", "severity": "high", "categories": [...]}]
  
  -- Ban Info
  ban_until TIMESTAMPTZ,
  is_permanent_ban BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  
  -- Appeal Info
  appeal_status TEXT, -- 'none', 'pending', 'accepted', 'rejected'
  appeal_reason TEXT,
  appeal_date TIMESTAMPTZ,
  appeal_reviewed_by UUID REFERENCES users(id),
  appeal_reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Strike Escalation:**
- Strike 1: ⚠️ Warning
- Strike 2: 🚫 24h ban
- Strike 3: 🚫 7d ban
- Strike 4: 🚫 30d ban
- Strike 5: 🔒 Permanent ban

### **3. content_reports**

User-submitted content reports.

```sql
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reporter & Reported
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  content_type TEXT NOT NULL,
  content_id UUID,
  
  -- Report
  report_type TEXT NOT NULL, -- 'bullying', 'harassment', etc.
  details TEXT,
  
  -- Review
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  resolution TEXT, -- 'content_removed', 'user_warned', etc.
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

**Report Types:**
- `bullying` - Intimidation
- `harassment` - Harcèlement
- `hate_speech` - Discours haineux
- `violence` - Violence/menaces
- `sexual_content` - Contenu sexuel
- `spam` - Spam/publicité
- `fraud` - Fraude/arnaque
- `misinformation` - Désinformation
- `illegal` - Activité illégale
- `self_harm` - Automutilation
- `other` - Autre

### **4. blocked_users**

User blocking relationships.

```sql
CREATE TABLE blocked_users (
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);
```

### **5. restricted_users**

Instagram-style restrict feature.

```sql
CREATE TABLE restricted_users (
  restricter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restricted_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (restricter_id, restricted_id),
  CHECK (restricter_id != restricted_id)
);
```

---

## 🔐 **ROW LEVEL SECURITY (RLS)**

All tables have RLS enabled with the following policies:

### **moderation_logs**
- ✅ Admins can view all
- ✅ System can insert
- ✅ Admins can update

### **user_strikes**
- ✅ Users can view their own
- ✅ Admins can view all
- ✅ System can manage all

### **content_reports**
- ✅ Users can view their own reports
- ✅ Admins can view all
- ✅ Users can create reports
- ✅ Admins can update

### **blocked_users**
- ✅ Users can manage their own blocks

### **restricted_users**
- ✅ Users can manage their own restrictions

---

## 🧪 **TESTING**

### **Test 1: Check Tables Exist**

```sql
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns 
        WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
  'moderation_logs',
  'user_strikes',
  'content_reports',
  'blocked_users',
  'restricted_users'
)
ORDER BY table_name;
```

### **Test 2: Check RLS Policies**

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'moderation_logs',
  'user_strikes',
  'content_reports',
  'blocked_users',
  'restricted_users'
)
ORDER BY tablename, policyname;
```

### **Test 3: Test Insert Moderation Log**

```sql
-- Replace with real user_id
INSERT INTO moderation_logs (
  content_type,
  content_id,
  user_id,
  ai_severity,
  ai_categories,
  ai_confidence,
  ai_reason,
  ai_action,
  status
) VALUES (
  'post',
  uuid_generate_v4(),
  'YOUR-USER-ID-HERE',
  'safe',
  ARRAY['none'],
  95,
  'Contenu sécuritaire et approprié',
  'allow',
  'approved'
) RETURNING *;
```

---

## ⚙️ **ENVIRONMENT VARIABLES**

Add to your `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Gemini AI (for moderation)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 🚀 **POST-SETUP**

### **1. Make Yourself Admin**

```sql
UPDATE users
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

### **2. Test Admin Dashboard**

Navigate to: `http://localhost:3002/moderation`

You should see the moderation queue!

### **3. Test Reporting**

1. Go to any post
2. Click ⋯ (three dots)
3. Click "Signaler"
4. Select a reason
5. Submit
6. Check the `/moderation` page

### **4. Test AI Moderation**

1. Try posting with inappropriate content
2. Watch for moderation check
3. Check `moderation_logs` table

---

## 🔧 **TROUBLESHOOTING**

### **Error: Table already exists**

Solution: Drop tables first (⚠️ **DESTRUCTIVE**):

```sql
DROP TABLE IF EXISTS moderation_logs CASCADE;
DROP TABLE IF EXISTS user_strikes CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP TABLE IF EXISTS restricted_users CASCADE;
```

Then re-run migration.

### **Error: RLS policy already exists**

Solution: Drop policies first:

```sql
DROP POLICY IF EXISTS "Admins can view all moderation logs" ON moderation_logs;
-- (repeat for all policies)
```

### **Error: Function already exists**

Solution: Drop function:

```sql
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

### **Can't access /moderation page**

Check: Is your user an admin?

```sql
SELECT id, email, is_admin
FROM users
WHERE email = 'your-email@example.com';
```

---

## 📊 **MONITORING QUERIES**

### **Active Bans**

```sql
SELECT u.username, u.email, s.strike_count, s.ban_until, s.is_permanent_ban
FROM user_strikes s
JOIN users u ON s.user_id = u.id
WHERE s.is_permanent_ban = TRUE 
   OR s.ban_until > NOW()
ORDER BY s.ban_until DESC;
```

### **Pending Moderation**

```sql
SELECT COUNT(*) as pending_count
FROM moderation_logs
WHERE status = 'pending';
```

### **Top Reporters**

```sql
SELECT u.username, COUNT(*) as report_count
FROM content_reports r
JOIN users u ON r.reporter_id = u.id
WHERE r.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.username
ORDER BY report_count DESC
LIMIT 10;
```

### **Recent Violations**

```sql
SELECT 
  u.username,
  m.content_type,
  m.ai_severity,
  m.ai_reason,
  m.created_at
FROM moderation_logs m
JOIN users u ON m.user_id = u.id
WHERE m.ai_severity IN ('high', 'critical')
ORDER BY m.created_at DESC
LIMIT 20;
```

---

## 🎓 **NEXT STEPS**

1. ✅ Run SQL migration
2. ✅ Make yourself admin
3. ✅ Test moderation dashboard
4. ✅ Test reporting system
5. ✅ Monitor logs regularly
6. ⏳ Train moderators (see MODERATION_GUIDE.md)
7. ⏳ Set up email notifications
8. ⏳ Configure backup policies

---

## 📞 **SUPPORT**

Issues? Check:
- MODERATION_IMPLEMENTATION_STATUS.md
- MODERATION_GUIDE.md (coming soon)
- TESTING_MODERATION.md (coming soon)

---

*Fait au Québec, pour le Québec. Modération intelligente! 🛡️⚜️*

