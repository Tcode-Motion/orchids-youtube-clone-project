"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel, Category } from '@/lib/supabase/types';
import Link from 'next/link';

interface VideoWithChannel extends Video {
  channel: Channel;
}

function formatViews(views: number): string {
  if (views >= 1000000000) {
    return (views / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return views.toString();
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return 'LIVE';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
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

export default function VideoFeed() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const chipContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [categoriesRes, videosRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('videos').select(`
          *,
          channel:channels(*)
        `).order('published_at', { ascending: false })
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (videosRes.data) {
        setVideos(videosRes.data as VideoWithChannel[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      let query = supabase.from('videos').select(`
        *,
        channel:channels(*)
      `).order('published_at', { ascending: false });

      if (activeCategory && activeCategory !== 'All') {
        const category = categories.find(c => c.name === activeCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
        if (activeCategory === 'Live') {
          query = supabase.from('videos').select(`
            *,
            channel:channels(*)
          `).eq('is_live', true).order('published_at', { ascending: false });
        }
      }

      const { data } = await query;
      if (data) {
        setVideos(data as VideoWithChannel[]);
      }
    }
    
    if (categories.length > 0) {
      fetchVideos();
    }
  }, [activeCategory, categories]);

  const handleScroll = () => {
    if (chipContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = chipContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipContainerRef.current) {
      const scrollAmount = 200;
      chipContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const displayCategories = ['All', 'Live', ...categories.filter(c => c.name !== 'All').map(c => c.name)];

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-[#f9f9f9] ml-0 md:ml-[72px] lg:ml-[240px] pb-16 md:pb-0 transition-all duration-300">
        <div className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5]">
          <div className="flex items-center h-14 px-4 sm:px-6">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-y-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-video w-full bg-gray-200 rounded-xl animate-pulse" />
              <div className="mt-3 flex gap-3">
                <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#f9f9f9] ml-0 md:ml-[72px] lg:ml-[240px] pb-16 md:pb-0 transition-all duration-300">
      <div className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5]">
        <div className="relative flex items-center h-14">
          {showLeftArrow && (
            <div className="absolute left-0 z-10 flex items-center h-full pl-2 pr-6 bg-gradient-to-r from-white via-white to-transparent">
              <button 
                onClick={() => scrollChips('left')}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f2f2] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          )}
          
          <div 
            ref={chipContainerRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6"
          >
            {displayCategories.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(category === 'All' ? null : category)}
                className={`h-8 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  (category === 'All' && activeCategory === null) || activeCategory === category
                    ? 'bg-[#0f0f0f] text-white' 
                    : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {showRightArrow && (
            <div className="absolute right-0 z-10 flex items-center h-full pr-2 pl-6 bg-gradient-to-l from-white via-white to-transparent">
              <button 
                onClick={() => scrollChips('right')}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f2f2] transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

        <div className="p-3 sm:p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-y-8">
          {videos.map((video) => (
            <div key={video.id} className="flex flex-col cursor-pointer group">
              <Link href={`/watch?v=${video.id}`} className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-200">
                <img
                  src={video.thumbnail_url || 'https://picsum.photos/seed/default/640/360'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                {video.is_live ? (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    <span className="bg-[#cc0000] text-white text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-sm uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Live
                    </span>
                    <span className="bg-black/70 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-sm">
                      {formatViews(video.view_count)} watching
                    </span>
                  </div>
                ) : (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] sm:text-xs font-medium px-1 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </Link>

              <div className="mt-3 flex gap-3">
                <Link href={`/channel/${video.channel?.handle}`} className="flex-shrink-0">
                  <img 
                    src={video.channel?.avatar_url || 'https://picsum.photos/seed/default/36/36'}
                    alt={video.channel?.name || 'Channel'}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                </Link>
                <div className="flex flex-col flex-1 min-w-0 pr-6 relative">
                  <Link href={`/watch?v=${video.id}`}>
                    <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2 leading-5 mb-1 hover:text-[#0f0f0f]">
                      {video.title}
                    </h3>
                  </Link>
                  <Link 
                    href={`/channel/${video.channel?.handle}`} 
                    className="flex items-center gap-1 hover:text-[#0f0f0f] transition-colors"
                  >
                    <span className="text-xs text-[#606060]">
                      {video.channel?.name || 'Unknown Channel'}
                    </span>
                    {video.channel?.is_verified && (
                      <CheckCircle2 size={12} className="text-[#606060]" />
                    )}
                  </Link>
                  <div className="text-xs text-[#606060] flex items-center flex-wrap">
                    <span>{formatViews(video.view_count)} views</span>
                    {!video.is_live && (
                      <>
                        <span className="mx-1">&middot;</span>
                        <span>{timeAgo(video.published_at)}</span>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#e5e5e5] rounded-full transition-all"
                  >
                    <MoreVertical size={20} className="text-[#0f0f0f]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      {videos.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[#606060] text-lg">No videos found</p>
          <p className="text-[#909090] text-sm mt-1">Try selecting a different category</p>
        </div>
      )}
    </main>
  );
}
