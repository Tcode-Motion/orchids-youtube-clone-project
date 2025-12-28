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
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

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
  const now = new Date();
  const published = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - published.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
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
              .eq('subscriber_id', user.id)
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
      await supabase.from('video_likes').upsert({
        user_id: user.id,
        video_id: videoId,
        is_like: newLiked,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,video_id' });
    }
  };

  const handleSubscribe = async () => {
    if (!user || !video?.channel) return;
    
    const newSubscribed = !subscribed;
    setSubscribed(newSubscribed);

    if (newSubscribed) {
      await supabase.from('subscriptions').insert({
        subscriber_id: user.id,
        channel_id: video.channel.id,
        created_at: new Date().toISOString()
      });
    } else {
      await supabase.from('subscriptions').delete()
        .eq('subscriber_id', user.id)
        .eq('channel_id', video.channel.id);
    }
  };

  const handleSaveToWatchLater = async () => {
    if (!user || !videoId) return;
    
    if (savedToWatchLater) {
      await supabase.from('watch_later').delete().eq('user_id', user.id).eq('video_id', videoId);
      setSavedToWatchLater(false);
    } else {
      await supabase.from('watch_later').insert({
        user_id: user.id,
        video_id: videoId,
        created_at: new Date().toISOString()
      });
      setSavedToWatchLater(true);
    }
    setShowMoreMenu(false);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !videoId || !user) return;
    setSubmittingComment(true);

    if (!userChannel) {
      setSubmittingComment(false);
      return;
    }

    const { data: newComment } = await supabase
      .from('comments')
      .insert({
        video_id: videoId,
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

  const handleDownload = () => {
    if (video?.video_url) {
      const link = document.createElement('a');
      link.href = video.video_url;
      link.download = `${video.title}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="pt-[56px] flex flex-col lg:flex-row gap-6 p-6 max-w-[1800px] mx-auto">
          <div className="flex-1">
            <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
            <div className="mt-3 h-6 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
          <div className="w-full lg:w-[400px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <div className="w-40 h-24 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
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
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="pt-[56px] flex items-center justify-center flex-1">
          <p className="text-gray-500">Video not found</p>
        </div>
      </div>
    );
  }

  const videoUrl = video.video_url || 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9]">
      <Masthead />
      <div className="pt-[56px] flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto w-full">
        <div className="flex-1 max-w-[1280px]">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            {video.is_live ? (
              <div className="relative w-full h-full">
                <video
                  src={videoUrl}
                  poster={video.thumbnail_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {formatViews(video.view_count)} watching
                  </span>
                </div>
              </div>
            ) : (
              <video
                src={videoUrl}
                poster={video.thumbnail_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <h1 className="mt-3 text-xl font-semibold text-[#0f0f0f] leading-7">
            {video.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 pb-4 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <Link href={`/channel/${video.channel?.handle?.replace('@', '')}`}>
                <img 
                  src={video.channel?.avatar_url || 'https://picsum.photos/seed/default/40/40'}
                  alt={video.channel?.name}
                  className="w-10 h-10 rounded-full"
                />
              </Link>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Link href={`/channel/${video.channel?.handle?.replace('@', '')}`} className="font-medium text-[#0f0f0f] hover:underline">
                    {video.channel?.name}
                  </Link>
                  {video.channel?.is_verified && (
                    <CheckCircle2 size={14} className="text-[#606060]" />
                  )}
                </div>
                <span className="text-xs text-[#606060]">
                  {formatSubscribers(video.channel?.subscriber_count || 0)} subscribers
                </span>
              </div>
              <button 
                onClick={user ? handleSubscribe : () => {}}
                className={`ml-4 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-colors ${
                  subscribed 
                    ? 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]' 
                    : 'bg-[#0f0f0f] text-white hover:bg-[#272727]'
                }`}
              >
                {subscribed && <Bell size={16} />}
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#f2f2f2] rounded-full overflow-hidden">
                <button 
                  onClick={() => handleLike(true)}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-[#e5e5e5] transition-colors border-r border-[#ccc] ${liked === true ? 'text-[#065fd4]' : ''}`}
                >
                  <ThumbsUp size={20} fill={liked === true ? 'currentColor' : 'none'} />
                  <span className="font-medium text-sm">{formatViews(video.like_count + (liked === true ? 1 : 0))}</span>
                </button>
                <button 
                  onClick={() => handleLike(false)}
                  className={`flex items-center px-4 py-2 hover:bg-[#e5e5e5] transition-colors ${liked === false ? 'text-[#065fd4]' : ''}`}
                >
                  <ThumbsDown size={20} fill={liked === false ? 'currentColor' : 'none'} />
                </button>
              </div>
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5] transition-colors"
              >
                <Share2 size={20} />
                <span className="font-medium text-sm">Share</span>
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5] transition-colors"
              >
                <Download size={20} />
                <span className="font-medium text-sm">Download</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5] transition-colors"
                >
                  <MoreHorizontal size={20} />
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e5e5e5] py-2 z-50">
                    <button 
                      onClick={handleSaveToWatchLater}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-[#f2f2f2] text-left"
                    >
                      <Clock size={20} />
                      <span className="text-sm">{savedToWatchLater ? 'Remove from Watch later' : 'Save to Watch later'}</span>
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-[#f2f2f2] text-left">
                      <ListPlus size={20} />
                      <span className="text-sm">Save to playlist</span>
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-[#f2f2f2] text-left">
                      <Flag size={20} />
                      <span className="text-sm">Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 bg-[#f2f2f2] rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#0f0f0f]">
              <span>{formatViews(video.view_count)} views</span>
              <span>&middot;</span>
              <span>{formatDate(video.published_at)}</span>
            </div>
            <div className={`mt-2 text-sm text-[#0f0f0f] whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-2' : ''}`}>
              {video.description || 'No description available.'}
            </div>
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-2 text-sm font-medium text-[#0f0f0f] hover:underline flex items-center gap-1"
            >
              {showFullDescription ? (
                <>Show less <ChevronUp size={16} /></>
              ) : (
                <>Show more <ChevronDown size={16} /></>
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{formatViews(comments.length)} Comments</h2>
              <button className="flex items-center gap-2 text-sm font-medium text-[#0f0f0f]">
                <SortDesc size={20} />
                Sort by
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-10 h-10 bg-[#ef4444] rounded-full flex items-center justify-center text-white font-medium shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={user ? "Add a comment..." : "Sign in to comment"}
                  disabled={!user}
                  className="w-full bg-transparent border-b border-[#e5e5e5] focus:border-[#0f0f0f] outline-none pb-2 text-sm disabled:cursor-not-allowed"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                {commentText && (
                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      onClick={() => setCommentText('')}
                      className="px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] rounded-full"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmitComment}
                      disabled={submittingComment || !userChannel}
                      className="px-4 py-2 text-sm font-medium bg-[#065fd4] text-white rounded-full hover:bg-[#0556be] disabled:opacity-50"
                    >
                      {submittingComment ? 'Posting...' : 'Comment'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-[#606060] text-sm italic">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <img 
                      src={comment.channel?.avatar_url || 'https://picsum.photos/seed/user/40/40'}
                      alt={comment.channel?.name || 'User'}
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.channel?.handle || '@user'}</span>
                        <span className="text-xs text-[#606060]">{timeAgo(comment.created_at || new Date().toISOString())}</span>
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-sm text-[#606060] hover:text-[#0f0f0f]">
                          <ThumbsUp size={16} />
                          <span>{comment.like_count || 0}</span>
                        </button>
                        <button className="text-[#606060] hover:text-[#0f0f0f]">
                          <ThumbsDown size={16} />
                        </button>
                        <button className="text-sm font-medium text-[#606060] hover:text-[#0f0f0f]">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] shrink-0">
          <div className="space-y-3">
            {relatedVideos.map((related) => (
              <Link 
                key={related.id} 
                href={`/watch?v=${related.id}`}
                className="flex gap-2 group"
              >
                <div className="relative w-40 h-[90px] rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  <img 
                    src={related.thumbnail_url || 'https://picsum.photos/seed/default/168/94'}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {related.is_live ? (
                    <span className="absolute bottom-1 left-1 bg-[#cc0000] text-white text-[10px] font-medium px-1 rounded-sm uppercase">
                      Live
                    </span>
                  ) : (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 rounded">
                      {formatDuration(related.duration)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2 leading-5">
                    {related.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-[#606060]">{related.channel?.name}</span>
                    {related.channel?.is_verified && (
                      <CheckCircle2 size={10} className="text-[#606060]" />
                    )}
                  </div>
                  <div className="text-xs text-[#606060]">
                    {formatViews(related.view_count)} views &middot; {timeAgo(related.published_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5]">
              <h3 className="text-lg font-semibold">Share</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-[#f2f2f2] rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex gap-4 justify-center mb-6">
                <button 
                  onClick={() => {
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(window.location.href)}`;
                    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                    <Twitter size={24} className="text-white" fill="currentColor" />
                  </div>
                  <span className="text-xs">Twitter</span>
                </button>
                <button 
                  onClick={() => {
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center">
                    <Facebook size={24} className="text-white" fill="currentColor" />
                  </div>
                  <span className="text-xs">Facebook</span>
                </button>
                <button 
                  onClick={() => {
                    const url = `https://wa.me/?text=${encodeURIComponent(video.title + ' ' + window.location.href)}`;
                    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                    <MessageCircle size={24} className="text-white" fill="currentColor" />
                  </div>
                  <span className="text-xs">WhatsApp</span>
                </button>
                <button 
                  onClick={() => {
                    const url = `mailto:?subject=${encodeURIComponent(video.title)}&body=${encodeURIComponent('Check out this video: ' + window.location.href)}`;
                    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-[#EA4335] rounded-full flex items-center justify-center">
                    <Mail size={24} className="text-white" />
                  </div>
                  <span className="text-xs">Email</span>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#f2f2f2] rounded-lg p-2">
                <input 
                  type="text" 
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  readOnly
                  className="flex-1 bg-transparent text-sm outline-none px-2 truncate"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#065fd4] text-white hover:bg-[#0556be]'}`}
                >
                  {copied ? (
                    <span className="flex items-center gap-1"><Check size={16} /> Copied!</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy size={16} /> Copy</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white">
        <Masthead />
        <div className="pt-[56px] flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}
