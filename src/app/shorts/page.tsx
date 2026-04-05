'use client';

import React, { useState, useEffect } from 'react';
import LayoutWrapper from '@/components/sections/layout-wrapper';
import { Smartphone, Zap, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { getShorts } from '@/app/actions/youtube';
import type { VideoWithChannel } from '@/lib/supabase/types';
import ShortsCard from '@/components/ui/shorts-card';

export default function ShortsPage() {
  const [shorts, setShorts] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadShorts() {
      setLoading(true);
      try {
        const data = await getShorts();
        setShorts(data);
      } catch (err) {
        console.error("Failed to load shorts", err);
      } finally {
        setLoading(false);
      }
    }
    loadShorts();
  }, []);

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-white/20">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-black uppercase tracking-widest text-xs">Curating your vertical feed...</p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <main className="flex-1 w-full h-[calc(100vh-64px)] overflow-hidden bg-black md:bg-transparent">
        {/* Mobile-style Vertical Feed */}
        <div className="h-full flex flex-col md:flex-row items-center justify-center p-0 md:p-4 gap-8">
          
          {/* Header (Desktop Only) */}
          <div className="hidden xl:flex flex-col gap-3 w-64">
            <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/20">
                <Zap size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Shorts</h1>
            <p className="text-sm text-white/40 leading-relaxed">
              Experience the fast-paced world of VidStrim in a vertical cinematic format.
            </p>
            
            <div className="mt-12 flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Smartphone size={16} className="text-white/40" />
                </div>
                <span className="text-xs font-bold text-white/60">Optimized for Vertical</span>
              </div>
            </div>
          </div>

          {/* Scrolling Feed Container */}
          <div className="relative w-full md:w-[420px] lg:w-[450px] h-full md:h-[90%] bg-black md:rounded-[40px] md:border-[12px] md:border-[#1a1a1a] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth">
              {shorts.length > 0 ? (
                shorts.map((short) => (
                  <div key={short.id} className="w-full h-full snap-start">
                    <ShortsCard video={short} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Zap size={48} className="text-white/20 mb-4" />
                  <h3 className="text-white font-bold mb-2">No Shorts found</h3>
                  <p className="text-white/40 text-sm">Our AI is currently scouring the network for more vertical content.</p>
                </div>
              )}
            </div>

            {/* Navigation Indicators (Desktop) */}
            <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-4">
               <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/40 hover:text-white transition-all backdrop-blur-md">
                 <ChevronUp size={20} />
               </button>
               <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/40 hover:text-white transition-all backdrop-blur-md">
                 <ChevronDown size={20} />
               </button>
            </div>
          </div>

          {/* Social Proof Sidebar (Desktop Only) */}
          <div className="hidden xl:flex flex-col gap-8 w-64 pt-20">
             <div className="space-y-2">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Community Active</h4>
               <div className="flex -space-x-2">
                 {[1,2,3,4,5].map(i => (
                   <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-8 h-8 rounded-full border-2 border-[#1a1a1a]" alt=""/>
                 ))}
                 <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-white/40">
                   +12k
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </LayoutWrapper>
  );
}
