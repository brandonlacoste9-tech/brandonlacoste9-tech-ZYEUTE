/**
 * VideoCard - Display video/photo posts in feed
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { PlayButton } from '../ui/Button';
import { formatNumber, formatDuration } from '../../lib/utils';
import type { Post } from '../../types';
import { cn } from '../../lib/utils';

export interface VideoCardProps {
  post: Post;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({ post, className }) => {
  const isVideo = post.type === 'video';

  return (
    <Link
      to={`/post/${post.id}`}
      className={cn(
        'group relative block rounded-xl overflow-hidden bg-gray-900',
        'transition-all duration-300 hover:scale-105',
        'edge-hover',
        'border border-white/10',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] overflow-hidden">
        <img
          src={post.media_url}
          alt={post.caption || 'Post'}
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button for videos */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayButton size={64} />
          </div>
        )}

        {/* Fire count badge */}
        {post.fire_count > 0 && (
          <div className="absolute top-3 right-3 glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="text-orange-500 text-sm">🔥</span>
            <span className="text-white text-sm font-semibold">
              {formatNumber(post.fire_count)}
            </span>
          </div>
        )}

        {/* Duration badge (videos only) */}
        {isVideo && (
          <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded-lg">
            <span className="text-white text-xs font-mono">
              {formatDuration(120)} {/* TODO: Get actual duration */}
            </span>
          </div>
        )}

        {/* Author info */}
        {post.user && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Avatar
              src={post.user.avatar_url}
              alt={post.user.display_name || post.user.username}
              size="sm"
              isVerified={post.user.is_verified}
            />
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold">
                {post.user.display_name || post.user.username}
              </span>
              {post.city && (
                <span className="text-white/70 text-xs">
                  {post.city}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Caption and Play Now CTA */}
      <div className="p-4 space-y-3">
        {post.caption && (
          <p className="text-white text-sm line-clamp-2 leading-relaxed">
            {post.caption}
          </p>
        )}
        
        {/* Play Now Button - Matches Mockup */}
        <button 
          className="w-full py-2.5 px-4 bg-gold-gradient text-black font-semibold rounded-xl hover:scale-105 transition-transform shadow-gold flex items-center justify-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            // Handle play action
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play Now
        </button>
      </div>
    </Link>
  );
};

/**
 * VideoCard Skeleton for loading states
 */
export const VideoCardSkeleton: React.FC = () => (
  <div className="rounded-xl overflow-hidden bg-gray-900 animate-pulse">
    <div className="aspect-[9/16] bg-gray-800" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-800 rounded w-3/4" />
      <div className="h-4 bg-gray-800 rounded w-1/2" />
    </div>
  </div>
);
