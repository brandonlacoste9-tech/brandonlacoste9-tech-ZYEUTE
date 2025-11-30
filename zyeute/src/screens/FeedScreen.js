import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReactionBar from '../components/ReactionBar';
import { 
  subscribeToAuthorPublications, 
  subscribeToComments, 
  subscribeToReactions,
  unsubscribe,
  initializeRealtimeAuth 
} from '../lib/realtime';

export default function FeedScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const channelsRef = useRef([]); // Store all active channels for cleanup

  const fetchFeed = async () => {
    try {
      setLoading(true);
      
      // Fetch publications visible to current user (RLS handles filtering)
      const { data, error } = await supabase
        .from('publications')
        .select(`
          id,
          user_id,
          content,
          media_url,
          visibilite,
          created_at,
          est_masque,
          deleted_at,
          comments_count,
          reactions_count,
          user_profiles:user_id (
            id,
            email
          )
        `)
        .eq('est_masque', false)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching feed:', error);
        return;
      }

      // Fetch reactions to check if user reacted
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const publicationIds = data.map(p => p.id);
        const { data: userReactions } = await supabase
          .from('reactions')
          .select('publication_id')
          .eq('user_id', user.id)
          .in('publication_id', publicationIds);

        const reactedIds = new Set(userReactions?.map(r => r.publication_id) || []);

        // Fetch signed URLs for images
        const postsWithImages = await Promise.all(
          data.map(async (post) => {
            let imageUrl = null;
            if (post.media_url) {
              // Get signed URL (60 seconds expiry, extend as needed)
              const { data: signedData, error: urlError } = await supabase.storage
                .from('publications')
                .createSignedUrl(post.media_url, 3600); // 1 hour expiry
              
              if (!urlError && signedData) {
                imageUrl = signedData.signedUrl;
              }
            }
            
            return {
              ...post,
              reacted_by_me: reactedIds.has(post.id),
              username: post.user_profiles?.email?.split('@')[0] || 'Utilisateur',
              imageUrl,
            };
          })
        );

        setPosts(postsWithImages);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.error('Error in fetchFeed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initialize Realtime auth and fetch feed
    const setupRealtime = async () => {
      await initializeRealtimeAuth();
      await fetchFeed();
    };
    
    setupRealtime();

    // Cleanup subscriptions on unmount
    return () => {
      channelsRef.current.forEach(channel => unsubscribe(channel));
      channelsRef.current = [];
    };
  }, []);

  // Subscribe to realtime updates for visible posts
  useEffect(() => {
    if (posts.length === 0) return;

    // Get unique author IDs from posts
    const authorIds = [...new Set(posts.map(p => p.user_id))];
    
    // Subscribe to publications from each author
    authorIds.forEach(authorId => {
      console.log(`[Realtime] Subscribing to publication:${authorId}:changes`);
      const channel = subscribeToAuthorPublications(authorId, (eventType, payload) => {
        handlePublicationUpdate(eventType, payload);
      });
      channelsRef.current.push(channel);
    });

    // Subscribe to comments and reactions for each visible post
    posts.forEach(post => {
      // Comments subscription
      console.log(`[Realtime] Subscribing to comments:${post.id}:changes`);
      const commentsChannel = subscribeToComments(post.id, (eventType, payload) => {
        handleCommentUpdate(post.id, eventType, payload);
      });
      channelsRef.current.push(commentsChannel);

      // Reactions subscription
      console.log(`[Realtime] Subscribing to reactions:${post.id}:changes`);
      const reactionsChannel = subscribeToReactions(post.id, (eventType, payload) => {
        handleReactionUpdate(post.id, eventType, payload);
      });
      channelsRef.current.push(reactionsChannel);
    });

    // Cleanup function
    return () => {
      channelsRef.current.forEach(channel => unsubscribe(channel));
      channelsRef.current = [];
    };
  }, [posts.length]); // Re-subscribe when posts change

  const handlePublicationUpdate = async (eventType, payload) => {
    console.log(`[Realtime] Publication ${eventType}:`, payload);
    const { record, old_record } = payload;
    
    if (eventType === 'INSERT') {
      // New post - fetch signed URL and add to top of feed
      if (record && !record.est_masque && !record.deleted_at) {
        let imageUrl = null;
        if (record.media_url) {
          const { data: signedData } = await supabase.storage
            .from('publications')
            .createSignedUrl(record.media_url, 3600);
          imageUrl = signedData?.signedUrl;
        }
        
        // Get username from user_profiles if available
        const { data: { user } } = await supabase.auth.getUser();
        const username = record.user_profiles?.email?.split('@')[0] || 'Utilisateur';
        
        const newPost = {
          ...record,
          imageUrl,
          username,
          reacted_by_me: false,
        };
        
        setPosts(currentPosts => [newPost, ...currentPosts].slice(0, 20));
      }
    } else if (eventType === 'UPDATE') {
      // Update existing post
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === record.id ? { ...post, ...record } : post
        )
      );
    } else if (eventType === 'DELETE') {
      // Remove deleted post
      setPosts(currentPosts => 
        currentPosts.filter(post => post.id !== old_record.id)
      );
    }
  };

  const handleCommentUpdate = (publicationId, eventType, payload) => {
    console.log(`[Realtime] Comment ${eventType} on publication ${publicationId}:`, payload);
    setPosts(currentPosts => {
      return currentPosts.map(post => {
        if (post.id === publicationId) {
          if (eventType === 'INSERT') {
            return { ...post, comments_count: (post.comments_count || 0) + 1 };
          } else if (eventType === 'DELETE') {
            return { ...post, comments_count: Math.max(0, (post.comments_count || 0) - 1) };
          }
        }
        return post;
      });
    });
  };

  const handleReactionUpdate = (publicationId, eventType, payload) => {
    console.log(`[Realtime] Reaction ${eventType} on publication ${publicationId}:`, payload);
    setPosts(currentPosts => {
      return currentPosts.map(post => {
        if (post.id === publicationId) {
          if (eventType === 'INSERT') {
            return { ...post, reactions_count: (post.reactions_count || 0) + 1 };
          } else if (eventType === 'DELETE') {
            return { ...post, reactions_count: Math.max(0, (post.reactions_count || 0) - 1) };
          }
        }
        return post;
      });
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#F5C842" />
        <Text style={styles.loadingText}>Chargement du feed...</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Aucun post pour le moment 🔥</Text>
        <Text style={styles.emptySubtext}>Soyez le premier à publier!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.feed}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F5C842"
          />
        }
      >
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Header */}
            <TouchableOpacity
              style={styles.postHeader}
              onPress={() => navigation.navigate('Profile', { userId: post.user_id })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.postInfo}>
                <Text style={styles.username}>{post.username}</Text>
                <Text style={styles.location}>
                  {new Date(post.created_at).toLocaleDateString('fr-CA', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Image */}
            {post.imageUrl ? (
              <Image 
                source={{ uri: post.imageUrl }} 
                style={styles.postImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>🖼️ Pas d'image</Text>
              </View>
            )}

            {/* Caption */}
            <Text style={styles.caption}>{post.content}</Text>

            {/* Reactions */}
            <ReactionBar 
              publicationId={post.id}
              style={styles.reactionBar}
              onCountsChange={(counts) => {
                // Update post reaction count if needed
                const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === post.id ? { ...p, reactions_count: total } : p
                  )
                );
              }}
            />

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Comments', { publicationId: post.id })}
              >
                <Text style={styles.actionText}>💬 {post.comments_count || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>↗️ Partager</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
  feed: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#2A1F16', // Dark leather
    marginBottom: 16,
    borderBottomColor: '#F5C842', // Gold
    borderBottomWidth: 1,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5C842', // Gold
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A1F16', // Dark leather
  },
  postInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F5C842', // Gold
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#B8A890', // Light leather
  },
  imagePlaceholder: {
    height: 300,
    backgroundColor: '#3A2B1F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#F5C842',
    borderWidth: 1,
  },
  placeholderText: {
    fontSize: 24,
    color: '#8B7355',
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#3A2B1F',
  },
  caption: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#F5C842', // Gold
    fontSize: 14,
    fontWeight: '600',
  },
  reactedText: {
    color: '#FF6B6B', // Red when reacted
  },
  reactionBar: {
    marginTop: 8,
    marginBottom: 8,
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
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#B8A890',
    fontSize: 14,
  },
});
