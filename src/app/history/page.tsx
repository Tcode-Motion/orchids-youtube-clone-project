"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel } from '@/lib/supabase/types';
import { CheckCircle2, MoreVertical, Trash2, Pause, Search, X } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface VideoWithChannel extends Video {
  channel: Channel;
}

interface WatchHistoryItem {
  id: string;
  video_id: string;
  watched_at: string;
  watch_duration: number;
  video: VideoWithChannel;
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
  const watched = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - watched.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
      async function fetchData() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const targetUserId = user?.id || '2729c72f-38ab-41a4-bccb-4ae5b9493c10';

        const { data: historyData } = await supabase
          .from('watch_history')
          .select(`
            *,
            video:videos(*, channel:channels(*))
          `)
          .eq('user_id', targetUserId)
          .order('watched_at', { ascending: false });

        if (historyData) {
          setHistory(historyData as WatchHistoryItem[]);
        }
        
        setLoading(false);
      }

      fetchData();
    }, []);

  const displayVideos = user ? history.map(h => h.video) : videos;
  const filteredVideos = displayVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.channel?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-[#f9f9f9] min-h-screen p-6">
        <div className="max-w-[1096px] mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-4">
              <div className="w-[246px] h-[138px] bg-gray-200 rounded-xl animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] min-h-screen">
      <div className="max-w-[1096px] mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Watch history</h1>
            
            {!user && (
              <div className="bg-white rounded-xl p-6 mb-6">
                <p className="text-[#606060] mb-4">Sign in to see your watch history</p>
                <Link href="/auth" className="px-4 py-2 bg-[#065fd4] text-white rounded-full font-medium text-sm hover:bg-[#0556be]">
                  Sign in
                </Link>
              </div>
            )}

            {filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#606060]">
                  {searchQuery ? 'No videos match your search' : 'Your watch history is empty'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map((video, idx) => (
                  <Link 
                    href={`/watch?v=${video.id}`} 
                    key={`${video.id}-${idx}`}
                    className="flex gap-4 group"
                  >
                    <div className="relative w-[246px] aspect-video rounded-xl overflow-hidden bg-gray-200 shrink-0">
                      <img
                        src={video.thumbnail_url || 'https://picsum.photos/seed/default/246/138'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="text-base font-medium text-[#0f0f0f] line-clamp-2 leading-5 pr-6">
                          {video.title}
                        </h3>
                        <button 
                          onClick={(e) => e.preventDefault()}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#e5e5e5] rounded-full h-fit"
                        >
                          <MoreVertical size={20} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-[#606060]">{video.channel?.name}</span>
                        {video.channel?.is_verified && <CheckCircle2 size={12} className="text-[#606060]" />}
                      </div>
                      <p className="text-xs text-[#606060] mt-1">
                        {formatViews(video.view_count)} views
                      </p>
                      {user && history[idx] && (
                        <p className="text-xs text-[#606060] mt-1">
                          Watched {timeAgo(history[idx].watched_at)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[300px] shrink-0">
            <div className="sticky top-[80px]">
              <div className="relative mb-6">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search watch history"
                  className="w-full pl-10 pr-10 py-2 border border-[#e5e5e5] rounded-full text-sm focus:outline-none focus:border-[#065fd4]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X size={20} className="text-[#606060]" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <button className="flex items-center gap-4 w-full p-3 hover:bg-[#f2f2f2] rounded-lg transition-colors">
                  <Trash2 size={20} className="text-[#606060]" />
                  <span className="text-sm">Clear all watch history</span>
                </button>
                <button className="flex items-center gap-4 w-full p-3 hover:bg-[#f2f2f2] rounded-lg transition-colors">
                  <Pause size={20} className="text-[#606060]" />
                  <span className="text-sm">Pause watch history</span>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                <h3 className="font-medium mb-4">Manage all history</h3>
                <p className="text-xs text-[#606060]">
                  Your YouTube watch history controls what videos are recommended to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
