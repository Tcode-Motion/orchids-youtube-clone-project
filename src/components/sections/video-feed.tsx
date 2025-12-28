"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, CheckCircle2, ChevronLeft, ChevronRight, Play, Eye, Clock, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel, Category } from '@/lib/supabase/types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  return hours > 0 
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function timeAgo(date: string): string {
  const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

const VideoCard = ({ video, index }: { video: VideoWithChannel; index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group flex flex-col relative"
  >
    <Link href={`/watch?v=${video.id}`} className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-white/5 border border-white/5 group-hover:border-primary/50 transition-all duration-500 shadow-xl group-hover:shadow-primary/10">
      <img
        src={video.thumbnail_url || 'https://picsum.photos/seed/default/640/360'}
        alt={video.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      
      {/* Overlay controls on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <Play size={20} className="text-white fill-white ml-1" />
        </div>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-primary transition-colors">
          <Clock size={16} />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {video.is_live ? (
          <div className="bg-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase flex items-center gap-1 shadow-lg">
            <span className="w-1 h-1 bg-white rounded-full animate-ping" />
            Live
          </div>
        ) : (
          <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
    </Link>

    <div className="mt-4 flex gap-3">
      <Link href={`/channel/${video.channel?.handle}`} className="flex-shrink-0 relative group/avatar">
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-brand-secondary rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity blur-sm" />
        <img 
          src={video.channel?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.channel?.id}`}
          alt=""
          className="h-10 w-10 rounded-full object-cover border-2 border-background relative z-10"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/watch?v=${video.id}`}>
          <h3 className="text-[15px] font-bold text-white/90 leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
            {video.title}
          </h3>
        </Link>
        <div className="flex flex-col text-[13px]">
          <Link href={`/channel/${video.channel?.handle}`} className="text-white/40 hover:text-white transition-colors flex items-center gap-1 font-medium">
            {video.channel?.name}
            {video.channel?.is_verified && <CheckCircle2 size={12} className="text-primary" />}
          </Link>
          <div className="text-white/30 flex items-center gap-1.5 mt-0.5">
            <span className="flex items-center gap-1"><Eye size={12} /> {formatViews(video.view_count)}</span>
            <span>•</span>
            <span>{timeAgo(video.published_at)}</span>
          </div>
        </div>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/5 rounded-xl transition-all h-fit text-white/40 hover:text-white">
        <MoreVertical size={18} />
      </button>
    </div>
  </motion.div>
);

export default function VideoFeed() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const chipContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      const { data: vidData } = await supabase.from('videos').select('*, channel:channels(*)').order('published_at', { ascending: false });
      
      if (catData) setCategories(catData);
      if (vidData) setVideos(vidData as VideoWithChannel[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function filterVideos() {
      let query = supabase.from('videos').select('*, channel:channels(*)').order('published_at', { ascending: false });
      if (activeCategory && activeCategory !== 'All') {
        const category = categories.find(c => c.name === activeCategory);
        if (category) query = query.eq('category_id', category.id);
        if (activeCategory === 'Live') query = query.eq('is_live', true);
      }
      const { data } = await query;
      if (data) setVideos(data as VideoWithChannel[]);
    }
    if (!loading) filterVideos();
  }, [activeCategory, categories, loading]);

  const displayCategories = ['All', 'Live', ...categories.filter(c => c.name !== 'All').map(c => c.name)];

  if (loading) {
    return (
      <main className="flex-1 bg-background transition-all duration-500 pt-18 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-white/5 rounded-[24px] mb-4" />
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background transition-all duration-500 pt-18">
      {/* Categories Bar */}
      <div className="sticky top-18 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 overflow-hidden">
        <div 
          ref={chipContainerRef}
          className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {displayCategories.map((category, idx) => {
            const isActive = (category === 'All' && activeCategory === null) || activeCategory === category;
            return (
              <button
                key={idx}
                onClick={() => setActiveCategory(category === 'All' ? null : category)}
                className={`h-10 px-5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 relative group overflow-hidden ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-primary shadow-lg shadow-primary/20"
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Recommended for you</h2>
          </div>
          <div className="text-sm text-white/40 font-medium">
            Showing {videos.length} results
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          <AnimatePresence mode="popLayout">
            {videos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-white/20">
              <Play size={40} />
            </div>
            <h3 className="text-xl font-bold text-white/80">The feed is empty</h3>
            <p className="text-white/40 max-w-xs mt-2 mx-auto">Try exploring other categories or refresh to find new content.</p>
            <button onClick={() => setActiveCategory(null)} className="mt-8 px-8 py-3 bg-primary hover:bg-primary/90 rounded-2xl text-white font-bold transition-all shadow-lg shadow-primary/20">
              Back to Explore
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
