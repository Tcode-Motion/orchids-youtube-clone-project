"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { TrendingUp, CheckCircle2, Flame, Music, Gamepad2, Film, Trophy, Newspaper, GraduationCap } from 'lucide-react';
import LayoutWrapper from '@/components/sections/layout-wrapper';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration: number;
  view_count: number;
  like_count: number;
  published_at: string;
  is_live: boolean;
  category_id: string;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

interface Category {
  id: string;
  name: string;
}

function formatViews(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
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

const categoryIcons: Record<string, React.ElementType> = {
  'now': Flame,
  'Music': Music,
  'Gaming': Gamepad2,
  'Movies': Film,
  'Sports': Trophy,
  'News': Newspaper,
  'Learning': GraduationCap,
};

export default function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('now');

  useEffect(() => {
    async function fetchData() {
      const [videosRes, categoriesRes] = await Promise.all([
        supabase
          .from('videos')
          .select(`*, channel:channels(*)`)
          .eq('is_short', false)
          .order('view_count', { ascending: false })
          .limit(50),
        supabase.from('categories').select('*')
      ]);

      if (videosRes.data) {
        setAllVideos(videosRes.data as Video[]);
        setVideos(videosRes.data as Video[]);
      }
      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (activeCategory === 'now') {
      setVideos(allVideos);
    } else {
      const category = categories.find(c => c.name === activeCategory);
      if (category) {
        setVideos(allVideos.filter(v => v.category_id === category.id));
      }
    }
  }, [activeCategory, allVideos, categories]);

  const categoryButtons = [
    { id: 'now', label: 'Now' },
    { id: 'Music', label: 'Music' },
    { id: 'Gaming', label: 'Gaming' },
    { id: 'Movies', label: 'Movies' },
    { id: 'Sports', label: 'Sports' },
    { id: 'News', label: 'News' },
    { id: 'Learning', label: 'Learning' },
  ];

  if (loading) {
    return (
      <LayoutWrapper>
        <main className="flex-1 overflow-y-auto bg-[#f9f9f9] ml-0 md:ml-[72px] lg:ml-[240px] pb-16 md:pb-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-64 h-36 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <main className="flex-1 overflow-y-auto bg-[#f9f9f9] ml-0 md:ml-[72px] lg:ml-[240px] pb-16 md:pb-0">
        <div className="p-6 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0f0f0f]">Trending</h1>
              <p className="text-sm text-[#606060]">Videos that are trending right now</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categoryButtons.map((cat) => {
              const IconComponent = categoryIcons[cat.id] || Flame;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-[#0f0f0f] text-white'
                      : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'
                  }`}
                >
                  <IconComponent size={18} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[#f2f2f2] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={48} className="text-[#606060]" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No trending videos in this category</h2>
              <p className="text-[#606060]">Check other categories for trending content</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <Link 
                  key={video.id}
                  href={`/watch?v=${video.id}`}
                  className="flex gap-4 group bg-white rounded-xl p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-8 text-2xl font-bold text-[#606060]">
                    {index + 1}
                  </div>
                  <div className="relative w-64 h-36 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                    <img
                      src={video.thumbnail_url || 'https://picsum.photos/seed/default/256/144'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {video.is_live ? (
                      <span className="absolute bottom-2 left-2 bg-[#cc0000] text-white text-xs font-medium px-1.5 py-0.5 rounded">
                        LIVE
                      </span>
                    ) : (
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-semibold text-[#0f0f0f] line-clamp-2 mb-2 group-hover:text-[#065fd4]">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-[#606060] mb-1">
                      <span>{video.channel?.name}</span>
                      {video.channel?.is_verified && (
                        <CheckCircle2 size={14} className="text-[#606060]" />
                      )}
                    </div>
                    <div className="text-sm text-[#606060]">
                      {formatViews(video.view_count)} views &middot; {timeAgo(video.published_at)}
                    </div>
                    {video.description && (
                      <p className="text-xs text-[#606060] line-clamp-1 mt-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </LayoutWrapper>
  );
}
