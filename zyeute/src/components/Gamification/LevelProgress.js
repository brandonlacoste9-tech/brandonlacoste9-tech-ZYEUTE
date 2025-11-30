import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { calculateLevelProgress, getLevelTitle } from '../../lib/services/gamificationService';

/**
 * Level progress bar with Fur Trader Luxury styling
 */
export default function LevelProgress({ stats, showTitle = true }) {
  if (!stats) return null;

  const progress = calculateLevelProgress(stats);
  const levelTitle = getLevelTitle(stats.current_level);

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <Text style={styles.levelText}>
            Niveau {stats.current_level} - {levelTitle}
          </Text>
          <Text style={styles.xpText}>
            {stats.total_points} / {stats.xp_to_next_level + stats.total_points} XP
          </Text>
        </View>
      )}
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${progress}%` }
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  xpText: {
    color: colors.lightLeather,
    fontSize: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.leather,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  progressBarBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.leather,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 4,
  },
});

