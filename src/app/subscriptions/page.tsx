"use client";

import React, { useState, useEffect } from 'react';
import Masthead from '@/components/sections/masthead';
import Sidebar from '@/components/sections/sidebar';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel } from '@/lib/supabase/types';
import { CheckCircle2, MoreVertical, Grid, List, Bell } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface VideoWithChannel extends Video {
  channel: Channel;
}

interface Subscription {
  id: string;
  channel_id: string;
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

export default function SubscriptionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'continue' | 'unwatched' | 'live'>('all');

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: subsData } = await supabase
          .from('subscriptions')
          .select(`*, channel:channels(*)`)
          .eq('user_id', user.id);

        if (subsData) {
          setSubscriptions(subsData as Subscription[]);
          const channelIds = subsData.map(s => s.channel_id);
          
          if (channelIds.length > 0) {
            const { data: videosData } = await supabase
              .from('videos')
              .select(`*, channel:channels(*)`)
              .in('channel_id', channelIds)
              .order('published_at', { ascending: false })
              .limit(50);
            
            if (videosData) setVideos(videosData as VideoWithChannel[]);
          }
        }
      } else {
        const [videosRes, channelsRes] = await Promise.all([
          supabase
            .from('videos')
            .select(`*, channel:channels(*)`)
            .order('published_at', { ascending: false })
            .limit(20),
          supabase
            .from('channels')
            .select('*')
            .order('subscriber_count', { ascending: false })
            .limit(10)
        ]);
        
        if (videosRes.data) setVideos(videosRes.data as VideoWithChannel[]);
        if (channelsRes.data) setChannels(channelsRes.data);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="flex flex-1 pt-[56px]">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-[240px] bg-[#f9f9f9] p-6">
            <div className="max-w-[1284px] mx-auto">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i}>
                    <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
                    <div className="mt-3 flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
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
          <div className="max-w-[1284px] mx-auto px-6 py-6">
            {!user && (
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>
                <div className="bg-white rounded-xl p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-4 bg-[#f2f2f2] rounded-full flex items-center justify-center">
                      <Bell size={48} className="text-[#606060]" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Don't miss new videos</h2>
                    <p className="text-[#606060] mb-4">Sign in to see updates from your favorite YouTube channels</p>
                    <Link href="/auth" className="inline-block px-4 py-2 bg-[#065fd4] text-white rounded-full font-medium text-sm hover:bg-[#0556be]">
                      Sign in
                    </Link>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4">Popular channels</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {channels.map((channel) => (
                    <Link 
                      href={`/channel/${channel.handle?.replace('@', '')}`} 
                      key={channel.id}
                      className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                    >
                      <img 
                        src={channel.avatar_url || `https://picsum.photos/seed/${channel.id}/88/88`}
                        alt={channel.name}
                        className="w-[88px] h-[88px] rounded-full mx-auto mb-3"
                      />
                      <div className="flex items-center justify-center gap-1">
                        <h3 className="font-medium text-sm line-clamp-1">{channel.name}</h3>
                        {channel.is_verified && <CheckCircle2 size={12} className="text-[#606060]" />}
                      </div>
                      <p className="text-xs text-[#606060]">{formatSubscribers(channel.subscriber_count)} subscribers</p>
                      <button className="mt-3 px-4 py-2 bg-[#0f0f0f] text-white rounded-full text-sm font-medium hover:bg-[#272727]">
                        Subscribe
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {user && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">Subscriptions</h1>
                  <div className="flex items-center gap-2 bg-[#f2f2f2] rounded-lg p-1">
                    <button 
                      onClick={() => setView('grid')}
                      className={`p-2 rounded ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Grid size={20} />
                    </button>
                    <button 
                      onClick={() => setView('list')}
                      className={`p-2 rounded ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>

                {subscriptions.length > 0 && (
                  <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    {subscriptions.map((sub) => (
                      <Link 
                        href={`/channel/${sub.channel?.handle?.replace('@', '')}`}
                        key={sub.id}
                        className="flex flex-col items-center shrink-0"
                      >
                        <img 
                          src={sub.channel?.avatar_url || `https://picsum.photos/seed/${sub.channel_id}/56/56`}
                          alt={sub.channel?.name}
                          className="w-14 h-14 rounded-full"
                        />
                        <span className="text-xs text-[#606060] mt-1 max-w-[60px] truncate">
                          {sub.channel?.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mb-6 overflow-x-auto">
                  {['All', 'Today', 'Continue watching', 'Unwatched', 'Live'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '') as typeof activeTab)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.toLowerCase().replace(' ', '')
                          ? 'bg-[#0f0f0f] text-white'
                          : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </>
            )}

            {videos.length === 0 && user ? (
              <div className="text-center py-12">
                <p className="text-[#606060]">No videos from your subscriptions yet</p>
              </div>
            ) : (
              <div className={view === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8"
                : "space-y-4"
              }>
                {videos.map((video) => (
                  view === 'grid' ? (
                    <Link href={`/watch?v=${video.id}`} key={video.id} className="group">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
                        <img
                          src={video.thumbnail_url || 'https://picsum.photos/seed/default/320/180'}
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
                      <div className="mt-3 flex gap-3">
                        <Link href={`/channel/${video.channel?.handle?.replace('@', '')}`}>
                          <img 
                            src={video.channel?.avatar_url || 'https://picsum.photos/seed/default/36/36'}
                            alt={video.channel?.name}
                            className="w-9 h-9 rounded-full"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2 leading-5">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-[#606060]">{video.channel?.name}</span>
                            {video.channel?.is_verified && <CheckCircle2 size={12} className="text-[#606060]" />}
                          </div>
                          <p className="text-xs text-[#606060]">
                            {formatViews(video.view_count)} views • {timeAgo(video.published_at)}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => e.preventDefault()}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#e5e5e5] rounded-full h-fit"
                        >
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </Link>
                  ) : (
                    <Link href={`/watch?v=${video.id}`} key={video.id} className="flex gap-4 group">
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
                        <h3 className="text-base font-medium text-[#0f0f0f] line-clamp-2 pr-6">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-[#606060]">{video.channel?.name}</span>
                          {video.channel?.is_verified && <CheckCircle2 size={12} className="text-[#606060]" />}
                        </div>
                        <p className="text-xs text-[#606060]">
                          {formatViews(video.view_count)} views • {timeAgo(video.published_at)}
                        </p>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
