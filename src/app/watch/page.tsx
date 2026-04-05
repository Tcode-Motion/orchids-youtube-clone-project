'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Video, Channel, Comment, VideoWithChannel } from '@/lib/supabase/types';
import {
  ThumbsUp, ThumbsDown, Share2, MoreHorizontal, CheckCircle2,
  X, Copy, MessageCircle, Check, Clock, ListPlus, Bookmark,
  Eye, Play, Zap, Send, ChevronDown, ChevronUp, Flag
} from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { formatViews, formatSubscribers, formatDuration, timeAgo, formatDate } from '@/lib/utils/format';
import { buildYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/utils/youtube';
import { getVideo, getRelated } from '@/app/actions/youtube';

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
  const [copied, setCopied] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [savedToWatchLater, setSavedToWatchLater] = useState(false);
  const [userChannel, setUserChannel] = useState<Channel | null>(null);
  const [pageUrl, setPageUrl] = useState('');

  // Set URL client-side only to avoid SSR mismatch
  useEffect(() => {
    setPageUrl(window.location.href);
  }, [videoId]);

  // Deprecated: Keeping for reference but bypassing Supabase to save DB load
  const addToHistoryDatabase = useCallback(async (userId: string, vId: string) => {
    // supabase logic bypassed
  }, []);

  useEffect(() => {
    if (!videoId) return;

    async function fetchVideo() {
      if (!videoId) return;
      
      const [youtubeVideoData, youtubeRelatedData] = await Promise.all([
        getVideo(videoId),
        getRelated(videoId)
      ]);

      if (youtubeVideoData) {
        setVideo(youtubeVideoData);
        // Save zero-database-load history to LocalStorage
        try {
          const historyRaw = localStorage.getItem('vidstrim_history');
          let history = historyRaw ? JSON.parse(historyRaw) : [];
          history = history.filter((v: any) => v.youtube_id !== youtubeVideoData.youtube_id);
          history.unshift({ ...youtubeVideoData, watched_at: new Date().toISOString() });
          if (history.length > 100) history.pop(); // Max 100 items
          localStorage.setItem('vidstrim_history', JSON.stringify(history));
        } catch (err) {
          console.error('Failed to save watch history locally', err);
        }
      }
      if (youtubeRelatedData) {
        setRelatedVideos(youtubeRelatedData);
      }

      // Supabase user details for interactive portions (Likes, comments, etc)
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: ch } = await supabase.from('channels').select('*').eq('user_id', user.id).single();
        if (ch) setUserChannel(ch);

        // Try to add to history if safe to do so (Deprecated for DB)
        // try {
        //   await addToHistoryDatabase(user.id, videoId);
        // } catch (e) {}

        // Try to sync likes
        try {
          const { data: likeData } = await supabase
            .from('video_likes').select('is_like')
            .eq('user_id', user.id).eq('video_id', videoId).single();
          if (likeData) setLiked(likeData.is_like);
        } catch (e) {}

        try {
          const { data: wlData } = await supabase
             .from('watch_later').select('id')
             .eq('user_id', user.id).eq('video_id', videoId).single();
          if (wlData) setSavedToWatchLater(true);
        } catch(e) {}
      }

      // Try fetching local comments for this video
      try {
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*, channel:channels(*)')
          .eq('video_id', videoId)
          .is('parent_id', null)
          .order('created_at', { ascending: false })
          .limit(50);
        if (commentsData) setComments(commentsData as (Comment & { channel: Channel })[]);
      } catch (e) {}

      setLoading(false);
    }

    fetchVideo();
  }, [videoId]);

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
    const newSub = !subscribed;
    setSubscribed(newSub);
    if (newSub) {
      await supabase.from('subscriptions').insert({ user_id: user.id, channel_id: video.channel.id, notifications_enabled: true });
    } else {
      await supabase.from('subscriptions').delete().eq('user_id', user.id).eq('channel_id', video.channel.id);
    }
  };

  const handleWatchLater = async () => {
    if (!user || !videoId) return;
    const newSaved = !savedToWatchLater;
    setSavedToWatchLater(newSaved);
    if (newSaved) {
      await supabase.from('watch_later').insert({ user_id: user.id, video_id: videoId });
    } else {
      await supabase.from('watch_later').delete().eq('user_id', user.id).eq('video_id', videoId);
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
        like_count: 0,
        reply_count: 0,
      })
      .select('*, channel:channels(*)')
      .single();

    if (newComment) {
      setComments([newComment as (Comment & { channel: Channel }), ...comments]);
      setCommentText('');
    }
    setSubmittingComment(false);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background pt-18">
        <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-[1800px] mx-auto w-full">
          <div className="flex-1">
            <div className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
            <div className="mt-6 space-y-4">
              <div className="h-8 bg-white/5 rounded-2xl animate-pulse w-3/4" />
              <div className="h-5 bg-white/5 rounded-xl animate-pulse w-1/2" />
              <div className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          </div>
          <div className="w-full lg:w-[400px] space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-40 h-24 bg-white/5 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-white/40 gap-4 pt-18">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center">
          <Play size={40} className="text-white/20" />
        </div>
        <p className="text-xl font-bold">Video not found</p>
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to home</Link>
      </div>
    );
  }

  // Determine player type
  const isYouTube = video.video_source === 'youtube' && video.youtube_id;
  const embedUrl = isYouTube ? buildYouTubeEmbedUrl(video.youtube_id!, true) : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] pt-18">
      <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8 max-w-[1800px] mx-auto w-full">
        {/* Main Player Area */}
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative">
            {isYouTube ? (
              <iframe
                src={embedUrl!}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={video.title}
              />
            ) : (
              <video
                src={video.video_url || ''}
                poster={video.thumbnail_url || undefined}
                controls
                autoPlay
                className="w-full h-full object-contain"
                controlsList="nodownload"
              />
            )}

            {video.is_live && (
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-2 shadow-lg uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  Live
                </div>
              </div>
            )}
          </div>

          {/* Title & Actions */}
          <div className="mt-6">
            <h1 className="text-xl lg:text-2xl font-black text-white leading-tight tracking-tight mb-5">{video.title}</h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-white/5">
              {/* Channel Info */}
              <div className="flex items-center gap-3">
                <Link href={`/channel/${video.channel?.handle?.replace('@', '')}`} className="relative group/av shrink-0">
                  <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl opacity-0 group-hover/av:opacity-100 transition-all blur" />
                  <img
                    src={video.channel?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${video.channel?.id}`}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-background relative z-10"
                  />
                </Link>
                <div>
                  <Link href={`/channel/${video.channel?.handle?.replace('@', '')}`} className="font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    {video.channel?.name}
                    {video.channel?.is_verified && <CheckCircle2 size={14} className="text-indigo-400" />}
                  </Link>
                  <span className="text-sm text-white/40">{formatSubscribers(video.channel?.subscriber_count || 0)} followers</span>
                </div>
                <button
                  onClick={user ? handleSubscribe : () => {}}
                  className={`ml-2 px-6 h-10 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                    subscribed
                      ? 'bg-white/8 text-white/60 hover:bg-white/12'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.02]'
                  }`}
                >
                  <Zap size={15} />
                  {subscribed ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Like/Dislike */}
                <div className="flex items-center bg-white/5 rounded-2xl overflow-hidden border border-white/5 p-1">
                  <button
                    onClick={() => handleLike(true)}
                    className={`flex items-center gap-2 px-4 h-9 hover:bg-white/5 rounded-xl transition-all text-sm font-bold ${liked === true ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/60'}`}
                  >
                    <ThumbsUp size={16} className={liked === true ? 'fill-indigo-400' : ''} />
                    <span>{formatViews(video.like_count)}</span>
                  </button>
                  <div className="w-px h-5 bg-white/10" />
                  <button
                    onClick={() => handleLike(false)}
                    className={`flex items-center px-4 h-9 hover:bg-white/5 rounded-xl transition-all ${liked === false ? 'text-rose-400 bg-rose-500/10' : 'text-white/60'}`}
                  >
                    <ThumbsDown size={16} className={liked === false ? 'fill-rose-400' : ''} />
                  </button>
                </div>

                <button
                  onClick={handleWatchLater}
                  className={`flex items-center gap-2 px-4 h-10 rounded-2xl border transition-all font-bold text-sm ${
                    savedToWatchLater
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                      : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <Clock size={15} />
                  {savedToWatchLater ? 'Saved' : 'Watch Later'}
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 h-10 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm text-white/60"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 bg-white/[0.03] border border-white/5 rounded-3xl p-5 relative overflow-hidden">
              <div className="flex items-center gap-4 text-sm font-bold text-white mb-3">
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-indigo-400" />
                  {formatViews(video.view_count)} views
                </div>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="text-white/50">{formatDate(video.published_at)}</div>
              </div>
              <div className={`text-sm leading-relaxed text-white/60 whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                {video.description || 'No description available for this video.'}
              </div>
              {video.description && video.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {showFullDescription ? <><ChevronUp size={14} />Show less</> : <><ChevronDown size={14} />Show more</>}
                </button>
              )}
            </div>

            {/* Comments */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle size={20} className="text-indigo-400" />
                <h2 className="text-lg font-bold">{formatViews(comments.length)} Comments</h2>
              </div>

              {/* Comment input */}
              {user ? (
                <div className="flex gap-4 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold shrink-0">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full bg-white/5 border-b-2 border-white/10 focus:border-indigo-500 outline-none py-2 text-sm text-white placeholder:text-white/25 resize-none transition-all rounded-t-xl px-3 pt-3"
                    />
                    {commentText && (
                      <div className="flex justify-end gap-2 mt-3">
                        <button onClick={() => setCommentText('')} className="px-4 h-9 rounded-xl text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!commentText.trim() || submittingComment}
                          className="px-6 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2"
                        >
                          {submittingComment ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={13} />}
                          Comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                  <p className="text-sm text-white/40">Sign in to leave a comment</p>
                  <Link href="/auth" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Sign In</Link>
                </div>
              )}

              <div className="space-y-6">
                {comments.map((comment) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={comment.id} className="flex gap-4 group">
                    <img
                      src={comment.channel?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${comment.user_id}`}
                      alt=""
                      className="w-10 h-10 rounded-2xl object-cover border border-white/5 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {comment.channel?.name || 'User'}
                        </span>
                        <span className="text-[11px] text-white/25">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-indigo-400 transition-colors">
                          <ThumbsUp size={13} /> {comment.like_count || 0}
                        </button>
                        <button className="text-xs font-bold text-white/30 hover:text-rose-400 transition-colors">
                          <ThumbsDown size={13} />
                        </button>
                        {comment.reply_count > 0 && (
                          <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                            {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                          </button>
                        )}
                        <button className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Reply</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="w-full lg:w-[400px] space-y-4">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Zap size={16} />
            <h3 className="text-xs font-black uppercase tracking-[0.15em]">Up Next</h3>
          </div>
          {relatedVideos.map((v) => (
            <Link key={v.id} href={`/watch?v=${v.id}`} className="flex gap-3 group">
              <div className="relative w-44 aspect-video rounded-2xl overflow-hidden bg-white/5 shrink-0 border border-white/5 group-hover:border-indigo-500/40 transition-all">
                <img
                  src={v.thumbnail_url || (v.youtube_id ? `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg` : '')}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                  {formatDuration(v.duration)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors mb-1">
                  {v.title}
                </h4>
                <p className="text-[12px] text-white/40 mb-1">{v.channel?.name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-white/25">
                  <span>{formatViews(v.view_count)} views</span>
                  <span>•</span>
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
              className="bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white">Share</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/40">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Twitter/X', color: '#1DA1F2', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(video.title)}` },
                  { label: 'Facebook', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}` },
                  { label: 'WhatsApp', color: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(video.title + ' ' + pageUrl)}` },
                  { label: 'Email', color: '#EA4335', href: `mailto:?subject=${encodeURIComponent(video.title)}&body=${encodeURIComponent(pageUrl)}` },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareModal(false)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: social.color + '20', color: social.color }}>
                      <span className="text-lg font-black">{social.label.charAt(0)}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{social.label}</span>
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-2 pl-4">
                <span className="flex-1 text-sm text-white/50 truncate font-medium">{pageUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className={`px-5 h-10 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500'}`}
                >
                  {copied ? <><Check size={15} />Copied!</> : <><Copy size={15} />Copy</>}
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#080808] flex items-center justify-center pt-18">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}
