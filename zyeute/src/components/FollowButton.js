import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

export default function FollowButton({ targetUserId, compact = false, onChange }) {
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const loadState = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authRes } = await supabase.auth.getUser();
      const me = authRes?.user?.id;
      if (!me || !targetUserId || me === targetUserId) {
        setIsFollowing(false);
        return;
      }

      const { data, error } = await supabase
        .from('abonnements')
        .select('follower_id')
        .eq('follower_id', me)
        .eq('followee_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (e) {
      console.warn('load follow state error', e);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data: authRes } = await supabase.auth.getUser();
      const me = authRes?.user?.id;
      if (!me || !targetUserId || me === targetUserId) {
        Alert.alert('Oups', 'Tu peux pas te suivre toi-même!');
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('abonnements')
          .delete()
          .eq('follower_id', me)
          .eq('followee_id', targetUserId);

        if (error) throw error;
        setIsFollowing(false);
        onChange?.(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('abonnements')
          .insert([
            {
              follower_id: me,
              followee_id: targetUserId,
            },
          ]);

        if (error) throw error;
        setIsFollowing(true);
        onChange?.(true);
      }
    } catch (e) {
      console.error('toggle follow error', e);
      Alert.alert('Oups', 'Ça a pas marché. Réessaye, stp.');
      // Revert optimistic state
      loadState();
    } finally {
      setLoading(false);
    }
  }, [loading, isFollowing, targetUserId, onChange, loadState]);

  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const checkOwnProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsOwnProfile(user?.id === targetUserId);
    };
    if (targetUserId) {
      checkOwnProfile();
    }
  }, [targetUserId]);

  if (!targetUserId || isOwnProfile) return null;

  return (
    <TouchableOpacity
      onPress={toggle}
      disabled={loading}
      style={[
        styles.btn,
        isFollowing ? styles.btnFollowing : styles.btnFollow,
        compact && styles.compact,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? colors.leather : colors.gold}
        />
      ) : (
        <Text
          style={[
            styles.txt,
            isFollowing ? styles.txtFollowing : styles.txtFollow,
          ]}
        >
          {isFollowing ? 'Suivi' : 'Suivre'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.leather,
    minWidth: 100,
    alignItems: 'center',
  },
  btnFollow: {
    backgroundColor: colors.gold,
  },
  btnFollowing: {
    backgroundColor: colors.leather,
    borderColor: colors.gold,
  },
  txt: {
    fontWeight: '700',
    fontSize: 14,
  },
  txtFollow: {
    color: colors.leather,
  },
  txtFollowing: {
    color: colors.gold,
  },
  compact: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 80,
  },
});

