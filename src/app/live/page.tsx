'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Radio, Users, CheckCircle2, Eye } from 'lucide-react';
import { search } from '@/app/actions/youtube';
import type { VideoWithChannel } from '@/lib/supabase/types';
import VideoCard from '@/components/ui/video-card';
import LayoutWrapper from '@/components/sections/layout-wrapper';

function LiveContent() {
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      try {
        const data = await search('live gaming news sports 24/7');
        // Filter out non-live if possible or just display the results
        const lives = data.map(v => ({...v, is_live: true})); // Force live badge aesthetic for the page
        setVideos(lives);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  return (
    <LayoutWrapper>
      <main className="flex-1 w-full min-h-screen px-4 md:px-8 max-w-[1600px] mx-auto pb-24 md:pb-8 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-600/20">
            <Radio size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Live Broadcasts</h1>
            <p className="text-sm text-white/40">Watch streams happening right now</p>
          </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-video bg-white/5 rounded-2xl mb-4 border border-white/5" />
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 shrink-0 border border-white/5" />
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
              <Radio size={32} className="text-white/40" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No live streams right now</h2>
            <p className="text-white/40">Check back later for live content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {videos.map((video, index) => (
              <VideoCard 
                key={video.id + index} 
                video={video} 
                index={index} 
                layout="grid"
              />
            ))}
          </div>
        )}
      </main>
    </LayoutWrapper>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={
       <LayoutWrapper>
         <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
         </div>
       </LayoutWrapper>
    }>
      <LiveContent />
    </Suspense>
  );
}
