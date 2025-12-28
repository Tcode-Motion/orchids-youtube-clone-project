"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Masthead from '@/components/sections/masthead';
import Sidebar from '@/components/sections/sidebar';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel } from '@/lib/supabase/types';
import { CheckCircle2, MoreVertical, Filter } from 'lucide-react';
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

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('search_query') || '';
  
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function search() {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const [videosRes, channelsRes] = await Promise.all([
        supabase
          .from('videos')
          .select(`*, channel:channels(*)`)
          .ilike('title', `%${query}%`)
          .order('view_count', { ascending: false })
          .limit(20),
        supabase
          .from('channels')
          .select('*')
          .or(`name.ilike.%${query}%,handle.ilike.%${query}%`)
          .limit(5)
      ]);

      if (videosRes.data) setVideos(videosRes.data as VideoWithChannel[]);
      if (channelsRes.data) setChannels(channelsRes.data);
      setLoading(false);
    }

    search();
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="flex flex-1 pt-[56px]">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-[240px] bg-[#f9f9f9] p-6">
            <div className="max-w-[1096px] mx-auto">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-4 mb-4">
                  <div className="w-[360px] h-[202px] bg-gray-200 rounded-xl animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
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
          <div className="border-b border-[#e5e5e5] bg-white">
            <div className="max-w-[1096px] mx-auto px-6 py-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-[#f2f2f2] rounded-full transition-colors"
              >
                <Filter size={20} />
                <span className="font-medium">Filters</span>
              </button>
              
              {showFilters && (
                <div className="grid grid-cols-4 gap-8 mt-4 pb-4">
                  <div>
                    <h3 className="font-medium text-sm text-[#606060] mb-2 uppercase">Upload date</h3>
                    <div className="space-y-1">
                      {['Last hour', 'Today', 'This week', 'This month', 'This year'].map((option) => (
                        <button key={option} className="block text-sm hover:text-[#065fd4]">{option}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[#606060] mb-2 uppercase">Type</h3>
                    <div className="space-y-1">
                      {['Video', 'Channel', 'Playlist', 'Movie'].map((option) => (
                        <button key={option} className="block text-sm hover:text-[#065fd4]">{option}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[#606060] mb-2 uppercase">Duration</h3>
                    <div className="space-y-1">
                      {['Under 4 minutes', '4-20 minutes', 'Over 20 minutes'].map((option) => (
                        <button key={option} className="block text-sm hover:text-[#065fd4]">{option}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[#606060] mb-2 uppercase">Sort by</h3>
                    <div className="space-y-1">
                      {['Relevance', 'Upload date', 'View count', 'Rating'].map((option) => (
                        <button key={option} className="block text-sm hover:text-[#065fd4]">{option}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-[1096px] mx-auto px-6 py-6">
            {!query && (
              <div className="text-center py-12">
                <p className="text-[#606060]">Enter a search term to find videos</p>
              </div>
            )}

            {query && videos.length === 0 && channels.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No results found</h2>
                <p className="text-[#606060]">Try different keywords or remove search filters</p>
              </div>
            )}

            {channels.length > 0 && (
              <div className="mb-8">
                {channels.map((channel) => (
                  <Link 
                    href={`/channel/${channel.handle?.replace('@', '')}`} 
                    key={channel.id}
                    className="flex items-center gap-6 p-4 hover:bg-[#f2f2f2] rounded-xl transition-colors"
                  >
                    <img 
                      src={channel.avatar_url || `https://picsum.photos/seed/${channel.id}/136/136`}
                      alt={channel.name}
                      className="w-[136px] h-[136px] rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{channel.name}</h3>
                        {channel.is_verified && <CheckCircle2 size={14} className="text-[#606060]" />}
                      </div>
                      <p className="text-sm text-[#606060]">
                        {channel.handle} • {formatViews(channel.subscriber_count)} subscribers
                      </p>
                      <p className="text-sm text-[#606060] mt-1 line-clamp-2">{channel.description}</p>
                    </div>
                    <button className="px-4 py-2 bg-[#0f0f0f] text-white rounded-full font-medium text-sm hover:bg-[#272727]">
                      Subscribe
                    </button>
                  </Link>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {videos.map((video) => (
                <Link 
                  href={`/watch?v=${video.id}`} 
                  key={video.id}
                  className="flex gap-4 group"
                >
                  <div className="relative w-[360px] aspect-video rounded-xl overflow-hidden bg-gray-200 shrink-0">
                    <img
                      src={video.thumbnail_url || 'https://picsum.photos/seed/default/360/202'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {video.is_live ? (
                      <span className="absolute bottom-2 left-2 bg-[#cc0000] text-white text-xs font-medium px-1.5 py-0.5 rounded-sm uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-[#0f0f0f] line-clamp-2 leading-6 pr-6">
                        {video.title}
                      </h3>
                      <button 
                        onClick={(e) => e.preventDefault()}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#e5e5e5] rounded-full h-fit"
                      >
                        <MoreVertical size={20} />
                      </button>
                    </div>
                    <p className="text-xs text-[#606060] mt-1">
                      {formatViews(video.view_count)} views • {timeAgo(video.published_at)}
                    </p>
                    <Link 
                      href={`/channel/${video.channel?.handle?.replace('@', '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 mt-3 hover:text-[#0f0f0f]"
                    >
                      <img 
                        src={video.channel?.avatar_url || 'https://picsum.photos/seed/default/24/24'}
                        alt={video.channel?.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs text-[#606060]">{video.channel?.name}</span>
                      {video.channel?.is_verified && <CheckCircle2 size={12} className="text-[#606060]" />}
                    </Link>
                    <p className="text-xs text-[#606060] mt-2 line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="flex flex-1 pt-[56px] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
