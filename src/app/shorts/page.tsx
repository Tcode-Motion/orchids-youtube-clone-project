"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown, CheckCircle2, ArrowLeft, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [shorts, setShorts] = useState<Short[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchShorts() {
      const { data } = await supabase
        .from('videos')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('is_short', true)
        .order('published_at', { ascending: false })
        .limit(20);
      
      if (data && data.length > 0) {
        setShorts(data as Short[]);
      } else {
        // Fallback to latest videos if no shorts found
        const { data: fallbackData } = await supabase
          .from('videos')
          .select(`
            *,
            channel:channels(*)
          `)
          .order('published_at', { ascending: false })
          .limit(20);
        
        if (fallbackData) {
          setShorts(fallbackData as Short[]);
        }
      }
      setLoading(false);
    }
    fetchShorts();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.play().catch(() => setPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [playing, currentIndex]);

  const goToNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPlaying(true);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setPlaying(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') goToNext();
    if (e.key === 'ArrowUp') goToPrev();
    if (e.key === ' ') {
      e.preventDefault();
      setPlaying(!playing);
    }
    if (e.key === 'm') setMuted(!muted);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, playing, muted, shorts.length]);

  const toggleSubscribe = (channelId: string) => {
    setSubscribed(prev => ({ ...prev, [channelId]: !prev[channelId] }));
  };

  const toggleLike = (shortId: string) => {
    setLiked(prev => ({ ...prev, [shortId]: !prev[shortId] }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[2000]">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-[2000]">
        <p className="text-xl">No Shorts available</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-400 hover:underline">Go back</button>
      </div>
    );
  }

  const currentShort = shorts[currentIndex];
  // Use a reliable placeholder video if the URL is dummy
  const videoUrl = currentShort.video_url?.includes('example.com') 
    ? 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' 
    : currentShort.video_url;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-[1100]">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Video className="text-red-600" fill="currentColor" size={24} />
            Shorts
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMuted(!muted)}
            className="p-2 hover:bg-white/10 rounded-full text-white"
          >
            {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full text-white">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      {/* Main Video Container */}
      <div className="relative w-full h-full max-w-[450px] aspect-[9/16] flex items-center bg-[#0f0f0f]">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={currentShort.thumbnail_url}
          loop
          muted={muted}
          playsInline
          className="w-full h-full object-contain"
          onClick={() => setPlaying(!playing)}
        />

        {/* Play/Pause Indicator */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center">
              <Play size={40} className="text-white ml-2" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Sidebar Actions */}
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-6 z-50">
          <button onClick={() => toggleLike(currentShort.id)} className="flex flex-col items-center group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${liked[currentShort.id] ? 'bg-red-600' : 'bg-white/10 group-hover:bg-white/20'}`}>
              <ThumbsUp size={24} className="text-white" fill={liked[currentShort.id] ? "currentColor" : "none"} />
            </div>
            <span className="text-white text-xs mt-1 font-medium">{formatCount(currentShort.like_count + (liked[currentShort.id] ? 1 : 0))}</span>
          </button>

          <button className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <ThumbsDown size={24} className="text-white" />
            </div>
            <span className="text-white text-xs mt-1 font-medium">Dislike</span>
          </button>

          <button className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <MessageCircle size={24} className="text-white" fill="currentColor" />
            </div>
            <span className="text-white text-xs mt-1 font-medium">{formatCount(currentShort.comment_count)}</span>
          </button>

          <button className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <Share2 size={24} className="text-white" fill="currentColor" />
            </div>
            <span className="text-white text-xs mt-1 font-medium">Share</span>
          </button>

          <div className="w-10 h-10 rounded-lg border-2 border-white/20 overflow-hidden bg-white/10">
             <img src={currentShort.thumbnail_url} className="w-full h-full object-cover grayscale opacity-50" alt="audio" />
          </div>
        </div>

        {/* Video Info Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="flex items-center gap-3 mb-4 pointer-events-auto">
            <Link href={`/channel/${currentShort.channel?.handle}`}>
              <img 
                src={currentShort.channel?.avatar_url || 'https://picsum.photos/seed/default/40/40'}
                alt={currentShort.channel?.name}
                className="w-10 h-10 rounded-full border border-white/20"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/channel/${currentShort.channel?.handle}`} className="flex items-center gap-1">
                <span className="text-white font-bold text-sm truncate">
                  @{currentShort.channel?.handle.replace('@', '')}
                </span>
                {currentShort.channel?.is_verified && (
                  <CheckCircle2 size={14} className="text-white" fill="currentColor" />
                )}
              </Link>
            </div>
            <button 
              onClick={() => toggleSubscribe(currentShort.channel?.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                subscribed[currentShort.channel?.id] 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {subscribed[currentShort.channel?.id] ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
          <p className="text-white text-[15px] line-clamp-2 leading-snug mb-2 pointer-events-auto">{currentShort.title}</p>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-red-600 transition-all duration-300" style={{ width: '0%' }} id="shorts-progress" />
        </div>
      </div>

      {/* Vertical Navigation Buttons */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        <button 
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-white"
        >
          <ChevronUp size={32} />
        </button>
        <button 
          onClick={goToNext}
          disabled={currentIndex === shorts.length - 1}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-white"
        >
          <ChevronDown size={32} />
        </button>
      </div>
    </div>
  );
}
