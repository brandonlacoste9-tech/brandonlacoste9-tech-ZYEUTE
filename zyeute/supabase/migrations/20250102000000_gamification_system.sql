-- ============================================
-- ZYEUTÉ Gamification System
-- Quebec/Joual-themed points, levels, badges, streaks
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER STATS & POINTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Points System
    total_points INTEGER DEFAULT 0 NOT NULL,
    current_level INTEGER DEFAULT 1 NOT NULL,
    xp_to_next_level INTEGER DEFAULT 100 NOT NULL,
    
    -- Streaks
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_activity_date DATE,
    
    -- Engagement Metrics
    posts_count INTEGER DEFAULT 0 NOT NULL,
    reactions_given INTEGER DEFAULT 0 NOT NULL,
    reactions_received INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    followers_count INTEGER DEFAULT 0 NOT NULL,
    following_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Leaderboard
    leaderboard_rank INTEGER,
    weekly_points INTEGER DEFAULT 0 NOT NULL,
    monthly_points INTEGER DEFAULT 0 NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_points ON public.user_stats(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_current_level ON public.user_stats(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_weekly_points ON public.user_stats(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_monthly_points ON public.user_stats(monthly_points DESC);

-- ============================================
-- 2. POINT TRANSACTIONS (Audit Trail)
-- ============================================

CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction Details
    points INTEGER NOT NULL, -- Can be negative for penalties
    transaction_type TEXT NOT NULL, -- 'post_created', 'reaction_given', 'comment_added', 'streak_bonus', etc.
    source_id UUID, -- ID of the publication, reaction, comment, etc.
    source_type TEXT, -- 'publication', 'reaction', 'comment', 'achievement', etc.
    
    -- Metadata
    description TEXT, -- Human-readable description in Joual
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON public.point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);

-- ============================================
-- 3. BADGES & ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Badge Info
    name TEXT NOT NULL UNIQUE, -- e.g., 'premier_post', 'feu_du_jour', 'legende_quebec'
    title_fr TEXT NOT NULL, -- Display name in French/Joual
    description_fr TEXT NOT NULL, -- Description in French/Joual
    icon_emoji TEXT, -- Emoji icon
    icon_url TEXT, -- Optional image URL
    
    -- Requirements
    badge_type TEXT NOT NULL, -- 'milestone', 'streak', 'social', 'content', 'special'
    requirement_value INTEGER, -- e.g., 10 posts, 7 day streak
    requirement_metric TEXT, -- 'posts', 'reactions', 'streak_days', 'followers', etc.
    
    -- Rewards
    points_reward INTEGER DEFAULT 0 NOT NULL,
    
    -- Metadata
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    category TEXT, -- 'engagement', 'content', 'social', 'streak', 'special'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Pre-populate Quebec-themed badges
INSERT INTO public.badges (name, title_fr, description_fr, icon_emoji, badge_type, requirement_metric, requirement_value, points_reward, rarity, category) VALUES
-- Milestone Badges
('premier_post', 'Premier Post', 'Tu as publié ton premier post!', '🎯', 'milestone', 'posts', 1, 50, 'common', 'content'),
('dix_posts', 'Dix Posts', 'Tu as publié 10 posts!', '🔥', 'milestone', 'posts', 10, 200, 'common', 'content'),
('cent_posts', 'Cent Posts', 'Tu as publié 100 posts! T''es une légende!', '👑', 'milestone', 'posts', 100, 1000, 'epic', 'content'),
('mille_posts', 'Mille Posts', '1000 posts?! T''es vraiment malade!', '💎', 'milestone', 'posts', 1000, 5000, 'legendary', 'content'),

-- Streak Badges
('feu_du_jour', 'Feu du Jour', 'Streak de 1 jour - Donner du feu!', '🔥', 'streak', 'streak_days', 1, 25, 'common', 'streak'),
('feu_de_la_semaine', 'Feu de la Semaine', 'Streak de 7 jours - T''es en feu!', '🔥🔥', 'streak', 'streak_days', 7, 200, 'rare', 'streak'),
('feu_du_mois', 'Feu du Mois', 'Streak de 30 jours - Incroyable!', '🔥🔥🔥', 'streak', 'streak_days', 30, 1000, 'epic', 'streak'),
('feu_eternel', 'Feu Éternel', 'Streak de 100 jours - T''es une machine!', '🔥🔥🔥🔥', 'streak', 'streak_days', 100, 5000, 'legendary', 'streak'),

-- Social Badges
('premiere_reaction', 'Première Réaction', 'Tu as donné ta première réaction!', '❤️', 'social', 'reactions_given', 1, 10, 'common', 'social'),
('cent_reactions', 'Cent Réactions', 'Tu as donné 100 réactions!', '💕', 'social', 'reactions_given', 100, 500, 'rare', 'social'),
('premier_commentaire', 'Premier Commentaire', 'Tu as commenté pour la première fois!', '💬', 'social', 'comments', 1, 20, 'common', 'social'),
('cent_commentaires', 'Cent Commentaires', 'Tu as commenté 100 fois!', '💬💬', 'social', 'comments', 100, 500, 'rare', 'social'),

-- Engagement Badges
('premier_follower', 'Premier Follower', 'Tu as ton premier follower!', '👥', 'social', 'followers', 1, 50, 'common', 'social'),
('cent_followers', 'Cent Followers', 'Tu as 100 followers!', '👑', 'social', 'followers', 100, 1000, 'epic', 'social'),
('mille_followers', 'Mille Followers', 'Tu as 1000 followers! T''es une star!', '⭐', 'social', 'followers', 1000, 5000, 'legendary', 'social'),

-- Special Quebec Badges
('legende_quebec', 'Légende du Québec', 'Tu es une légende de la communauté québécoise!', '⚜️', 'special', NULL, NULL, 2000, 'legendary', 'special'),
('vrai_quebecois', 'Vrai Québécois', 'Tu représentes bien le Québec!', '🍁', 'special', NULL, NULL, 500, 'epic', 'special'),
('ti_guy_fan', 'Fan de TI-Guy', 'Tu utilises TI-Guy régulièrement!', '🦫', 'special', NULL, NULL, 300, 'rare', 'special')
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_badges_type ON public.badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);

-- ============================================
-- 4. USER BADGES (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    
    -- Metadata
    earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE, -- User can feature badges on profile
    
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- ============================================
-- 5. DAILY CHALLENGES
-- ============================================

CREATE TABLE IF NOT EXISTS public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Challenge Info
    name TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    challenge_type TEXT NOT NULL, -- 'post', 'reaction', 'comment', 'discovery', 'streak'
    target_value INTEGER NOT NULL, -- e.g., 3 posts, 10 reactions
    
    -- Rewards
    points_reward INTEGER DEFAULT 100 NOT NULL,
    badge_reward_id UUID REFERENCES public.badges(id),
    
    -- Timing
    challenge_date DATE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(challenge_date, challenge_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active ON public.daily_challenges(is_active) WHERE is_active = TRUE;

-- ============================================
-- 6. USER CHALLENGE PROGRESS
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
    
    -- Progress
    current_value INTEGER DEFAULT 0 NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON public.user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge_id ON public.user_challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_completed ON public.user_challenge_progress(is_completed) WHERE is_completed = FALSE;

-- ============================================
-- 7. LEADERBOARDS
-- ============================================

CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Leaderboard Info
    leaderboard_type TEXT NOT NULL, -- 'all_time', 'weekly', 'monthly', 'streak'
    period_start DATE,
    period_end DATE,
    
    -- Rankings (cached for performance)
    rankings JSONB DEFAULT '[]', -- Array of {user_id, rank, points}
    
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(leaderboard_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON public.leaderboards(leaderboard_type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON public.leaderboards(period_start, period_end);

-- ============================================
-- 8. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- User Stats: Users can read their own stats, read others' public stats
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public stats" ON public.user_stats
    FOR SELECT USING (TRUE); -- Public leaderboard data

-- Point Transactions: Users can read their own transactions
CREATE POLICY "Users can view own transactions" ON public.point_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Badges: Public read
CREATE POLICY "Badges are public" ON public.badges
    FOR SELECT USING (TRUE);

-- User Badges: Users can read all, but only modify their own featured status
CREATE POLICY "User badges are public" ON public.user_badges
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own badge features" ON public.user_badges
    FOR UPDATE USING (auth.uid() = user_id);

-- Daily Challenges: Public read
CREATE POLICY "Challenges are public" ON public.daily_challenges
    FOR SELECT USING (TRUE);

-- User Challenge Progress: Users can read their own progress
CREATE POLICY "Users can view own challenge progress" ON public.user_challenge_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress" ON public.user_challenge_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboards: Public read
CREATE POLICY "Leaderboards are public" ON public.leaderboards
    FOR SELECT USING (TRUE);

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to calculate level from total points
CREATE OR REPLACE FUNCTION public.calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: level = floor(sqrt(points / 100)) + 1
    -- Level 1: 0-99 points
    -- Level 2: 100-399 points
    -- Level 3: 400-899 points
    -- etc.
    RETURN FLOOR(SQRT(GREATEST(points, 0) / 100.0))::INTEGER + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION public.calculate_xp_to_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- XP needed = (level^2 * 100) - current_points
    -- But we'll use a simpler formula: next level threshold - current points
    RETURN (current_level * current_level * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award points
CREATE OR REPLACE FUNCTION public.award_points(
    p_user_id UUID,
    p_points INTEGER,
    p_transaction_type TEXT,
    p_source_id UUID DEFAULT NULL,
    p_source_type TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_new_total_points INTEGER;
    v_new_level INTEGER;
    v_old_level INTEGER;
BEGIN
    -- Insert transaction
    INSERT INTO public.point_transactions (
        user_id, points, transaction_type, source_id, source_type, description
    ) VALUES (
        p_user_id, p_points, p_transaction_type, p_source_id, p_source_type, p_description
    ) RETURNING id INTO v_transaction_id;
    
    -- Update user stats
    UPDATE public.user_stats
    SET 
        total_points = total_points + p_points,
        weekly_points = CASE 
            WHEN created_at > NOW() - INTERVAL '7 days' 
            THEN weekly_points + p_points 
            ELSE p_points 
        END,
        monthly_points = CASE 
            WHEN created_at > NOW() - INTERVAL '30 days' 
            THEN monthly_points + p_points 
            ELSE p_points 
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING total_points, current_level INTO v_new_total_points, v_old_level;
    
    -- Calculate new level
    v_new_level := public.calculate_level(v_new_total_points);
    
    -- Update level if changed
    IF v_new_level > v_old_level THEN
        UPDATE public.user_stats
        SET 
            current_level = v_new_level,
            xp_to_next_level = public.calculate_xp_to_next_level(v_new_level) - v_new_total_points
        WHERE user_id = p_user_id;
    END IF;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_today DATE := CURRENT_DATE;
BEGIN
    SELECT last_activity_date, current_streak
    INTO v_last_activity, v_current_streak
    FROM public.user_stats
    WHERE user_id = p_user_id;
    
    IF v_last_activity IS NULL THEN
        -- First activity
        UPDATE public.user_stats
        SET 
            current_streak = 1,
            longest_streak = 1,
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    ELSIF v_last_activity = v_today THEN
        -- Already updated today, do nothing
        RETURN;
    ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
        -- Consecutive day - increment streak
        UPDATE public.user_stats
        SET 
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    ELSE
        -- Streak broken - reset to 1
        UPDATE public.user_stats
        SET 
            current_streak = 1,
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_id UUID, badge_name TEXT) AS $$
DECLARE
    v_user_stats RECORD;
    v_badge RECORD;
BEGIN
    -- Get user stats
    SELECT * INTO v_user_stats
    FROM public.user_stats
    WHERE user_id = p_user_id;
    
    IF v_user_stats IS NULL THEN
        RETURN;
    END IF;
    
    -- Check all badges
    FOR v_badge IN 
        SELECT * FROM public.badges
        WHERE requirement_metric IS NOT NULL
    LOOP
        -- Check if user already has this badge
        IF NOT EXISTS (
            SELECT 1 FROM public.user_badges
            WHERE user_id = p_user_id AND badge_id = v_badge.id
        ) THEN
            -- Check if requirement is met
            CASE v_badge.requirement_metric
                WHEN 'posts' THEN
                    IF v_user_stats.posts_count >= v_badge.requirement_value THEN
                        INSERT INTO public.user_badges (user_id, badge_id)
                        VALUES (p_user_id, v_badge.id)
                        ON CONFLICT DO NOTHING;
                        
                        -- Award points
                        PERFORM public.award_points(
                            p_user_id,
                            v_badge.points_reward,
                            'badge_earned',
                            v_badge.id,
                            'badge',
                            'Badge gagné: ' || v_badge.title_fr
                        );
                        
                        RETURN QUERY SELECT v_badge.id, v_badge.name;
                    END IF;
                WHEN 'streak_days' THEN
                    IF v_user_stats.current_streak >= v_badge.requirement_value THEN
                        INSERT INTO public.user_badges (user_id, badge_id)
                        VALUES (p_user_id, v_badge.id)
                        ON CONFLICT DO NOTHING;
                        
                        PERFORM public.award_points(
                            p_user_id,
                            v_badge.points_reward,
                            'badge_earned',
                            v_badge.id,
                            'badge',
                            'Badge gagné: ' || v_badge.title_fr
                        );
                        
                        RETURN QUERY SELECT v_badge.id, v_badge.name;
                    END IF;
                WHEN 'reactions_given' THEN
                    IF v_user_stats.reactions_given >= v_badge.requirement_value THEN
                        INSERT INTO public.user_badges (user_id, badge_id)
                        VALUES (p_user_id, v_badge.id)
                        ON CONFLICT DO NOTHING;
                        
                        PERFORM public.award_points(
                            p_user_id,
                            v_badge.points_reward,
                            'badge_earned',
                            v_badge.id,
                            'badge',
                            'Badge gagné: ' || v_badge.title_fr
                        );
                        
                        RETURN QUERY SELECT v_badge.id, v_badge.name;
                    END IF;
                WHEN 'comments' THEN
                    IF v_user_stats.comments_count >= v_badge.requirement_value THEN
                        INSERT INTO public.user_badges (user_id, badge_id)
                        VALUES (p_user_id, v_badge.id)
                        ON CONFLICT DO NOTHING;
                        
                        PERFORM public.award_points(
                            p_user_id,
                            v_badge.points_reward,
                            'badge_earned',
                            v_badge.id,
                            'badge',
                            'Badge gagné: ' || v_badge.title_fr
                        );
                        
                        RETURN QUERY SELECT v_badge.id, v_badge.name;
                    END IF;
                WHEN 'followers' THEN
                    IF v_user_stats.followers_count >= v_badge.requirement_value THEN
                        INSERT INTO public.user_badges (user_id, badge_id)
                        VALUES (p_user_id, v_badge.id)
                        ON CONFLICT DO NOTHING;
                        
                        PERFORM public.award_points(
                            p_user_id,
                            v_badge.points_reward,
                            'badge_earned',
                            v_badge.id,
                            'badge',
                            'Badge gagné: ' || v_badge.title_fr
                        );
                        
                        RETURN QUERY SELECT v_badge.id, v_badge.name;
                    END IF;
            END CASE;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. TRIGGERS FOR AUTOMATIC POINT AWARDS
-- ============================================

-- Trigger: Award points when publication is created
CREATE OR REPLACE FUNCTION public.handle_publication_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize user stats if doesn't exist
    INSERT INTO public.user_stats (user_id, posts_count)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        posts_count = user_stats.posts_count + 1,
        updated_at = NOW();
    
    -- Update streak
    PERFORM public.update_streak(NEW.user_id);
    
    -- Award points for creating a post
    PERFORM public.award_points(
        NEW.user_id,
        50, -- Base points for post
        'post_created',
        NEW.id,
        'publication',
        'Post créé'
    );
    
    -- Check for badges
    PERFORM public.check_and_award_badges(NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_publication_created_points
    AFTER INSERT ON public.publications
    FOR EACH ROW
    WHEN (NEW.deleted_at IS NULL)
    EXECUTE FUNCTION public.handle_publication_created();

-- Trigger: Award points when reaction is given
CREATE OR REPLACE FUNCTION public.handle_reaction_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for user who gave reaction
    UPDATE public.user_stats
    SET reactions_given = reactions_given + 1
    WHERE user_id = NEW.user_id;
    
    -- Update stats for user who received reaction
    UPDATE public.user_stats
    SET reactions_received = reactions_received + 1
    WHERE user_id = (
        SELECT user_id FROM public.publications WHERE id = NEW.publication_id
    );
    
    -- Award points to giver
    PERFORM public.award_points(
        NEW.user_id,
        5, -- Small points for reacting
        'reaction_given',
        NEW.id,
        'reaction',
        'Réaction donnée'
    );
    
    -- Award points to receiver
    PERFORM public.award_points(
        (SELECT user_id FROM public.publications WHERE id = NEW.publication_id),
        10, -- More points for receiving reaction
        'reaction_received',
        NEW.id,
        'reaction',
        'Réaction reçue'
    );
    
    -- Update streak for giver
    PERFORM public.update_streak(NEW.user_id);
    
    -- Check for badges
    PERFORM public.check_and_award_badges(NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_reaction_created_points
    AFTER INSERT ON public.reactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_reaction_created();

-- Trigger: Award points when comment is added
CREATE OR REPLACE FUNCTION public.handle_comment_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats
    UPDATE public.user_stats
    SET comments_count = comments_count + 1
    WHERE user_id = NEW.user_id;
    
    -- Award points
    PERFORM public.award_points(
        NEW.user_id,
        20, -- Points for commenting
        'comment_added',
        NEW.id,
        'comment',
        'Commentaire ajouté'
    );
    
    -- Update streak
    PERFORM public.update_streak(NEW.user_id);
    
    -- Check for badges
    PERFORM public.check_and_award_badges(NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_comment_created_points
    AFTER INSERT ON public.commentaires
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_comment_created();

-- ============================================
-- 11. INITIALIZE USER STATS ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_user_stats
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 12. COMMENTS
-- ============================================

COMMENT ON TABLE public.user_stats IS 'User gamification stats: points, levels, streaks, engagement metrics';
COMMENT ON TABLE public.point_transactions IS 'Audit trail of all point transactions';
COMMENT ON TABLE public.badges IS 'Available badges and achievements (Quebec/Joual themed)';
COMMENT ON TABLE public.user_badges IS 'Badges earned by users';
COMMENT ON TABLE public.daily_challenges IS 'Daily challenges for users';
COMMENT ON TABLE public.user_challenge_progress IS 'User progress on daily challenges';
COMMENT ON TABLE public.leaderboards IS 'Cached leaderboard rankings';

