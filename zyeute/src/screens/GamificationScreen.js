import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useGamification } from '../contexts/GamificationContext';
import * as gamificationService from '../lib/services/gamificationService';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import PointsDisplay from '../components/Gamification/PointsDisplay';
import LevelProgress from '../components/Gamification/LevelProgress';
import BadgeCard from '../components/Gamification/BadgeCard';
import StreakDisplay from '../components/Gamification/StreakDisplay';

/**
 * Gamification Screen - Full profile of user's points, badges, streaks
 */
export default function GamificationScreen() {
  const { userStats, userBadges, refreshStats } = useGamification();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'badges', 'leaderboard'
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('all_time');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab, leaderboardType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await gamificationService.getLeaderboard(leaderboardType, 100);
    setLeaderboard(data);
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'grid' },
    { id: 'badges', label: 'Badges', icon: 'trophy' },
    { id: 'leaderboard', label: 'Classement', icon: 'podium' },
  ];

  const leaderboardTypes = [
    { id: 'all_time', label: 'Tous les temps' },
    { id: 'weekly', label: 'Cette semaine' },
    { id: 'monthly', label: 'Ce mois' },
    { id: 'streak', label: 'Streaks' },
  ];

  if (!userStats) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gamification</Text>
        <Text style={styles.headerSubtitle}>Tes stats et accomplissements</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? colors.gold : colors.lightLeather}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View style={styles.overview}>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <PointsDisplay points={userStats.total_points} size="large" />
              </View>
              
              <View style={styles.statCard}>
                <StreakDisplay
                  streak={userStats.current_streak}
                  longestStreak={userStats.longest_streak}
                  size="large"
                />
              </View>
            </View>

            {/* Level Progress */}
            <View style={styles.section}>
              <LevelProgress stats={userStats} showTitle={true} />
            </View>

            {/* Engagement Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Engagement</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.posts_count || 0}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.reactions_received || 0}</Text>
                  <Text style={styles.statLabel}>Réactions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.comments_count || 0}</Text>
                  <Text style={styles.statLabel}>Commentaires</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.followers_count || 0}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
              </View>
            </View>

            {/* Recent Badges */}
            {userBadges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Badges récents</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {userBadges.slice(0, 5).map((userBadge) => (
                    <BadgeCard
                      key={userBadge.id}
                      badge={userBadge.badges}
                      earned={true}
                      size="medium"
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={styles.badgesContainer}>
            {userBadges.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucun badge gagné</Text>
                <Text style={styles.emptySubtext}>
                  Continue à publier et interagir pour gagner des badges!
                </Text>
              </View>
            ) : (
              <FlatList
                data={userBadges}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <BadgeCard
                    badge={item.badges}
                    earned={true}
                    size="large"
                  />
                )}
                contentContainerStyle={styles.badgesGrid}
              />
            )}
          </View>
        )}

        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardContainer}>
            {/* Leaderboard Type Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.leaderboardTypes}
            >
              {leaderboardTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.leaderboardTypeButton,
                    leaderboardType === type.id && styles.leaderboardTypeButtonActive
                  ]}
                  onPress={() => setLeaderboardType(type.id)}
                >
                  <Text
                    style={[
                      styles.leaderboardTypeText,
                      leaderboardType === type.id && styles.leaderboardTypeTextActive
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Leaderboard List */}
            {loading ? (
              <ActivityIndicator size="large" color={colors.gold} style={styles.loader} />
            ) : leaderboard.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucun classement disponible</Text>
              </View>
            ) : (
              <FlatList
                data={leaderboard}
                keyExtractor={(item) => item.user_id}
                renderItem={({ item, index }) => (
                  <View style={styles.leaderboardItem}>
                    <View style={styles.rankContainer}>
                      <Text style={styles.rank}>
                        {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.username}>
                        {item.user_profiles?.username || item.user_profiles?.display_name || 'Utilisateur'}
                      </Text>
                      <Text style={styles.userPoints}>
                        {leaderboardType === 'streak' 
                          ? `${item.current_streak} jours` 
                          : `${leaderboardType === 'weekly' ? item.weekly_points : leaderboardType === 'monthly' ? item.monthly_points : item.total_points} points`}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.leather,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.lightLeather,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.leather,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
  },
  tabLabel: {
    color: colors.lightLeather,
    fontSize: 14,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.gold,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  overview: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.leather,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.leather,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.lightLeather,
  },
  badgesContainer: {
    padding: 16,
  },
  badgesGrid: {
    padding: 8,
  },
  leaderboardContainer: {
    padding: 16,
  },
  leaderboardTypes: {
    marginBottom: 16,
  },
  leaderboardTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.leather,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  leaderboardTypeButtonActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  leaderboardTypeText: {
    color: colors.lightLeather,
    fontSize: 12,
    fontWeight: '600',
  },
  leaderboardTypeTextActive: {
    color: colors.bg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.leather,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gold,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 4,
  },
  userPoints: {
    fontSize: 14,
    color: colors.lightLeather,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.lightLeather,
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
  loadingText: {
    color: colors.gold,
    marginTop: 12,
  },
});

