"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Masthead from '@/components/sections/masthead';
import Sidebar from '@/components/sections/sidebar';
import { supabase } from '@/lib/supabase/client';
import type { Channel, Video } from '@/lib/supabase/types';
import { CheckCircle2, Bell, ChevronDown, Play, MoreVertical } from 'lucide-react';
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

export default function ChannelPage() {
  const params = useParams();
  const handle = params.handle as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
      async function fetchChannel() {
        let handleSearch = handle;
        
        if (handle === 'me') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: channelData } = await supabase
              .from('channels')
              .select('*')
              .eq('user_id', user.id)
              .single();
            if (channelData) {
              setChannel(channelData);
              fetchVideos(channelData.id);
              setLoading(false);
              return;
            }
          }
          setLoading(false);
          return;
        }

        handleSearch = handleSearch.startsWith('@') ? handleSearch : `@${handleSearch}`;
        
        const { data: channelData } = await supabase
          .from('channels')
          .select('*')
          .eq('handle', handleSearch)
          .single();

        if (channelData) {
          setChannel(channelData);
          fetchVideos(channelData.id);
        }
        setLoading(false);
      }

      async function fetchVideos(channelId: string) {
        const { data: videosData } = await supabase
          .from('videos')
          .select(`*, channel:channels(*)`)
          .eq('channel_id', channelId)
          .order('published_at', { ascending: false });
        
        if (videosData) setVideos(videosData as VideoWithChannel[]);
      }

      if (handle) fetchChannel();
    }, [handle]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="flex flex-1 pt-[56px]">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-[240px] bg-[#f9f9f9]">
            <div className="h-[200px] bg-gray-200 animate-pulse" />
            <div className="max-w-[1284px] mx-auto px-6 py-4">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="flex flex-1 pt-[56px]">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-[240px] bg-[#f9f9f9] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-2">Channel not found</h1>
              <p className="text-[#606060]">The channel you're looking for doesn't exist.</p>
              <Link href="/" className="mt-4 inline-block px-4 py-2 bg-[#0f0f0f] text-white rounded-full">
                Go Home
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const tabs = ['Home', 'Videos', 'Shorts', 'Live', 'Playlists', 'Community', 'About'];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Masthead />
      <div className="flex flex-1 pt-[56px]">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-[240px] bg-[#f9f9f9]">
          <div 
            className="h-[200px] bg-gradient-to-r from-blue-600 to-purple-600"
            style={{
              backgroundImage: channel.banner_url ? `url(${channel.banner_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          <div className="max-w-[1284px] mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 py-4 border-b border-[#e5e5e5]">
              <img 
                src={channel.avatar_url || `https://picsum.photos/seed/${channel.id}/160/160`}
                alt={channel.name}
                className="w-20 h-20 sm:w-[160px] sm:h-[160px] rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-bold text-[#0f0f0f]">{channel.name}</h1>
                  {channel.is_verified && (
                    <CheckCircle2 size={24} className="text-[#606060]" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#606060] mt-1">
                  <span>{channel.handle}</span>
                  <span>•</span>
                  <span>{formatSubscribers(channel.subscriber_count)} subscribers</span>
                  <span>•</span>
                  <span>{channel.video_count} videos</span>
                </div>
                <p className="text-sm text-[#606060] mt-2 line-clamp-2">
                  {channel.description || 'No description available.'}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <button 
                    onClick={() => setSubscribed(!subscribed)}
                    className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-colors ${
                      subscribed 
                        ? 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]' 
                        : 'bg-[#0f0f0f] text-white hover:bg-[#272727]'
                    }`}
                  >
                    {subscribed && <Bell size={16} />}
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                  {subscribed && (
                    <button className="p-2 bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5]">
                      <ChevronDown size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 border-b border-[#e5e5e5] overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`py-4 px-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'border-[#0f0f0f] text-[#0f0f0f]'
                      : 'border-transparent text-[#606060] hover:text-[#0f0f0f]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="py-6">
              {activeTab === 'videos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {videos.map((video) => (
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
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center">
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2 leading-5">
                            {video.title}
                          </h3>
                          <div className="text-xs text-[#606060] mt-1">
                            {formatViews(video.view_count)} views • {timeAgo(video.published_at)}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => e.preventDefault()}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#e5e5e5] rounded-full h-fit"
                        >
                          <MoreVertical size={20} className="text-[#0f0f0f]" />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="max-w-[800px]">
                  <h2 className="text-lg font-semibold mb-4">Description</h2>
                  <p className="text-[#0f0f0f] whitespace-pre-wrap">
                    {channel.description || 'No description available.'}
                  </p>
                  <div className="mt-6 border-t border-[#e5e5e5] pt-6">
                    <h2 className="text-lg font-semibold mb-4">Details</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[#606060]">Joined:</span>
                        <span>{new Date(channel.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#606060]">Total videos:</span>
                        <span>{channel.video_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'home' || activeTab === 'shorts' || activeTab === 'live' || activeTab === 'playlists' || activeTab === 'community') && (
                <div className="text-center py-12">
                  <p className="text-[#606060]">No content available in this section.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
