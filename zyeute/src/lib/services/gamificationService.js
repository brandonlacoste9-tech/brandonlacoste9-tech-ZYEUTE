import { supabase } from '../supabase';

/**
 * ZYEUTÉ Gamification Service
 * Manages points, levels, badges, streaks, and leaderboards
 */

/**
 * Get user stats (points, level, streak, etc.)
 */
export async function getUserStats(userId) {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching user stats:', error);
      return null;
    }

    // Initialize stats if doesn't exist
    if (!data) {
      const { data: newStats, error: insertError } = await supabase
        .from('user_stats')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) {
        console.error('Error initializing user stats:', insertError);
        return null;
      }

      return newStats;
    }

    return data;
  } catch (err) {
    console.error('Error in getUserStats:', err);
    return null;
  }
}

/**
 * Get user badges
 */
export async function getUserBadges(userId) {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges:badge_id (
          id,
          name,
          title_fr,
          description_fr,
          icon_emoji,
          icon_url,
          rarity,
          category
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getUserBadges:', err);
    return [];
  }
}

/**
 * Get point transactions (recent activity)
 */
export async function getPointTransactions(userId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching point transactions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getPointTransactions:', err);
    return [];
  }
}

/**
 * Get daily challenges
 */
export async function getDailyChallenges() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .eq('is_active', true)
      .order('points_reward', { ascending: false });

    if (error) {
      console.error('Error fetching daily challenges:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getDailyChallenges:', err);
    return [];
  }
}

/**
 * Get user challenge progress
 */
export async function getUserChallengeProgress(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('user_challenge_progress')
      .select(`
        *,
        challenges:daily_challenges!inner (
          id,
          name,
          description_fr,
          challenge_type,
          target_value,
          points_reward,
          badge_reward_id
        )
      `)
      .eq('user_id', userId)
      .eq('challenges.challenge_date', today)
      .eq('is_completed', false);

    if (error) {
      console.error('Error fetching challenge progress:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getUserChallengeProgress:', err);
    return [];
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(userId, challengeId, increment = 1) {
  try {
    // Get current progress
    const { data: current, error: fetchError } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching challenge progress:', fetchError);
      return null;
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError) {
      console.error('Error fetching challenge:', challengeError);
      return null;
    }

    const newValue = (current?.current_value || 0) + increment;
    const isCompleted = newValue >= challenge.target_value;

    if (current) {
      // Update existing progress
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .update({
          current_value: newValue,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', current.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating challenge progress:', error);
        return null;
      }

      // Award points if completed
      if (isCompleted && challenge.points_reward) {
        await supabase.rpc('award_points', {
          p_user_id: userId,
          p_points: challenge.points_reward,
          p_transaction_type: 'challenge_completed',
          p_source_id: challengeId,
          p_source_type: 'challenge',
          p_description: `Défi complété: ${challenge.name}`,
        });
      }

      return data;
    } else {
      // Create new progress
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          current_value: increment,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating challenge progress:', error);
        return null;
      }

      // Award points if completed
      if (isCompleted && challenge.points_reward) {
        await supabase.rpc('award_points', {
          p_user_id: userId,
          p_points: challenge.points_reward,
          p_transaction_type: 'challenge_completed',
          p_source_id: challengeId,
          p_source_type: 'challenge',
          p_description: `Défi complété: ${challenge.name}`,
        });
      }

      return data;
    }
  } catch (err) {
    console.error('Error in updateChallengeProgress:', err);
    return null;
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(type = 'all_time', limit = 100) {
  try {
    let query = supabase
      .from('user_stats')
      .select(`
        *,
        user_profiles:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order('total_points', { ascending: false })
      .limit(limit);

    // Filter by period
    if (type === 'weekly') {
      query = query.order('weekly_points', { ascending: false });
    } else if (type === 'monthly') {
      query = query.order('monthly_points', { ascending: false });
    } else if (type === 'streak') {
      query = query.order('current_streak', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    // Add rank
    return (data || []).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  } catch (err) {
    console.error('Error in getLeaderboard:', err);
    return [];
  }
}

/**
 * Get user rank
 */
export async function getUserRank(userId, type = 'all_time') {
  try {
    const leaderboard = await getLeaderboard(type, 1000);
    const userIndex = leaderboard.findIndex(item => item.user_id === userId);
    
    if (userIndex === -1) {
      return null; // User not in top 1000
    }

    return {
      rank: userIndex + 1,
      total: leaderboard.length,
    };
  } catch (err) {
    console.error('Error in getUserRank:', err);
    return null;
  }
}

/**
 * Calculate level progress percentage
 */
export function calculateLevelProgress(stats) {
  if (!stats) return 0;

  const currentLevelPoints = (stats.current_level - 1) ** 2 * 100;
  const nextLevelPoints = stats.current_level ** 2 * 100;
  const pointsInCurrentLevel = stats.total_points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;

  return Math.min(100, Math.max(0, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100));
}

/**
 * Format points with Joual flair
 */
export function formatPoints(points) {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
}

/**
 * Get badge rarity color
 */
export function getBadgeRarityColor(rarity) {
  const colors = {
    common: '#B8A890', // Light leather
    rare: '#00D4FF', // Cyan
    epic: '#B744FF', // Purple
    legendary: '#F5C842', // Gold
  };
  return colors[rarity] || colors.common;
}

/**
 * Get level title in Joual
 */
export function getLevelTitle(level) {
  const titles = {
    1: 'Débutant',
    5: 'Actif',
    10: 'Engagé',
    20: 'Passionné',
    30: 'Légende',
    50: 'Maître',
    100: 'Immortel',
  };

  // Find the highest title the user has reached
  const levelKeys = Object.keys(titles).map(Number).sort((a, b) => b - a);
  for (const key of levelKeys) {
    if (level >= key) {
      return titles[key];
    }
  }

  return 'Débutant';
}

