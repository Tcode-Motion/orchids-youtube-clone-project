"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel, Comment } from '@/lib/supabase/types';
import Masthead from '@/components/sections/masthead';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  MoreHorizontal, 
  CheckCircle2,
  Bell,
  ChevronDown,
  ChevronUp,
  SortDesc,
  Copy,
  X,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  Check,
  Clock,
  ListPlus,
  Flag,
  Bookmark,
  Sparkles,
  Eye,
  Play,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoWithChannel extends Video {
  channel: Channel;
}

function formatViews(views: number): string {
  if (views >= 1000000000) return (views / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (views >= 1000000) return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return views.toString();
}

function formatSubscribers(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
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
  const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function WatchContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v');
  
  const [user, setUser] = useState<User | null>(null);
  const [video, setVideo] = useState<VideoWithChannel | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoWithChannel[]>([]);
  const [comments, setComments] = useState<(Comment & { channel: Channel })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [savedToWatchLater, setSavedToWatchLater] = useState(false);
  const [userChannel, setUserChannel] = useState<Channel | null>(null);

  const addToHistory = useCallback(async (userId: string, videoId: string) => {
    const { data: existing } = await supabase
      .from('watch_history')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single();

    if (existing) {
      await supabase
        .from('watch_history')
        .update({ watched_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('watch_history')
        .insert({ user_id: userId, video_id: videoId, watched_at: new Date().toISOString() });
    }
  }, []);

  useEffect(() => {
    if (!videoId) return;

    async function fetchVideo() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: channel } = await supabase
          .from('channels')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (channel) setUserChannel(channel);

        addToHistory(user.id, videoId);
      }

      const { data: videoData } = await supabase
        .from('videos')
        .select(`*, channel:channels(*)`)
        .eq('id', videoId)
        .single();

      if (videoData) {
        setVideo(videoData as VideoWithChannel);

        if (user) {
          const { data: likeData } = await supabase
            .from('video_likes')
            .select('is_like')
            .eq('user_id', user.id)
            .eq('video_id', videoId)
            .single();
          if (likeData) setLiked(likeData.is_like);

          const { data: watchLaterData } = await supabase
            .from('watch_later')
            .select('id')
            .eq('user_id', user.id)
            .eq('video_id', videoId)
            .single();
          if (watchLaterData) setSavedToWatchLater(true);

          if (videoData.channel) {
            const { data: subData } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('user_id', user.id)
              .eq('channel_id', videoData.channel.id)
              .single();
            if (subData) setSubscribed(true);
          }
        }
        
        const { data: related } = await supabase
          .from('videos')
          .select(`*, channel:channels(*)`)
          .neq('id', videoId)
          .eq('is_short', false)
          .limit(20)
          .order('view_count', { ascending: false });
        
        if (related) setRelatedVideos(related as VideoWithChannel[]);

        const { data: commentsData } = await supabase
          .from('comments')
          .select(`*, channel:channels(*)`)
          .eq('video_id', videoId)
          .order('created_at', { ascending: false });
        
        if (commentsData) setComments(commentsData as (Comment & { channel: Channel })[]);
      }
      setLoading(false);
    }

    fetchVideo();
  }, [videoId, addToHistory]);

  const handleLike = async (isLike: boolean) => {
    if (!user || !videoId) return;
    const newLiked = liked === isLike ? null : isLike;
    setLiked(newLiked);

    if (newLiked === null) {
      await supabase.from('video_likes').delete().eq('user_id', user.id).eq('video_id', videoId);
    } else {
      await supabase.from('video_likes').upsert({ user_id: user.id, video_id: videoId, is_like: newLiked });
    }
  };

  const handleSubscribe = async () => {
    if (!user || !video?.channel) return;
    const newSubscribed = !subscribed;
    setSubscribed(newSubscribed);

    if (newSubscribed) {
      await supabase.from('subscriptions').insert({ user_id: user.id, channel_id: video.channel.id });
    } else {
      await supabase.from('subscriptions').delete().eq('user_id', user.id).eq('channel_id', video.channel.id);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !videoId || !user || !userChannel) return;
    setSubmittingComment(true);

    const { data: newComment } = await supabase
        .from('comments')
        .insert({
          video_id: videoId,
          user_id: user.id,
          channel_id: userChannel.id,
          content: commentText.trim(),
          like_count: 0
        })
        .select(`*, channel:channels(*)`)
        .single();

    if (newComment) {
      setComments([newComment as (Comment & { channel: Channel }), ...comments]);
      setCommentText('');
    }
    setSubmittingComment(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#050505]">
        <Masthead />
        <div className="pt-18 flex flex-col lg:flex-row gap-8 p-6 max-w-[1800px] mx-auto w-full">
          <div className="flex-1">
            <div className="aspect-video bg-white/5 rounded-[32px] animate-pulse" />
            <div className="mt-6 h-8 bg-white/5 rounded-2xl animate-pulse w-3/4" />
            <div className="mt-4 h-16 bg-white/5 rounded-2xl animate-pulse" />
          </div>
          <div className="w-full lg:w-[400px] space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-40 h-24 bg-white/5 rounded-2xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/40">Transmission Lost</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <Masthead />
      <div className="pt-18 flex flex-col lg:flex-row gap-8 p-4 lg:p-8 max-w-[1800px] mx-auto w-full">
        {/* Main Player Area */}
        <div className="flex-1 min-w-0">
          <div className="aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/5 relative group">
            {video.video_url?.includes('youtube.com/embed') ? (
              <iframe
                src={`${video.video_url}?autoplay=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={video.video_url || 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                poster={video.thumbnail_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
            
            {video.is_live && (
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                <div className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  LIVE TRANSMISSION
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight mb-6">
              {video.title}
            </h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <Link href={`/channel/${video.channel?.handle}`} className="relative group/avatar">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-brand-secondary rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-all blur-md" />
                  <img 
                    src={video.channel?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.channel?.id}`}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-background relative z-10"
                  />
                </Link>
                <div className="flex flex-col min-w-0">
                  <Link href={`/channel/${video.channel?.handle}`} className="font-bold text-white hover:text-primary transition-colors flex items-center gap-1.5 text-lg">
                    {video.channel?.name}
                    {video.channel?.is_verified && <CheckCircle2 size={16} className="text-primary" />}
                  </Link>
                  <span className="text-sm text-white/40 font-medium">
                    {formatSubscribers(video.channel?.subscriber_count || 0)} followers
                  </span>
                </div>
                <button 
                  onClick={user ? handleSubscribe : () => {}}
                  className={`ml-4 px-8 h-12 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                    subscribed 
                      ? 'bg-white/5 text-white/60 hover:bg-white/10' 
                      : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]'
                  }`}
                >
                  {subscribed ? <Check size={18} /> : <Zap size={18} />}
                  {subscribed ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-white/5 rounded-2xl overflow-hidden border border-white/5 p-1">
                  <button 
                    onClick={() => handleLike(true)}
                    className={`flex items-center gap-2 px-5 h-10 hover:bg-white/5 rounded-xl transition-all ${liked === true ? 'text-primary bg-primary/10' : 'text-white/60'}`}
                  >
                    <ThumbsUp size={20} className={liked === true ? 'fill-primary' : ''} />
                    <span className="font-bold text-sm">{formatViews(video.like_count + (liked === true ? 1 : 0))}</span>
                  </button>
                  <div className="w-px h-6 bg-white/10" />
                  <button 
                    onClick={() => handleLike(false)}
                    className={`flex items-center px-5 h-10 hover:bg-white/5 rounded-xl transition-all ${liked === false ? 'text-rose-500 bg-rose-500/10' : 'text-white/60'}`}
                  >
                    <ThumbsDown size={20} className={liked === false ? 'fill-rose-500' : ''} />
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-6 h-12 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm text-white/80"
                >
                  <Share2 size={18} />
                  Share
                </button>
                
                <button className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-white/60">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            <div className="mt-8 bg-white/5 border border-white/5 rounded-[32px] p-6 lg:p-8 relative overflow-hidden group/desc">
              <div className="flex items-center gap-4 text-sm font-bold text-white mb-4">
                <div className="flex items-center gap-1.5"><Eye size={16} className="text-primary" /> {formatViews(video.view_count)} views</div>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="text-white/60">{new Date(video.published_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
              </div>
              <div className={`text-sm leading-relaxed text-white/70 whitespace-pre-wrap transition-all ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                {video.description || 'No neural description protocol found for this broadcast.'}
              </div>
              <button 
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-4 text-xs font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                {showFullDescription ? 'Recalibrate View -' : 'Expand Uplink +'}
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <MessageCircle size={24} className="text-primary" />
                  {formatViews(comments.length)} Transmissions
                </h2>
              </div>

              <div className="flex gap-5 mb-10">
                <div className="w-12 h-12 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                  {user?.email?.charAt(0).toUpperCase() || 'E'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={user ? "Initialize signal..." : "Authorization required to comment"}
                    disabled={!user}
                    rows={1}
                    className="w-full bg-white/5 border-b border-white/10 focus:border-primary outline-none py-3 text-sm text-white placeholder:text-white/20 resize-none transition-all"
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setCommentText('')} className="px-6 h-10 rounded-xl text-sm font-bold text-white/40 hover:text-white transition-colors">Abort</button>
                    <button 
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || submittingComment}
                      className="px-8 h-10 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-primary/20"
                    >
                      {submittingComment ? 'Sending...' : 'Transmit'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {comments.map((comment) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={comment.id} className="flex gap-5 group">
                    <img 
                      src={comment.channel?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.id}`}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-white/5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{comment.channel?.name}</span>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-xs font-bold text-white/30 hover:text-primary transition-colors">
                          <ThumbsUp size={14} /> {comment.like_count || 0}
                        </button>
                        <button className="text-xs font-bold text-white/30 hover:text-rose-500 transition-colors">
                          <ThumbsDown size={14} />
                        </button>
                        <button className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Reply</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="w-full lg:w-[420px] space-y-6">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Sparkles size={20} />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Neural Sync Feed</h3>
          </div>
          {relatedVideos.map((v) => (
            <Link key={v.id} href={`/watch?v=${v.id}`} className="flex gap-4 group">
              <div className="relative w-44 aspect-video rounded-2xl overflow-hidden bg-white/5 shrink-0 border border-white/5 group-hover:border-primary/50 transition-all">
                <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-lg text-white">
                  {formatDuration(v.duration)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">
                  {v.title}
                </h4>
                <div className="text-[12px] font-medium text-white/40 mb-1">{v.channel?.name}</div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-white/20 uppercase tracking-wider">
                  <span>{formatViews(v.view_count)} views</span>
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  <span>{timeAgo(v.published_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0f0f12] border border-white/10 rounded-[40px] w-full max-w-lg shadow-2xl p-8" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white tracking-tight">Signal Relay</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/40">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-10">
                {[
                  { icon: Twitter, label: 'Twitter', color: '#1DA1F2', url: `https://twitter.com/intent/tweet?url=${window.location.href}` },
                  { icon: Facebook, label: 'Facebook', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}` },
                  { icon: MessageCircle, label: 'WhatsApp', color: '#25D366', url: `https://wa.me/?text=${window.location.href}` },
                  { icon: Mail, label: 'Email', color: '#EA4335', url: `mailto:?body=${window.location.href}` }
                ].map((social, i) => (
                  <button 
                    key={i}
                    onClick={() => window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: social.url } }, "*")}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg" style={{ backgroundColor: social.color + '20', color: social.color }}>
                      <social.icon size={24} fill={social.icon === Twitter || social.icon === Facebook ? 'currentColor' : 'none'} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{social.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-2 pl-5">
                <input 
                  type="text" 
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-white/60 outline-none truncate font-medium"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`px-6 h-11 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Linked' : 'Copy'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={null}>
      <WatchContent />
    </Suspense>
  );
}
