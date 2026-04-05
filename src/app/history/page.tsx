'use client';

import React, { useEffect, useState } from 'react';
import { History, PlaySquare, Trash2 } from 'lucide-react';
import LayoutWrapper from '@/components/sections/layout-wrapper';
import VideoCard from '@/components/ui/video-card';
import type { VideoWithChannel } from '@/lib/supabase/types';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const historyRaw = localStorage.getItem('vidstrim_history');
      if (historyRaw) {
        setHistory(JSON.parse(historyRaw));
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('vidstrim_history');
    setHistory([]);
  };

  return (
    <LayoutWrapper>
      <main className="flex-1 w-full min-h-screen px-4 md:px-8 max-w-[1600px] mx-auto pb-24 md:pb-8 pt-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-full flex items-center justify-center border border-white/10 shadow-lg">
              <History size={24} className="text-white/80" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Watch History</h1>
              <p className="text-sm text-white/40">Videos you've watched locally</p>
            </div>
          </div>
          
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-xl transition-colors font-bold text-sm border border-rose-500/20"
            >
              <Trash2 size={16} />
              Clear History
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-white/5 rounded-2xl mb-3" />
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-white/5 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pb-20">
            {history.map((video, idx) => (
              <VideoCard key={`${video.id}-${idx}`} video={video} index={idx} layout="grid" />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mt-20 p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10">
                <PlaySquare size={32} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4">No Watch History</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md">
                You haven't watched any videos yet! Start exploring the home feed to build your local watch history.
              </p>
              <Link href="/" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-colors flex items-center gap-2">
                Start Watching
              </Link>
            </div>
          </div>
        )}
      </main>
    </LayoutWrapper>
  );
}
