import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Dimensions, 
  TouchableWithoutFeedback, 
  StyleSheet, 
  Image, 
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ReactionBar from '../components/ReactionBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Component for individual post (full screen with frame-by-frame) ---
const PostItem = ({ post, onNextPost, onPreviousPost }) => {
  const horizontalListRef = useRef(null);
  const verticalFeedRef = useRef(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isHorizontalScrolling, setIsHorizontalScrolling] = useState(false);

  // Convert post to media frames format
  // If post has multiple media, create frames; otherwise single frame
  const mediaFrames = post.media_url 
    ? [{ 
        type: post.media_url.includes('.mp4') || post.media_url.includes('.mov') ? 'video' : 'image',
        url: post.imageUrl || post.media_url,
        caption_joual: post.content || ''
      }]
    : [{ 
        type: 'text',
        caption_joual: post.content || 'Pas de contenu'
      }];

  const handleTapToAdvance = () => {
    if (isHorizontalScrolling) return; // Don't interfere with horizontal swipe

    if (currentFrameIndex < mediaFrames.length - 1) {
      // Frame-by-frame: Scroll to next frame in horizontal list
      const nextIndex = currentFrameIndex + 1;
      horizontalListRef.current?.scrollToIndex({ 
        index: nextIndex, 
        animated: true 
      });
      setCurrentFrameIndex(nextIndex);
    } else {
      // End of post frames: Advance to next post (vertical scroll)
      onNextPost();
    }
  };

  const handleFrameChange = (index) => {
    setCurrentFrameIndex(index);
  };

  // Track horizontal scroll state
  const handleHorizontalScrollBegin = () => {
    setIsHorizontalScrolling(true);
  };

  const handleHorizontalScrollEnd = () => {
    setTimeout(() => setIsHorizontalScrolling(false), 100);
  };

  return (
    <View style={{ height: SCREEN_HEIGHT, backgroundColor: colors.bg }}>
      <TouchableWithoutFeedback onPress={handleTapToAdvance}>
        <View style={{ flex: 1 }}>
          {/* Inner Horizontal Frame List (Instagram Stories-style) */}
          <FlatList
            ref={horizontalListRef}
            data={mediaFrames}
            keyExtractor={(item, index) => `frame-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={mediaFrames.length > 1}
            onViewableItemsChanged={(info) => {
              if (info.viewableItems.length > 0) {
                const index = info.viewableItems[0].index;
                handleFrameChange(index);
              }
            }}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            onScrollBeginDrag={handleHorizontalScrollBegin}
            onScrollEndDrag={handleHorizontalScrollEnd}
            onMomentumScrollEnd={handleHorizontalScrollEnd}
            renderItem={({ item, index }) => (
              <View style={{ 
                width: SCREEN_WIDTH, 
                height: SCREEN_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.bg
              }}>
                {/* Media Content */}
                {item.type === 'image' && item.url ? (
                  <Image 
                    source={{ uri: item.url }}
                    style={styles.fullScreenMedia}
                    resizeMode="cover"
                  />
                ) : item.type === 'video' && item.url ? (
                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="play-circle" size={80} color={colors.gold} />
                    <Text style={styles.videoLabel}>VIDÉO</Text>
                  </View>
                ) : (
                  <View style={styles.textPlaceholder}>
                    <Text style={styles.textContent}>{item.caption_joual}</Text>
                  </View>
                )}

                {/* Caption Overlay */}
                {item.caption_joual && (
                  <View style={styles.captionOverlay}>
                    <Text style={styles.captionText}>{item.caption_joual}</Text>
                  </View>
                )}

                {/* User Info Overlay */}
                <View style={styles.userOverlay}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {post.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.username}>{post.username || 'Utilisateur'}</Text>
                    <Text style={styles.timestamp}>
                      {new Date(post.created_at).toLocaleDateString('fr-CA', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Text>
                  </View>
                </View>

                {/* Actions Overlay (Right Side) */}
                <View style={styles.actionsOverlay}>
                  <ReactionBar 
                    publicationId={post.id}
                    style={styles.reactionBarVertical}
                  />
                  <TouchableWithoutFeedback 
                    onPress={() => {/* Navigate to comments */}}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons name="chatbubble" size={28} color={colors.gold} />
                      <Text style={styles.actionCount}>{post.comments_count || 0}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback>
                    <View style={styles.actionIcon}>
                      <Ionicons name="share-social" size={28} color={colors.gold} />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            )}
          />

          {/* Frame Progress Indicator (Top) */}
          {mediaFrames.length > 1 && (
            <View style={styles.frameIndicator}>
              {mediaFrames.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.frameProgressBar,
                    { 
                      flex: 1,
                      opacity: index === currentFrameIndex ? 1 : 0.3,
                      backgroundColor: index <= currentFrameIndex ? colors.gold : 'rgba(255,255,255,0.5)'
                    }
                  ]} 
                />
              ))}
            </View>
          )}

          {/* Tap Indicator (Bottom Center) */}
          <View style={styles.tapIndicator}>
            <Text style={styles.tapHint}>
              {currentFrameIndex < mediaFrames.length - 1 
                ? 'Tape pour avancer' 
                : 'Tape pour le prochain post'}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

// --- Main Vertical Feed (TikTok-style continuous scroll) ---
const FeedScreenTikTok = () => {
  const navigation = useNavigation();
  const verticalListRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      
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
            email,
            username,
            display_name
          )
        `)
        .eq('est_masque', false)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50); // Load more for smooth scrolling

      if (error) {
        console.error('Error fetching feed:', error);
        return;
      }

      // Get signed URLs for images
      const { data: { user } } = await supabase.auth.getUser();
      const postsWithImages = await Promise.all(
        (data || []).map(async (post) => {
          let imageUrl = null;
          if (post.media_url) {
            const { data: signedData } = await supabase.storage
              .from('publications')
              .createSignedUrl(post.media_url, 3600);
            imageUrl = signedData?.signedUrl;
          }
          
          return {
            ...post,
            imageUrl,
            username: post.user_profiles?.username || 
                     post.user_profiles?.display_name || 
                     post.user_profiles?.email?.split('@')[0] || 
                     'Utilisateur',
          };
        })
      );

      setPosts(postsWithImages);
    } catch (err) {
      console.error('Error in fetchFeed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      const nextIndex = currentPostIndex + 1;
      verticalListRef.current?.scrollToIndex({ 
        index: nextIndex, 
        animated: true 
      });
      setCurrentPostIndex(nextIndex);
    }
  };

  const handlePreviousPost = () => {
    if (currentPostIndex > 0) {
      const prevIndex = currentPostIndex - 1;
      verticalListRef.current?.scrollToIndex({ 
        index: prevIndex, 
        animated: true 
      });
      setCurrentPostIndex(prevIndex);
    }
  };

  const handleViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentPostIndex(index);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.gold} />
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
      <FlatList
        ref={verticalListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostItem 
            post={item} 
            onNextPost={handleNextPost}
            onPreviousPost={handlePreviousPost}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  videoPlaceholder: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.leather,
  },
  videoLabel: {
    color: colors.gold,
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  textPlaceholder: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.leather,
  },
  textContent: {
    color: colors.gold,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 8,
  },
  captionText: {
    color: colors.gold,
    fontSize: 16,
    lineHeight: 22,
  },
  userOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.bg,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.lightLeather,
  },
  actionsOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
  },
  reactionBarVertical: {
    marginBottom: 20,
  },
  actionIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionCount: {
    color: colors.gold,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  frameIndicator: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    height: 3,
    gap: 4,
  },
  frameProgressBar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  tapIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapHint: {
    color: 'rgba(245, 200, 66, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    color: colors.gold,
    marginTop: 12,
    fontSize: 16,
  },
  emptyText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.lightLeather,
    fontSize: 14,
  },
});

export default FeedScreenTikTok;

