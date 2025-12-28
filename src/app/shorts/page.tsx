"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Short {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatar_url: string;
    is_verified: boolean;
    subscriber_count: number;
  };
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
}

export default function ShortsPage() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchShorts() {
      const { data } = await supabase
        .from('videos')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('is_short', true)
        .order('view_count', { ascending: false })
        .limit(20);
      
      if (data && data.length > 0) {
        setShorts(data as Short[]);
      } else {
        const { data: fallbackData } = await supabase
          .from('videos')
          .select(`
            *,
            channel:channels(*)
          `)
          .order('view_count', { ascending: false })
          .limit(20);
        
        if (fallbackData) {
          setShorts(fallbackData as Short[]);
        }
      }
      setLoading(false);
    }
    fetchShorts();
  }, []);

  const goToNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'j') goToNext();
    if (e.key === 'ArrowUp' || e.key === 'k') goToPrev();
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      setPlaying(!playing);
    }
    if (e.key === 'm') setMuted(!muted);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, playing, muted, shorts.length]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) goToNext();
    else goToPrev();
  };

  const toggleSubscribe = (channelId: string) => {
    setSubscribed(prev => ({ ...prev, [channelId]: !prev[channelId] }));
  };

  const toggleLike = (shortId: string) => {
    setLiked(prev => ({ ...prev, [shortId]: !prev[shortId] }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <p className="text-xl">No Shorts available</p>
        <Link href="/" className="mt-4 text-blue-400 hover:underline">Go back home</Link>
      </div>
    );
  }

  const currentShort = shorts[currentIndex];

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-50">
        <Link href="/" className="text-white flex items-center gap-2">
          <svg viewBox="0 0 90 20" className="w-20 h-5 fill-white">
            <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
            <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
            <path d="M34.6024 19.4328V1.60164H38.4069V15.8949H45.8812V19.4328H34.6024Z" fill="white"/>
            <path d="M46.4062 19.4328V1.60164H50.2107V19.4328H46.4062Z" fill="white"/>
            <path d="M57.2091 19.4328L51.3871 1.60164H55.5148L59.2298 14.2187L62.9448 1.60164H67.0724L61.2505 19.4328H57.2091Z" fill="white"/>
            <path d="M68.4185 19.4328V1.60164H79.1574V5.13949H72.2231V8.67733H78.5267V12.2152H72.2231V15.8949H79.4493V19.4328H68.4185Z" fill="white"/>
          </svg>
          <span className="font-semibold text-lg">Shorts</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50 hidden sm:flex items-center gap-2">
        <button 
          onClick={() => setMuted(!muted)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          {muted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
        </button>
      </div>

      <div className="relative w-full h-full max-w-[400px] max-h-[90vh] flex items-center">
        <div className="relative w-full h-full bg-[#0f0f0f] rounded-xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentShort.thumbnail_url})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={() => setPlaying(!playing)}
              className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              {playing ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white ml-1" />}
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <Link href={`/channel/${currentShort.channel?.handle}`}>
                <img 
                  src={currentShort.channel?.avatar_url || 'https://picsum.photos/seed/default/40/40'}
                  alt={currentShort.channel?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/channel/${currentShort.channel?.handle}`} className="flex items-center gap-1">
                  <span className="text-white font-medium text-sm truncate">
                    {currentShort.channel?.name}
                  </span>
                  {currentShort.channel?.is_verified && (
                    <CheckCircle2 size={14} className="text-white/80" />
                  )}
                </Link>
              </div>
              <button 
                onClick={() => toggleSubscribe(currentShort.channel?.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  subscribed[currentShort.channel?.id] 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                {subscribed[currentShort.channel?.id] ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            <p className="text-white text-sm line-clamp-2">{currentShort.title}</p>
          </div>

          <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
            <button 
              onClick={() => toggleLike(currentShort.id)}
              className="flex flex-col items-center"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                liked[currentShort.id] ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
              }`}>
                <ThumbsUp size={24} className={liked[currentShort.id] ? 'text-black' : 'text-white'} />
              </div>
              <span className="text-white text-xs mt-1">{formatCount(currentShort.like_count + (liked[currentShort.id] ? 1 : 0))}</span>
            </button>

            <button className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <ThumbsDown size={24} className="text-white" />
              </div>
              <span className="text-white text-xs mt-1">Dislike</span>
            </button>

            <button className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <MessageCircle size={24} className="text-white" />
              </div>
              <span className="text-white text-xs mt-1">{formatCount(currentShort.comment_count)}</span>
            </button>

            <button className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Share2 size={24} className="text-white" />
              </div>
              <span className="text-white text-xs mt-1">Share</span>
            </button>

            <button className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <MoreVertical size={24} className="text-white" />
              </div>
            </button>
          </div>
        </div>

        <div className="absolute -right-14 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-3">
          <button 
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <ChevronUp size={24} className="text-white" />
          </button>
          <button 
            onClick={goToNext}
            disabled={currentIndex === shorts.length - 1}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <ChevronDown size={24} className="text-white" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {shorts.slice(Math.max(0, currentIndex - 2), Math.min(shorts.length, currentIndex + 3)).map((_, idx) => {
          const actualIdx = Math.max(0, currentIndex - 2) + idx;
          return (
            <button
              key={actualIdx}
              onClick={() => setCurrentIndex(actualIdx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                actualIdx === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
