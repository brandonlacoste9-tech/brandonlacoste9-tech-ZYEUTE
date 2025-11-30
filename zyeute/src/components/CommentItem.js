import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function CommentItem({ comment }) {
  const username = comment.user_profiles?.email?.split('@')[0] || comment.email?.split('@')[0] || 'Utilisateur';
  const timeAgo = new Date(comment.created_at).toLocaleDateString('fr-CA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View style={styles.wrap}>
      <Text style={styles.meta}>
        {username} • {timeAgo}
      </Text>
      <Text style={styles.content}>{comment.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  content: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});

