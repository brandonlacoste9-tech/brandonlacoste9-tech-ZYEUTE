import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { getBadgeRarityColor } from '../../lib/services/gamificationService';

/**
 * Badge card component with Fur Trader Luxury styling
 */
export default function BadgeCard({ badge, earned = false, onPress, size = 'medium' }) {
  if (!badge) return null;

  const rarityColor = getBadgeRarityColor(badge.rarity || 'common');
  const sizeStyles = {
    small: { container: 60, emoji: 24, text: 10 },
    medium: { container: 80, emoji: 32, text: 12 },
    large: { container: 120, emoji: 48, text: 14 },
  };

  const style = sizeStyles[size] || sizeStyles.medium;

  const CardContent = (
    <View style={[
      styles.container,
      {
        width: style.container,
        height: style.container,
        borderColor: earned ? rarityColor : colors.muted,
        opacity: earned ? 1 : 0.5,
      }
    ]}>
      {badge.icon_emoji && (
        <Text style={[styles.emoji, { fontSize: style.emoji }]}>
          {badge.icon_emoji}
        </Text>
      )}
      {badge.title_fr && (
        <Text 
          style={[
            styles.title,
            { fontSize: style.text, color: earned ? colors.gold : colors.muted }
          ]}
          numberOfLines={2}
        >
          {badge.title_fr}
        </Text>
      )}
      {earned && (
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
          <Text style={styles.rarityText}>
            {badge.rarity?.toUpperCase() || 'COMMON'}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.leather,
    borderRadius: 12,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  emoji: {
    marginBottom: 4,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  rarityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    color: colors.bg,
    fontSize: 8,
    fontWeight: 'bold',
  },
});

