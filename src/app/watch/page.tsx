"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel, Comment } from '@/lib/supabase/types';
import Masthead from '@/components/sections/masthead';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  MoreHorizontal, 
  CheckCircle2,
  Bell,
  ChevronDown,
  ChevronUp,
  SortDesc
} from 'lucide-react';
import Link from 'next/link';

interface VideoWithChannel extends Video {
  channel: Channel;
}

function formatViews(views: number): string {
  if (views >= 1000000000) return (views / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (views >= 1000000) return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return views.toString();
}

function formatSubscribers(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return count.toString();
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return 'LIVE';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function timeAgo(date: string): string {
  const now = new Date();
  const published = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - published.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function WatchContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v');
  
  const [video, setVideo] = useState<VideoWithChannel | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!videoId) return;

    async function fetchVideo() {
      const { data: videoData } = await supabase
        .from('videos')
        .select(`*, channel:channels(*)`)
        .eq('id', videoId)
        .single();

      if (videoData) {
        setVideo(videoData as VideoWithChannel);
        
        const { data: related } = await supabase
          .from('videos')
          .select(`*, channel:channels(*)`)
          .neq('id', videoId)
          .limit(20)
          .order('view_count', { ascending: false });
        
        if (related) setRelatedVideos(related as VideoWithChannel[]);
      }
      setLoading(false);
    }

    fetchVideo();
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="pt-[56px] flex flex-col lg:flex-row gap-6 p-6 max-w-[1800px] mx-auto">
          <div className="flex-1">
            <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
            <div className="mt-3 h-6 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
          <div className="w-full lg:w-[400px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <div className="w-40 h-24 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="pt-[56px] flex items-center justify-center flex-1">
          <p className="text-gray-500">Video not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9]">
      <Masthead />
      <div className="pt-[56px] flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto w-full">
        <div className="flex-1 max-w-[1280px]">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            {video.is_live ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900 to-black">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-2xl font-bold">LIVE</span>
                  </div>
                  <p className="text-white/70">Stream is currently live</p>
                </div>
              </div>
            ) : (
              <img 
                src={video.thumbnail_url || 'https://picsum.photos/seed/default/1280/720'} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
              <div className="h-full bg-red-600 w-[35%]" />
            </div>
          </div>

          <h1 className="mt-3 text-xl font-semibold text-[#0f0f0f] leading-7">
            {video.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 pb-4 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <Link href={`/channel/${video.channel?.handle}`}>
                <img 
                  src={video.channel?.avatar_url || 'https://picsum.photos/seed/default/40/40'}
                  alt={video.channel?.name}
                  className="w-10 h-10 rounded-full"
                />
              </Link>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Link href={`/channel/${video.channel?.handle}`} className="font-medium text-[#0f0f0f] hover:underline">
                    {video.channel?.name}
                  </Link>
                  {video.channel?.is_verified && (
                    <CheckCircle2 size={14} className="text-[#606060]" />
                  )}
                </div>
                <span className="text-xs text-[#606060]">
                  {formatSubscribers(video.channel?.subscriber_count || 0)} subscribers
                </span>
              </div>
              <button 
                onClick={() => setSubscribed(!subscribed)}
                className={`ml-4 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-colors ${
                  subscribed 
                    ? 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]' 
                    : 'bg-[#0f0f0f] text-white hover:bg-[#272727]'
                }`}
              >
                {subscribed && <Bell size={16} />}
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#f2f2f2] rounded-full overflow-hidden">
                <button 
                  onClick={() => setLiked(liked === true ? null : true)}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-[#e5e5e5] transition-colors border-r border-[#ccc] ${liked === true ? 'text-[#065fd4]' : ''}`}
                >
                  <ThumbsUp size={20} fill={liked === true ? 'currentColor' : 'none'} />
                  <span className="font-medium text-sm">{formatViews(video.like_count + (liked === true ? 1 : 0))}</span>
                </button>
                <button 
                  onClick={() => setLiked(liked === false ? null : false)}
                  className={`flex items-center px-4 py-2 hover:bg-[#e5e5e5] transition-colors ${liked === false ? 'text-[#065fd4]' : ''}`}
                >
                  <ThumbsDown size={20} fill={liked === false ? 'currentColor' : 'none'} />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5] transition-colors">
                <Share2 size={20} />
                <span className="font-medium text-sm">Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5] transition-colors">
                <Download size={20} />
                <span className="font-medium text-sm">Download</span>
              </button>
              <button className="p-2 bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5] transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          <div className="mt-4 bg-[#f2f2f2] rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#0f0f0f]">
              <span>{formatViews(video.view_count)} views</span>
              <span>&middot;</span>
              <span>{formatDate(video.published_at)}</span>
            </div>
            <div className={`mt-2 text-sm text-[#0f0f0f] whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-2' : ''}`}>
              {video.description || 'No description available.'}
            </div>
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-2 text-sm font-medium text-[#0f0f0f] hover:underline flex items-center gap-1"
            >
              {showFullDescription ? (
                <>Show less <ChevronUp size={16} /></>
              ) : (
                <>Show more <ChevronDown size={16} /></>
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{formatViews(video.comment_count)} Comments</h2>
              <button className="flex items-center gap-2 text-sm font-medium text-[#0f0f0f]">
                <SortDesc size={20} />
                Sort by
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-10 h-10 bg-[#ef4444] rounded-full flex items-center justify-center text-white font-medium">
                G
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-transparent border-b border-[#e5e5e5] focus:border-[#0f0f0f] outline-none pb-2 text-sm"
                />
                {commentText && (
                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      onClick={() => setCommentText('')}
                      className="px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] rounded-full"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 text-sm font-medium bg-[#065fd4] text-white rounded-full hover:bg-[#0556be]">
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <img 
                    src={`https://picsum.photos/seed/user${i}/40/40`}
                    alt="User"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">@user{i + 1}</span>
                      <span className="text-xs text-[#606060]">{i + 1} days ago</span>
                    </div>
                    <p className="text-sm mt-1">
                      {['Great video! Really enjoyed watching this.',
                        'This is exactly what I was looking for. Thanks!',
                        'Amazing content as always. Keep it up!',
                        'I learned so much from this video.',
                        'This deserves way more views!'][i]}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="flex items-center gap-1 text-sm text-[#606060] hover:text-[#0f0f0f]">
                        <ThumbsUp size={16} />
                        <span>{Math.floor(Math.random() * 100)}</span>
                      </button>
                      <button className="text-[#606060] hover:text-[#0f0f0f]">
                        <ThumbsDown size={16} />
                      </button>
                      <button className="text-sm font-medium text-[#606060] hover:text-[#0f0f0f]">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] shrink-0">
          <div className="space-y-3">
            {relatedVideos.map((related) => (
              <Link 
                key={related.id} 
                href={`/watch?v=${related.id}`}
                className="flex gap-2 group"
              >
                <div className="relative w-40 h-[90px] rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  <img 
                    src={related.thumbnail_url || 'https://picsum.photos/seed/default/168/94'}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {related.is_live ? (
                    <span className="absolute bottom-1 left-1 bg-[#cc0000] text-white text-[10px] font-medium px-1 rounded-sm uppercase">
                      Live
                    </span>
                  ) : (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 rounded">
                      {formatDuration(related.duration)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2 leading-5">
                    {related.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-[#606060]">{related.channel?.name}</span>
                    {related.channel?.is_verified && (
                      <CheckCircle2 size={10} className="text-[#606060]" />
                    )}
                  </div>
                  <div className="text-xs text-[#606060]">
                    {formatViews(related.view_count)} views &middot; {timeAgo(related.published_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="pt-[56px] flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}
