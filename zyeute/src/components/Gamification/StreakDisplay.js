import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

/**
 * Streak display with Fur Trader Luxury styling
 */
export default function StreakDisplay({ streak, longestStreak, size = 'medium' }) {
  const sizeStyles = {
    small: { fontSize: 14, iconSize: 16 },
    medium: { fontSize: 18, iconSize: 20 },
    large: { fontSize: 24, iconSize: 28 },
  };

  const style = sizeStyles[size] || sizeStyles.medium;

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={[styles.streakIcon, { fontSize: style.iconSize }]}>🔥</Text>
        <Text style={[styles.streakText, { fontSize: style.fontSize }]}>
          {streak || 0} jours
        </Text>
      </View>
      {longestStreak > streak && (
        <Text style={styles.longestStreak}>
          Record: {longestStreak} jours
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakIcon: {
    marginRight: 4,
  },
  streakText: {
    color: colors.gold,
    fontWeight: 'bold',
  },
  longestStreak: {
    color: colors.lightLeather,
    fontSize: 10,
    marginTop: 2,
  },
});

