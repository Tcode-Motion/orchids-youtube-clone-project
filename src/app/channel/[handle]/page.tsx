'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LayoutWrapper from '@/components/sections/layout-wrapper';
import { fetchChannelByHandle, fetchVideosByChannelId } from '@/lib/youtube/api';
import type { VideoWithChannel } from '@/lib/supabase/types';
import { CheckCircle2, Bell, ChevronDown, Play, Users, Video as VideoIcon, Info } from 'lucide-react';
import VideoCard from '@/components/ui/video-card';
import Link from 'next/link';

export default function ChannelPage() {
  const params = useParams();
  const handle = params.handle as string;
  
  const [channel, setChannel] = useState<any | null>(null);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!handle) return;
      setLoading(true);
      
      try {
        const channelData = await fetchChannelByHandle(handle);
        if (channelData) {
          setChannel(channelData);
          const channelVideos = await fetchVideosByChannelId(channelData.id);
          setVideos(channelVideos);
        }
      } catch (err) {
        console.error("Failed to load channel data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [handle]);

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="animate-pulse">
          <div className="h-[240px] md:h-[320px] bg-white/5 rounded-3xl mb-8" />
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5" />
              <div className="flex-1 space-y-4">
                <div className="h-10 bg-white/5 rounded-xl w-64" />
                <div className="h-4 bg-white/5 rounded-lg w-48" />
                <div className="h-20 bg-white/5 rounded-2xl w-full max-w-2xl" />
              </div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!channel) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Info size={48} className="text-white/20" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Channel not found</h1>
          <p className="text-white/40 max-w-md mb-8">
            The YouTube channel `@{handle}` could not be retrieved. It may be private or the handle might be incorrect.
          </p>
          <Link href="/" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-all">
            Return to Discovery
          </Link>
        </div>
      </LayoutWrapper>
    );
  }

  const tabs = [
    { id: 'videos', label: 'Videos', icon: <VideoIcon size={16} /> },
    { id: 'about', label: 'About', icon: <Info size={16} /> }
  ];

  return (
    <LayoutWrapper>
      <main className="flex-1 w-full min-h-screen pb-24">
        {/* Banner */}
        <div 
          className="h-[200px] md:h-[300px] w-full rounded-b-[40px] relative overflow-hidden group mb-8"
          style={{
            background: channel.banner_url 
              ? `url(${channel.banner_url}) center/cover no-repeat` 
              : 'linear-gradient(to right, #1e1b4b, #312e81, #4338ca)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative -mt-20 md:-mt-24 mb-10">
            <div className="relative group shrink-0">
               <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity" />
               <img 
                src={channel.avatar_url}
                alt={channel.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0f0f12] relative z-10 shadow-2xl"
              />
            </div>
            
            <div className="flex-1 pt-4">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{channel.name}</h1>
                {channel.is_verified && (
                  <CheckCircle2 className="text-indigo-400 fill-indigo-400/10" size={28} />
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base font-medium text-white/50 mb-4">
                <span className="text-white/80">@{handle}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="flex items-center gap-1.5"><Users size={16} /> {channel.subscriber_count.toLocaleString()} subscribers</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="flex items-center gap-1.5"><VideoIcon size={16} /> {channel.video_count.toLocaleString()} videos</span>
              </div>

              <p className="text-white/40 text-sm md:text-base max-w-3xl line-clamp-2 leading-relaxed mb-6">
                {channel.description || 'No description available for this YouTube creator.'}
              </p>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSubscribed(!subscribed)}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                    subscribed 
                      ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
                >
                  {subscribed && <Bell size={18} className="animate-wiggle" />}
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
                {subscribed && (
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <ChevronDown size={20} className="text-white/60" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 border-b border-white/5 mb-10 sticky top-16 bg-[#0f0f12]/80 backdrop-blur-md z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-bold transition-all relative flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.6)]" />
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="min-h-[400px]">
            {activeTab === 'videos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {videos.map((video, idx) => (
                  <VideoCard key={video.id} video={video} index={idx} layout="grid" />
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="max-w-4xl space-y-12">
                <section>
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-indigo-400">
                    <Info size={20} /> Channel Description
                  </h2>
                  <p className="text-white/60 leading-loose text-lg font-medium whitespace-pre-wrap">
                    {channel.description || 'This creator hasn\'t provided a description yet.'}
                  </p>
                </section>
                
                <section className="pt-10 border-t border-white/5">
                  <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-indigo-400">
                    Channel Analytics
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Joined</p>
                      <p className="text-white font-bold text-lg">
                        {new Date(channel.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Total Subscribers</p>
                      <p className="text-white font-bold text-lg">{channel.subscriber_count.toLocaleString()}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Video Count</p>
                      <p className="text-white font-bold text-lg">{channel.video_count.toLocaleString()}</p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </LayoutWrapper>
  );
}
