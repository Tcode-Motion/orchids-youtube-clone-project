"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { Radio, Users, CheckCircle2, Eye } from 'lucide-react';
import LayoutWrapper from '@/components/sections/layout-wrapper';

interface LiveStream {
  id: string;
  title: string;
  thumbnail_url: string;
  view_count: number;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

function formatViewers(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return count.toString();
}

export default function LivePage() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveStreams() {
      const { data } = await supabase
        .from('videos')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('is_live', true)
        .order('view_count', { ascending: false });

      if (data) {
        setStreams(data as LiveStream[]);
      }
      setLoading(false);
    }
    fetchLiveStreams();
  }, []);

  if (loading) {
    return (
      <LayoutWrapper>
        <main className="flex-1 overflow-y-auto bg-[#f9f9f9] ml-0 md:ml-[72px] lg:ml-[240px] pb-16 md:pb-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
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
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <Radio size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0f0f0f]">Live</h1>
              <p className="text-sm text-[#606060]">Watch live streams from your favorite creators</p>
            </div>
          </div>

          {streams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[#f2f2f2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio size={48} className="text-[#606060]" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No live streams right now</h2>
              <p className="text-[#606060]">Check back later for live content from creators</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {streams.map((stream) => (
                <Link 
                  key={stream.id}
                  href={`/watch?v=${stream.id}`}
                  className="group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
                    <img
                      src={stream.thumbnail_url || 'https://picsum.photos/seed/live/640/360'}
                      alt={stream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={stream.channel?.avatar_url || 'https://picsum.photos/seed/avatar/40/40'}
                          alt={stream.channel?.name}
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                        <div className="flex items-center gap-1 text-white text-sm font-medium">
                          <span>{stream.channel?.name}</span>
                          {stream.channel?.is_verified && (
                            <CheckCircle2 size={14} fill="white" className="text-black" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        <Eye size={12} />
                        <span>{formatViewers(stream.view_count)} watching</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-medium text-[#0f0f0f] line-clamp-2 group-hover:text-[#065fd4]">
                      {stream.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {streams.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold mb-4">Popular categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {['Gaming', 'Music', 'Sports', 'News', 'Education', 'Entertainment'].map((category) => (
                  <div 
                    key={category}
                    className="aspect-square rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <span className="text-white font-bold">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </LayoutWrapper>
  );
}
