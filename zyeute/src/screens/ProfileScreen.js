import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { supabase } from '../lib/supabase';
import { colonyOSClient } from '../../lib/services/colony-os-client';
import { codex } from '../../lib/memory/codex';
import FollowButton from '../components/FollowButton';
import { colors } from '../theme/colors';

export default function ProfileScreen({ route }) {
  // Support viewing other users' profiles via route params
  const targetUserId = route?.params?.userId || null;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [stats, setStats] = useState({
    postCount: 0,
    followers: 0,
    following: 0,
    totalReactions: 0,
    totalComments: 0,
  });
  const [sensoryModalVisible, setSensoryModalVisible] = useState(false);
  const [sensoryInput, setSensoryInput] = useState('');
  const [sensoryProcessing, setSensoryProcessing] = useState(false);
  const [sensoryResult, setSensoryResult] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User error:', userError);
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);
      const profileUserId = targetUserId || user.id;

      // Load profile (own or other user's)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profileUserId)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // If profile doesn't exist, create a basic one
        setProfile({
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'Utilisateur',
        });
      } else {
        setProfile({
          ...profileData,
          username: profileData.email?.split('@')[0] || 'Utilisateur',
        });
      }

      // Load stats
      await loadStats(profileUserId);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Es-tu sûr de vouloir te déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            // Navigation will automatically switch to AuthStack via App.js listener
          },
        },
      ]
    );
  };

  const handleTestHiveConnection = async () => {
    try {
      const result = await colonyOSClient.healthCheck();
      
      if (result.success) {
        Alert.alert(
          '✅ Succès!',
          'Le Hive est en ligne! 🐝',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Erreur',
          `Erreur de connexion au Hive.\n\n${result.error || 'Service non disponible'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Erreur',
        `Erreur de connexion au Hive.\n\n${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSensoryPulse = async () => {
    if (!sensoryInput.trim()) {
      Alert.alert('Oups', 'Écris quelque chose avant d\'envoyer!');
      return;
    }

    setSensoryProcessing(true);
    setSensoryResult(null);

    try {
      const result = await colonyOSClient.sensoryPulse(sensoryInput.trim());
      
      if (result.success) {
        setSensoryResult(result);
        
        // Level 3: Save to Memory (The Codex)
        try {
          await codex.remember({
            type: 'sensory_analysis',
            userId: currentUserId,
            content: sensoryInput.trim(),
            context: {
              category: result.category,
              sentiment: result.sentiment,
              language: result.language,
              analysis: result.analysis,
            },
            metadata: {
              source: 'sensory_pulse_test',
              confidence: result.metadata?.confidence || 0.95,
              processing_time_ms: result.metadata?.processing_time_ms || 0,
            },
          });
          
          console.log('📚 Sensory pulse result saved to The Codex');
        } catch (memoryError) {
          console.warn('⚠️  Failed to save to Codex (non-critical):', memoryError);
          // Don't show error to user - memory storage is non-critical
        }
      } else {
        // Check if it's a "not implemented" error
        const isNotImplemented = result.error?.includes('not implemented');
        Alert.alert(
          '❌ Erreur',
          isNotImplemented 
            ? `Le Hive a pas encore cette fonctionnalité.\n\nL'endpoint /sensory/pulse doit être implémenté dans le backend Colony OS.\n\nVoir COLONY_OS_BACKEND_SPEC.md pour les détails.`
            : `Le Hive a pas pu traiter ça.\n\n${result.error || 'Service non disponible'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Erreur',
        `Erreur de traitement.\n\n${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setSensoryProcessing(false);
    }
  };

  const loadStats = async (userId) => {
    try {
      // Post count
      const { count: postCount } = await supabase
        .from('publications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      // Followers count
      const { count: followers } = await supabase
        .from('abonnements')
        .select('*', { count: 'exact', head: true })
        .eq('followee_id', userId);

      // Following count
      const { count: following } = await supabase
        .from('abonnements')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      // Total reactions received
      const { data: publications } = await supabase
        .from('publications')
        .select('reactions_count')
        .eq('user_id', userId)
        .is('deleted_at', null);

      const totalReactions = publications?.reduce((sum, p) => sum + (p.reactions_count || 0), 0) || 0;

      // Total comments received
      const { data: publicationsForComments } = await supabase
        .from('publications')
        .select('comments_count')
        .eq('user_id', userId)
        .is('deleted_at', null);

      const totalComments = publicationsForComments?.reduce((sum, p) => sum + (p.comments_count || 0), 0) || 0;

      setStats({
        postCount: postCount || 0,
        followers: followers || 0,
        following: following || 0,
        totalReactions,
        totalComments,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#F5C842" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Profil non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {profile.username?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>

        <Text style={styles.username}>{profile.username}</Text>
        
        {profile.plan && profile.plan !== 'free' && (
          <View style={styles.vipBadge}>
            <Text style={styles.vipText}>👑 {profile.plan === 'pro' ? 'Pro' : profile.plan === 'business' ? 'Business' : 'VIP'}</Text>
          </View>
        )}

        <Text style={styles.bio}>
          {profile.email ? `Fier Québécois! 🔥⚜️` : 'Fier Québécois! 🔥⚜️'}
        </Text>
        {profile.email && (
          <Text style={styles.location}>📍 {profile.email}</Text>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.postCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {targetUserId && targetUserId !== currentUserId ? (
            // Viewing someone else's profile - show Follow button
            <FollowButton
              targetUserId={targetUserId}
              onChange={(following) => {
                // Refresh stats when follow state changes
                if (profile?.id) {
                  loadStats(profile.id);
                }
              }}
            />
          ) : (
            // Viewing own profile - show edit, hive test, and sign out
            <>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Modifier profil</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.hiveButton}
                onPress={handleTestHiveConnection}
              >
                <Text style={styles.hiveButtonText}>🐝 Vérifier Hive</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sensoryButton}
                onPress={() => setSensoryModalVisible(true)}
              >
                <Text style={styles.sensoryButtonText}>🧠 Pulse Sensoriel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleSignOut}
              >
                <Text style={styles.secondaryButtonText}>🚪 Déconnexion</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Quick Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Statistiques</Text>
        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatEmoji}>🔥</Text>
            <Text style={styles.quickStatNumber}>{stats.totalReactions}</Text>
            <Text style={styles.quickStatLabel}>Total Feu</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatEmoji}>💬</Text>
            <Text style={styles.quickStatNumber}>{stats.totalComments}</Text>
            <Text style={styles.quickStatLabel}>Commentaires</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatEmoji}>⚜️</Text>
            <Text style={styles.quickStatNumber}>{stats.postCount}</Text>
            <Text style={styles.quickStatLabel}>Quebec Posts</Text>
          </View>
        </View>
      </View>

      {/* Achievements Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Achievements</Text>
        <View style={styles.achievements}>
          <View style={styles.achievement}>
            <Text style={styles.achievementEmoji}>🎖️</Text>
            <Text style={styles.achievementText}>Premier Post</Text>
          </View>
          <View style={styles.achievement}>
            <Text style={styles.achievementEmoji}>🔥</Text>
            <Text style={styles.achievementText}>100 Feu Reçu</Text>
          </View>
          <View style={styles.achievement}>
            <Text style={styles.achievementEmoji}>⚜️</Text>
            <Text style={styles.achievementText}>Fier Québécois</Text>
          </View>
          <View style={styles.achievement}>
            <Text style={styles.achievementEmoji}>👑</Text>
            <Text style={styles.achievementText}>Gold VIP</Text>
          </View>
        </View>
      </View>

      {/* Recent Posts Grid Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Mes Posts</Text>
        <View style={styles.postsGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.gridItem}>
              <Text style={styles.gridPlaceholder}>🖼️</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Sensory Pulse Modal */}
      <Modal
        visible={sensoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setSensoryModalVisible(false);
          setSensoryInput('');
          setSensoryResult(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🧠 Pulse Sensoriel</Text>
            <Text style={styles.modalSubtitle}>
              Envoie un texte au Hive pour voir comment il le comprend
            </Text>

            <TextInput
              style={styles.sensoryInput}
              placeholder="Ex: Wow, check cette poutine!"
              placeholderTextColor={colors.muted}
              value={sensoryInput}
              onChangeText={setSensoryInput}
              multiline
              editable={!sensoryProcessing}
            />

            <TouchableOpacity
              style={[styles.sendButton, sensoryProcessing && styles.sendButtonDisabled]}
              onPress={handleSensoryPulse}
              disabled={sensoryProcessing}
            >
              {sensoryProcessing ? (
                <ActivityIndicator size="small" color={colors.leather} />
              ) : (
                <Text style={styles.sendButtonText}>Envoyer au Hive 🐝</Text>
              )}
            </TouchableOpacity>

            {sensoryResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>📊 Analyse du Hive:</Text>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Catégorie:</Text>
                  <Text style={styles.resultValue}>{sensoryResult.category || 'N/A'}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Sentiment:</Text>
                  <Text style={styles.resultValue}>{sensoryResult.sentiment || 'N/A'}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Langue:</Text>
                  <Text style={styles.resultValue}>{sensoryResult.language || 'N/A'}</Text>
                </View>
                {sensoryResult.analysis && Object.keys(sensoryResult.analysis).length > 0 && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Détails:</Text>
                    <Text style={styles.resultValue}>
                      {JSON.stringify(sensoryResult.analysis, null, 2)}
                    </Text>
                  </View>
                )}
                <View style={styles.memoryBadge}>
                  <Text style={styles.memoryBadgeText}>📚 Sauvegardé dans The Codex</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSensoryModalVisible(false);
                setSensoryInput('');
                setSensoryResult(null);
              }}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1410', // Very dark leather
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2A1F16', // Dark leather
    padding: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#F5C842', // Gold
    alignItems: 'center',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5C842', // Gold
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarTextLarge: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2A1F16',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5C842',
    marginBottom: 8,
  },
  vipBadge: {
    backgroundColor: '#F5C842',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  vipText: {
    color: '#2A1F16',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#B8A890',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5C842',
  },
  statLabel: {
    fontSize: 12,
    color: '#B8A890',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#8B7355',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    flexWrap: 'wrap',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#F5C842',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#2A1F16',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F5C842',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#F5C842',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hiveButton: {
    flex: 1,
    backgroundColor: '#8B7355',
    borderWidth: 1,
    borderColor: '#F5C842',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  hiveButtonText: {
    color: '#F5C842',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sensoryButton: {
    flex: 1,
    backgroundColor: '#8B7355',
    borderWidth: 1,
    borderColor: '#F5C842',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  sensoryButtonText: {
    color: '#F5C842',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2A1F16',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#F5C842',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5C842',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#B8A890',
    marginBottom: 20,
    textAlign: 'center',
  },
  sensoryInput: {
    backgroundColor: '#1A1410',
    borderWidth: 1,
    borderColor: '#F5C842',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#F5C842',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#2A1F16',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#1A1410',
    borderWidth: 1,
    borderColor: '#F5C842',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5C842',
    marginBottom: 12,
  },
  resultItem: {
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#B8A890',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F5C842',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#F5C842',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memoryBadge: {
    backgroundColor: '#1A1410',
    borderWidth: 1,
    borderColor: '#F5C842',
    borderRadius: 6,
    padding: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  memoryBadgeText: {
    color: '#F5C842',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5C842',
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatCard: {
    backgroundColor: '#2A1F16',
    borderWidth: 1,
    borderColor: '#F5C842',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickStatEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5C842',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#B8A890',
    textAlign: 'center',
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievement: {
    backgroundColor: '#2A1F16',
    borderWidth: 1,
    borderColor: '#F5C842',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '22%',
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 10,
    color: '#B8A890',
    textAlign: 'center',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridItem: {
    width: '32%',
    aspectRatio: 1,
    backgroundColor: '#2A1F16',
    borderWidth: 1,
    borderColor: '#F5C842',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPlaceholder: {
    fontSize: 32,
  },
  loadingText: {
    color: '#F5C842',
    marginTop: 12,
    fontSize: 16,
  },
  emptyText: {
    color: '#F5C842',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
