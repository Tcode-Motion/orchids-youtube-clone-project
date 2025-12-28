"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Masthead from '@/components/sections/masthead';
import Sidebar from '@/components/sections/sidebar';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel } from '@/lib/supabase/types';
import { CheckCircle2, MoreVertical, Lock, Globe, Shuffle, Play, Pencil, Share2, Download, MoreHorizontal, Clock, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface VideoWithChannel extends Video {
  channel: Channel;
}

function formatViews(views: number): string {
  if (views >= 1000000000) return (views / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (views >= 1000000) return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return views.toString();
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

function PlaylistContent() {
  const searchParams = useSearchParams();
  const listId = searchParams.get('list');
  
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const isWatchLater = listId === 'WL';
  const isLikedVideos = listId === 'LL';

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        if (isWatchLater) {
          const { data } = await supabase
            .from('watch_later')
            .select(`video:videos(*, channel:channels(*))`)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (data) {
              setVideos(data.map((item: unknown) => (item as { video: VideoWithChannel }).video));
            }
          } else if (isLikedVideos) {
            const { data } = await supabase
              .from('video_likes')
              .select(`video:videos(*, channel:channels(*))`)
              .eq('user_id', user.id)
              .eq('is_like', true)
              .order('created_at', { ascending: false });
            
            if (data) {
              setVideos(data.map((item: unknown) => (item as { video: VideoWithChannel }).video));
          }
        }
      } else {
        const { data } = await supabase
          .from('videos')
          .select(`*, channel:channels(*)`)
          .order('view_count', { ascending: false })
          .limit(20);
        
        if (data) setVideos(data as VideoWithChannel[]);
      }
      setLoading(false);
    }

    fetchData();
  }, [listId, isWatchLater, isLikedVideos]);

  const playlistTitle = isWatchLater ? 'Watch later' : isLikedVideos ? 'Liked videos' : 'Playlist';
  const playlistIcon = isWatchLater ? <Clock size={20} /> : isLikedVideos ? <ThumbsUp size={20} /> : null;
  const totalDuration = videos.reduce((acc, v) => acc + v.duration, 0);
  const formattedTotalDuration = `${Math.floor(totalDuration / 3600)}:${String(Math.floor((totalDuration % 3600) / 60)).padStart(2, '0')}:${String(totalDuration % 60).padStart(2, '0')}`;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="flex flex-1 pt-[56px]">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-[240px] bg-[#f9f9f9]">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-[360px] bg-gradient-to-b from-[#a855f7] to-[#6366f1] p-6">
                <div className="aspect-video bg-white/20 rounded-xl animate-pulse" />
              </div>
              <div className="flex-1 p-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex gap-4 mb-4">
                    <div className="w-10 text-center text-sm text-gray-300">{i + 1}</div>
                    <div className="w-[160px] h-[90px] bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Masthead />
      <div className="flex flex-1 pt-[56px]">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-[240px] bg-[#f9f9f9]">
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
            <div className={`w-full lg:w-[360px] shrink-0 bg-gradient-to-b ${isLikedVideos ? 'from-[#065fd4] to-[#0556be]' : 'from-[#6366f1] to-[#4f46e5]'} p-6 lg:sticky lg:top-[56px] lg:h-[calc(100vh-56px)] lg:overflow-y-auto`}>
              {videos.length > 0 && (
                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                  <img 
                    src={videos[0].thumbnail_url || 'https://picsum.photos/seed/default/360/202'}
                    alt={playlistTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  {playlistIcon}
                  <h1 className="text-2xl font-bold">{playlistTitle}</h1>
                </div>
                
                {user && (
                  <p className="text-white/80 text-sm mb-2">{user.email}</p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                  {isWatchLater || isLikedVideos ? (
                    <Lock size={14} />
                  ) : (
                    <Globe size={14} />
                  )}
                  <span>{isWatchLater || isLikedVideos ? 'Private' : 'Public'}</span>
                  <span>•</span>
                  <span>{videos.length} videos</span>
                  {videos.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{formattedTotalDuration}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {videos.length > 0 && (
                    <>
                      <Link 
                        href={`/watch?v=${videos[0].id}&list=${listId}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#0f0f0f] rounded-full font-medium text-sm hover:bg-white/90"
                      >
                        <Play size={16} fill="currentColor" />
                        Play all
                      </Link>
                      <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full font-medium text-sm hover:bg-white/30">
                        <Shuffle size={16} />
                        Shuffle
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/20 rounded-full">
                    <Download size={20} />
                  </button>
                  <button className="p-2 hover:bg-white/20 rounded-full">
                    <Pencil size={20} />
                  </button>
                  <button className="p-2 hover:bg-white/20 rounded-full">
                    <Share2 size={20} />
                  </button>
                  <button className="p-2 hover:bg-white/20 rounded-full">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4">
              {!user && (
                <div className="bg-white rounded-xl p-6 mb-6">
                  <p className="text-[#606060] mb-4">Sign in to see your {playlistTitle.toLowerCase()}</p>
                  <Link href="/auth" className="px-4 py-2 bg-[#065fd4] text-white rounded-full font-medium text-sm hover:bg-[#0556be]">
                    Sign in
                  </Link>
                </div>
              )}

              {videos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#606060]">No videos in this playlist</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {videos.map((video, idx) => (
                    <Link 
                      href={`/watch?v=${video.id}&list=${listId}`}
                      key={video.id}
                      className="flex items-center gap-4 p-2 hover:bg-[#f2f2f2] rounded-lg group"
                    >
                      <span className="w-8 text-center text-sm text-[#606060]">{idx + 1}</span>
                      <div className="relative w-[160px] aspect-video rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        <img
                          src={video.thumbnail_url || 'https://picsum.photos/seed/default/160/90'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
                          {formatDuration(video.duration)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2 leading-5">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-[#606060]">{video.channel?.name}</span>
                          {video.channel?.is_verified && <CheckCircle2 size={10} className="text-[#606060]" />}
                        </div>
                        <p className="text-xs text-[#606060]">
                          {formatViews(video.view_count)} views • {timeAgo(video.published_at)}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => e.preventDefault()}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#e5e5e5] rounded-full"
                      >
                        <MoreVertical size={20} />
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="flex flex-1 pt-[56px] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    }>
      <PlaylistContent />
    </Suspense>
  );
}
