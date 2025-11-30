import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as gamificationService from '../lib/services/gamificationService';

const GamificationContext = createContext(null);

export function GamificationProvider({ children }) {
  const [userStats, setUserStats] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize and fetch user stats
  useEffect(() => {
    const initializeGamification = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        setCurrentUser(user);
        
        // Fetch user stats
        const stats = await gamificationService.getUserStats(user.id);
        setUserStats(stats);

        // Fetch user badges
        const badges = await gamificationService.getUserBadges(user.id);
        setUserBadges(badges);

        // Subscribe to real-time updates
        const statsChannel = supabase
          .channel('user_stats_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_stats',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                setUserStats(payload.new);
              }
            }
          )
          .subscribe();

        const badgesChannel = supabase
          .channel('user_badges_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_badges',
              filter: `user_id=eq.${user.id}`,
            },
            async () => {
              // Refresh badges
              const updatedBadges = await gamificationService.getUserBadges(user.id);
              setUserBadges(updatedBadges);
            }
          )
          .subscribe();

        setLoading(false);

        return () => {
          statsChannel.unsubscribe();
          badgesChannel.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing gamification:', error);
        setLoading(false);
      }
    };

    initializeGamification();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
        const stats = await gamificationService.getUserStats(session.user.id);
        setUserStats(stats);
        const badges = await gamificationService.getUserBadges(session.user.id);
        setUserBadges(badges);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserStats(null);
        setUserBadges([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshStats = async () => {
    if (!currentUser) return;
    
    const stats = await gamificationService.getUserStats(currentUser.id);
    setUserStats(stats);
    
    const badges = await gamificationService.getUserBadges(currentUser.id);
    setUserBadges(badges);
  };

  const value = {
    userStats,
    userBadges,
    loading,
    refreshStats,
    currentUser,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}

