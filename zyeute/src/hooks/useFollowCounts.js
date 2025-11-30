import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useFollowCounts(userId) {
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  const load = useCallback(async () => {
    if (!userId) return;
    
    try {
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase
          .from('abonnements')
          .select('*', { count: 'exact', head: true })
          .eq('followee_id', userId),
        supabase
          .from('abonnements')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);

      setCounts({
        followers: followers || 0,
        following: following || 0,
      });
    } catch (err) {
      console.error('Error loading follow counts:', err);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Optional: Subscribe to realtime updates if you add a follows trigger
  // For now, we'll just refresh on mount/change

  return counts;
}

