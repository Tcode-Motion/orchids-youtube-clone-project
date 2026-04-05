'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { VideoWithChannel, Channel } from '@/lib/supabase/types';
import { CheckCircle2, Grid, List, Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import VideoCard from '@/components/ui/video-card';
import EmptyState from '@/components/ui/empty-state';
import { motion } from 'framer-motion';

interface SubscriptionRow {
  id: string;
  channel_id: string;
  channel: Channel;
}

export default function SubscriptionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'unwatched' | 'live'>('all');

  useEffect(() => {
    async function fetchData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*, channel:channels(*)')
        .eq('user_id', currentUser.id);

      if (subsData && subsData.length > 0) {
        setSubscriptions(subsData as SubscriptionRow[]);
        const channelIds = subsData.map((s: any) => s.channel_id);

        const { data: videosData } = await supabase
          .from('videos')
          .select('*, channel:channels(*)')
          .in('channel_id', channelIds)
          .eq('is_private', false)
          .order('published_at', { ascending: false })
          .limit(50);

        if (videosData) setVideos(videosData as VideoWithChannel[]);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredVideos = videos.filter((v) => {
    if (activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(v.published_at) >= today;
    }
    if (activeFilter === 'live') return v.is_live;
    return true;
  });

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video bg-white/5 rounded-2xl mb-3" />
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-white/5 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/5 rounded w-4/5" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 max-w-[1400px] mx-auto">
        <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse mb-8" />
        <SkeletonGrid />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Bell size={40} className="text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Don&apos;t miss new videos</h2>
          <p className="text-white/40 mb-8 max-w-sm mx-auto text-sm">
            Sign in to see updates from channels you follow.
          </p>
          <Link href="/auth?next=/subscriptions" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/20">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-white">Subscriptions</h1>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Subscribed Channels Row */}
      {subscriptions.length > 0 && (
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {subscriptions.map((sub) => (
            <Link
              href={`/channel/${sub.channel?.handle?.replace('@', '')}`}
              key={sub.id}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="relative">
                <img
                  src={sub.channel?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${sub.channel_id}`}
                  alt={sub.channel?.name}
                  className="w-14 h-14 rounded-full border-2 border-white/10 group-hover:border-indigo-500/60 transition-all object-cover"
                />
                {sub.channel?.is_verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-background">
                    <CheckCircle2 size={10} className="text-white fill-white" />
                  </div>
                )}
              </div>
              <span className="text-[11px] text-white/50 group-hover:text-white transition-colors max-w-[60px] truncate font-medium">
                {sub.channel?.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {(['all', 'today', 'live'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`h-10 px-5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all capitalize ${
              activeFilter === filter
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {filter === 'all' ? 'All' : filter === 'today' ? "Today" : 'Live'}
          </button>
        ))}
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={40} />}
          title="No subscriptions yet"
          description="Follow channels you love to see their latest videos here."
          action={{ label: 'Explore Channels', href: '/' }}
        />
      ) : filteredVideos.length === 0 ? (
        <EmptyState
          icon={<Bell size={40} />}
          title="No videos match this filter"
          description="Try a different filter or check back later."
          action={{ label: 'Show All', onClick: () => setActiveFilter('all') }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredVideos.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} layout={view} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
