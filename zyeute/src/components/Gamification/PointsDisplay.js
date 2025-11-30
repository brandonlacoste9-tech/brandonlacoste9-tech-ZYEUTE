import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { formatPoints } from '../../lib/services/gamificationService';

/**
 * Display user points with Fur Trader Luxury styling
 */
export default function PointsDisplay({ points, size = 'medium', showLabel = true }) {
  const sizeStyles = {
    small: { fontSize: 14, iconSize: 16 },
    medium: { fontSize: 18, iconSize: 20 },
    large: { fontSize: 24, iconSize: 28 },
  };

  const style = sizeStyles[size] || sizeStyles.medium;

  return (
    <View style={styles.container}>
      <Text style={[styles.points, { fontSize: style.fontSize }]}>
        🔥 {formatPoints(points || 0)}
      </Text>
      {showLabel && (
        <Text style={styles.label}>Points</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  points: {
    color: colors.gold,
    fontWeight: 'bold',
  },
  label: {
    color: colors.lightLeather,
    fontSize: 10,
    marginTop: 2,
  },
});

