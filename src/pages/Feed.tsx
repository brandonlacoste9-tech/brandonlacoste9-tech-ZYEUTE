/**
 * Feed Page - Main home page with stories and video grid
 */

import React from 'react';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { StoryCarousel } from '../components/features/StoryCircle';
import { StoryViewer } from '../components/features/StoryViewer';
import { FeedGrid } from '../components/layout/FeedGrid';
import { supabase } from '../lib/supabase';
import type { Post, User, Story } from '../types';

export const Feed: React.FC = () => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [stories, setStories] = React.useState<Array<{ user: User; story?: Story; isViewed?: boolean }>>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [viewerStories, setViewerStories] = React.useState<Story[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = React.useState(0);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);

  // Fetch current user
  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) setCurrentUser(data);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch posts
  const fetchPosts = React.useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(*),
          user_fire:fires(fire_level)
        `)
        .order('created_at', { ascending: false })
        .range(pageNum * 20, (pageNum + 1) * 20 - 1);

      if (error) throw error;

      if (data) {
        if (pageNum === 0) {
          setPosts(data);
        } else {
          setPosts(prev => [...prev, ...data]);
        }
        setHasMore(data.length === 20);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch stories
  React.useEffect(() => {
    const fetchStories = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch active stories (not expired)
        const { data, error } = await supabase
          .from('stories')
          .select('*, user:users(*)')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching stories:', error);
          return;
        }

        if (data) {
          // Group stories by user
          const storyMap = new Map<string, { user: User; story: Story; isViewed: boolean }>();
          
          data.forEach((story) => {
            if (story.user && !storyMap.has(story.user.id)) {
              storyMap.set(story.user.id, {
                user: story.user,
                story: story as Story,
                isViewed: false, // TODO: Track viewed stories in local storage or DB
              });
            }
          });

          setStories(Array.from(storyMap.values()));
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();

    // Subscribe to new stories
    const channel = supabase
      .channel('stories_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stories',
        },
        () => {
          // Refresh stories when new one is added
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial load
  React.useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  // Subscribe to real-time updates
  React.useEffect(() => {
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          // Add new post to feed
          setPosts(prev => [payload.new as Post, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  // Handle story click
  const handleStoryClick = (stories: Story[], startIndex: number) => {
    setViewerStories(stories);
    setViewerInitialIndex(startIndex);
    setIsViewerOpen(true);
  };

  // Handle story viewer close
  const handleViewerClose = () => {
    setIsViewerOpen(false);
    setViewerStories([]);
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <Header showSearch={true} />

      {/* Stories */}
      {stories.length > 0 && (
        <StoryCarousel
          stories={stories}
          currentUser={currentUser || undefined}
          onStoryClick={handleStoryClick}
          className="border-b border-white/10"
        />
      )}

      {/* Story Viewer */}
      {isViewerOpen && viewerStories.length > 0 && (
        <StoryViewer
          stories={viewerStories}
          initialIndex={viewerInitialIndex}
          onClose={handleViewerClose}
        />
      )}

      {/* Feed Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <FeedGrid
          posts={posts}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Feed;
