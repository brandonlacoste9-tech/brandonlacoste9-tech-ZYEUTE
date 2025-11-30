import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { subscribeToReactions, unsubscribe } from '../lib/realtime';

// Quebec-themed reaction types (matching DB constraint)
const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
// For Zyeuté, we'll use: 🔥 (feu/like), ❤️ (love), 😂 (haha), 😮 (wow), 😢 (sad), 😠 (angry)
// But for simplicity, let's start with the main ones: like, love, haha

const MAIN_REACTIONS = ['like', 'love', 'haha'];

export default function ReactionBar({ publicationId, style, onCountsChange }) {
  const [counts, setCounts] = useState({ like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  const [mine, setMine] = useState(null); // current user's type or null
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const channelRef = React.useRef(null);

  const fetchSnapshot = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInitialLoading(false);
        return;
      }

      // Fetch counts per type
      const { data: reactionsData, error: countsError } = await supabase
        .from('reactions')
        .select('type')
        .eq('publication_id', publicationId)
        .is('deleted_at', null);

      if (countsError) {
        console.warn('reaction counts error', countsError);
        return;
      }

      // Aggregate counts
      const nextCounts = {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      };

      reactionsData?.forEach((r) => {
        if (r.type && nextCounts.hasOwnProperty(r.type)) {
          nextCounts[r.type] = (nextCounts[r.type] || 0) + 1;
        }
      });

      setCounts(nextCounts);

      // Fetch current user's reaction
      const { data: myReaction, error: myError } = await supabase
        .from('reactions')
        .select('type')
        .eq('publication_id', publicationId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!myError && myReaction) {
        setMine(myReaction.type);
      } else {
        setMine(null);
      }

      onCountsChange?.(nextCounts);
    } catch (err) {
      console.error('Error fetching reactions:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [publicationId, onCountsChange]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  // Realtime updates
  useEffect(() => {
    if (!publicationId) return;

    const channel = subscribeToReactions(publicationId, (eventType, payload) => {
      const { record, old_record } = payload;

      if (eventType === 'INSERT') {
        const row = record;
        if (!row || row.publication_id !== publicationId) return;

        setCounts((prev) => ({
          ...prev,
          [row.type]: (prev[row.type] || 0) + 1,
        }));

        supabase.auth.getUser().then(({ data }) => {
          if (data?.user?.id === row.user_id) {
            setMine(row.type);
          }
        });
      } else if (eventType === 'DELETE') {
        const row = old_record;
        if (!row || row.publication_id !== publicationId) return;

        setCounts((prev) => ({
          ...prev,
          [row.type]: Math.max(0, (prev[row.type] || 0) - 1),
        }));

        supabase.auth.getUser().then(({ data }) => {
          if (data?.user?.id === row.user_id) {
            setMine(null);
          }
        });
      } else if (eventType === 'UPDATE') {
        const oldRow = old_record;
        const newRow = record;
        if (!newRow || newRow.publication_id !== publicationId) return;

        // Switch type
        setCounts((prev) => {
          const next = { ...prev };
          if (oldRow?.type) {
            next[oldRow.type] = Math.max(0, (next[oldRow.type] || 0) - 1);
          }
          next[newRow.type] = (next[newRow.type] || 0) + 1;
          return next;
        });

        supabase.auth.getUser().then(({ data }) => {
          if (data?.user?.id === newRow.user_id) {
            setMine(newRow.type);
          }
        });
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [publicationId]);

  const toggle = useCallback(async (type) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('User not authenticated');
        return;
      }

      const user_id = user.id;

      if (mine === type) {
        // Remove reaction (delete)
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('publication_id', publicationId)
          .eq('user_id', user_id);

        if (error) throw error;

        // Optimistic update
        setMine(null);
        setCounts((c) => ({
          ...c,
          [type]: Math.max(0, (c[type] || 0) - 1),
        }));
      } else if (mine && mine !== type) {
        // Switch reaction: update type
        const { error } = await supabase
          .from('reactions')
          .update({ type })
          .eq('publication_id', publicationId)
          .eq('user_id', user_id);

        if (error) throw error;

        // Optimistic update
        setCounts((c) => {
          const next = { ...c };
          if (mine) {
            next[mine] = Math.max(0, (next[mine] || 0) - 1);
          }
          next[type] = (next[type] || 0) + 1;
          return next;
        });
        setMine(type);
      } else {
        // Add reaction
        const { error } = await supabase
          .from('reactions')
          .insert([
            {
              publication_id: publicationId,
              user_id,
              type,
            },
          ]);

        if (error) throw error;

        // Optimistic update
        setMine(type);
        setCounts((c) => ({
          ...c,
          [type]: (c[type] || 0) + 1,
        }));
      }
    } catch (e) {
      console.error('toggle reaction failed', e);
      // Revert optimistic update by refetching
      fetchSnapshot();
    } finally {
      setLoading(false);
    }
  }, [loading, mine, publicationId, fetchSnapshot]);

  const labelFor = (t) => {
    switch (t) {
      case 'like':
        return '🔥';
      case 'love':
        return '❤️';
      case 'haha':
        return '😂';
      case 'wow':
        return '😮';
      case 'sad':
        return '😢';
      case 'angry':
        return '😠';
      default:
        return t;
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.wrap, style]}>
        <ActivityIndicator size="small" color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      {MAIN_REACTIONS.map((t) => {
        const count = counts[t] || 0;
        const isActive = mine === t;
        return (
          <TouchableOpacity
            key={t}
            style={[styles.btn, isActive && styles.btnActive]}
            onPress={() => toggle(t)}
            disabled={loading}
          >
            <Text style={[styles.emoji, isActive && styles.emojiActive]}>
              {labelFor(t)}
            </Text>
            {count > 0 && (
              <Text style={[styles.count, isActive && styles.countActive]}>
                {count}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    backgroundColor: colors.leather,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  emoji: {
    fontSize: 18,
  },
  emojiActive: {
    // Emoji stays the same
  },
  count: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  countActive: {
    color: colors.leather,
  },
});

