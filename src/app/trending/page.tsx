'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { TrendingUp, Flame, Music, Gamepad2, Film, Trophy, Newspaper, GraduationCap } from 'lucide-react';
import { getTrending } from '@/app/actions/youtube';
import type { VideoWithChannel } from '@/lib/supabase/types';
import VideoCard from '@/components/ui/video-card';
import LayoutWrapper from '@/components/sections/layout-wrapper';

const categoryMap: Record<string, string> = {
  'Now': '',
  'Music': '10',
  'Gaming': '20',
  'Movies': '1',
  'Sports': '17',
  'Entertainment': '24'
};
const categoryIcons: Record<string, React.ElementType> = {
  'Now': Flame,
  'Music': Music,
  'Gaming': Gamepad2,
  'Movies': Film,
  'Sports': Trophy,
  'Entertainment': Newspaper,
};

function TrendingContent() {
  const [activeCategory, setActiveCategory] = useState<string>('Now');
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      try {
        const categoryId = categoryMap[activeCategory] || '';
        const { videos: data } = await getTrending(categoryId);
        setVideos(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, [activeCategory]);

  return (
    <LayoutWrapper>
      <main className="flex-1 w-full min-h-screen px-4 md:px-8 max-w-[1600px] mx-auto pb-24 md:pb-8 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Trending</h1>
            <p className="text-sm text-white/40">The most popular content globally</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {Object.keys(categoryMap).map((catName) => {
            const IconComponent = categoryIcons[catName] || Flame;
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-[13px] font-bold transition-all border ${
                  activeCategory === catName
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <IconComponent size={16} />
                {catName}
              </button>
            );
          })}
        </div>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-video bg-white/5 rounded-2xl mb-4" />
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-white/5 rounded-md w-[80%]" />
                      <div className="h-4 bg-white/5 rounded-md w-[60%]" />
                    </div>
                  </div>
                </div>
              ))}
           </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={32} className="text-white/40" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No trending videos</h2>
            <p className="text-white/40">Check back later or try another category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-4xl">
            {videos.map((video, index) => (
              <VideoCard 
                key={video.id} 
                video={video} 
                index={index} 
                layout="list"
              />
            ))}
          </div>
        )}
      </main>
    </LayoutWrapper>
  );
}

export default function TrendingPage() {
  return (
    <Suspense fallback={
       <LayoutWrapper>
         <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
         </div>
       </LayoutWrapper>
    }>
      <TrendingContent />
    </Suspense>
  );
}
