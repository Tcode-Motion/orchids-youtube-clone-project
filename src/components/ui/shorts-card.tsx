'use client';

import React, { useState } from 'react';
import type { VideoWithChannel } from '@/lib/supabase/types';
import { ThumbsUp, MessageSquare, Share2, MoreVertical, Play, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

interface ShortsCardProps {
  video: VideoWithChannel;
}

export default function ShortsCard({ video }: ShortsCardProps) {
  const [isMuted, setIsMuted] = useState(true);
  
  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden group snap-start shadow-2xl">
      {/* Video Content / Thumbnail */}
      <div className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center">
        <img 
          src={video.thumbnail_url} 
          alt={video.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
            <Play fill="currentColor" size={32} />
          </div>
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-20">
        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/5 active:scale-95 shadow-lg">
            <ThumbsUp size={24} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">{(video.like_count / 1000).toFixed(1)}K</span>
        </button>

        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/5 active:scale-95 shadow-lg">
            <MessageSquare size={24} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">{(video.comment_count || 412)}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/5 active:scale-95 shadow-lg">
            <Share2 size={24} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">Share</span>
        </button>

        <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/5 shadow-lg">
          <MoreVertical size={24} className="text-white" />
        </button>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="flex items-center gap-3 mb-4 group/channel">
          <img 
            src={video.channel.avatar_url} 
            alt={video.channel.name}
            className="w-10 h-10 rounded-full border-2 border-indigo-500/50 shadow-lg"
          />
          <div className="flex flex-col">
            <span className="text-white font-black text-sm tracking-tight drop-shadow-md">
              {video.channel.name}
            </span>
            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded shadow-sm border border-indigo-500/20 active:bg-indigo-500/20">
              Subscribe
            </button>
          </div>
        </div>
        
        <h3 className="text-white font-bold text-base leading-snug line-clamp-2 drop-shadow-md pr-12">
          {video.title}
        </h3>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1 bg-rose-600 rounded-full text-white text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Shorts
        </div>
      </div>

      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-20 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
