'use client';

import React, { useState, useEffect } from 'react';
import { Play, Info, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getTrending } from '@/app/actions/youtube';
import type { VideoWithChannel } from '@/lib/supabase/types';
import VideoCard from '@/components/ui/video-card';

const categoryMap: Record<string, string> = {
  'All': '',
  'Music': '10',
  'Gaming': '20',
  'Tech': '28',
  'Documentaries': '27',
  'Cinema': '1',
  'Travel': '19'
};

export default function VideoFeed() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const observerRef = React.useRef<HTMLDivElement>(null);
  
  const categories = Object.keys(categoryMap);

  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      setVideos([]);
      try {
        const categoryId = categoryMap[activeCategory] || '';
        const { videos: data, nextPageToken: token } = await getTrending(categoryId);
        setVideos(data);
        setNextPageToken(token);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, [activeCategory]);

  // Infinite scroll observer setup
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextPageToken && !loadingMore) {
        loadMoreVideos();
      }
    }, { threshold: 0.1, rootMargin: '400px' });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [nextPageToken, loadingMore, activeCategory]);

  async function loadMoreVideos() {
    if (!nextPageToken) return;
    setLoadingMore(true);
    try {
      const categoryId = categoryMap[activeCategory] || '';
      const { videos: newVideos, nextPageToken: token } = await getTrending(categoryId, nextPageToken);
      
      // Filter out possible duplicates YouTube sometimes returns across paginations
      setVideos((prev) => {
        const existingIds = new Set(prev.map(v => v.id));
        const filteredNew = newVideos.filter(v => !existingIds.has(v.id));
        return [...prev, ...filteredNew];
      });
      
      setNextPageToken(token);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="pb-24 md:pb-8 w-full max-w-[2000px] mx-auto overflow-x-hidden">
      {/* Spotlight Hero Section */}
      <section className="relative w-full h-[600px] xl:h-[716px] min-h-[500px] flex items-end p-8 md:p-12 overflow-hidden bg-[#131313]">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Trending Movie Hero" 
            className="w-full h-full object-cover opacity-80" 
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Trending Now
            </span>
            <span className="text-white/60 text-xs font-medium tracking-wider">Sci-Fi • Action • 2024</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold font-sans tracking-tight text-white mb-6 leading-[1.1]">
            NEON <br/>ASCENSION
          </h1>
          
          <p className="text-white/70 text-lg mb-8 line-clamp-3 font-sans leading-relaxed max-w-xl">
            In a world where digital consciousness is the only currency, one hacker must breach the central core to save the last remnants of humanity's biological legacy.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-indigo-600/20">
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-white/20 transition-all">
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>
      </section>

      {/* Content Feed */}
      <div className="px-8 md:px-12 -mt-8 relative z-20">
        
        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
          {categories.map((category) => (
            <button 
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === category 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-[#2a2a2a] text-[#c7c4d8] hover:bg-[#353534]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pb-20">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="animate-pulse">
                 <div className="w-full aspect-video bg-white/5 rounded-2xl mb-4" />
                 <div className="flex gap-3">
                   <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
                   <div className="flex-1 space-y-2 py-1">
                     <div className="h-4 bg-white/5 rounded-md w-full" />
                     <div className="h-4 bg-white/5 rounded-md w-3/4" />
                   </div>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pb-10">
            {videos.map((video, idx) => (
              <VideoCard key={video.id + '-' + idx} video={video} index={idx} layout="grid" />
            ))}
          </div>
        )}

        {/* Intersection Observer Target */}
        {!loading && videos.length > 0 && (
          <div ref={observerRef} className="w-full flex justify-center py-10 opacity-70">
            {(loadingMore || nextPageToken) ? (
              <div className="flex items-center gap-3">
                 <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                 <span className="text-sm font-medium text-neutral-400">Loading more videos...</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-neutral-600">You've reached the end!</span>
            )}
          </div>
        )}
        
        {!loading && videos.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="text-white text-xl font-bold mb-2">No videos found</h3>
            <p className="text-neutral-500">No videos available in this category.</p>
            <button 
              onClick={() => setActiveCategory('All')}
              className="mt-6 px-6 py-2 bg-indigo-600 rounded-full text-white font-bold hover:bg-indigo-500 transition-colors"
            >
              Back to All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
