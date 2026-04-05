'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { VideoWithChannel, WatchHistory, WatchLater, Playlist } from '@/lib/supabase/types';
import { Clock, BookmarkPlus, Heart, History, ListVideo, Download, Play, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoCard from '@/components/ui/video-card';
import EmptyState from '@/components/ui/empty-state';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { timeAgo } from '@/lib/utils/format';

type LibraryTab = 'history' | 'watch-later' | 'liked' | 'playlists';

const tabs = [
  { id: 'history' as const, label: 'History', icon: History },
  { id: 'watch-later' as const, label: 'Watch Later', icon: Clock },
  { id: 'liked' as const, label: 'Liked Videos', icon: Heart },
  { id: 'playlists' as const, label: 'Playlists', icon: ListVideo },
];

export default function LibraryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>('history');
  const [history, setHistory] = useState<(WatchHistory & { video: VideoWithChannel })[]>([]);
  const [watchLater, setWatchLater] = useState<(WatchLater & { video: VideoWithChannel })[]>([]);
  const [likedVideos, setLikedVideos] = useState<VideoWithChannel[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchTabData(activeTab);
  }, [user, activeTab]);

  const fetchTabData = async (tab: LibraryTab) => {
    if (!user) return;
    setLoading(true);

    try {
      if (tab === 'history') {
        const { data } = await supabase
          .from('watch_history')
          .select('*, video:videos(*, channel:channels(*))')
          .eq('user_id', user.id)
          .order('watched_at', { ascending: false })
          .limit(50);
        if (data) setHistory(data as (WatchHistory & { video: VideoWithChannel })[]);
      }

      if (tab === 'watch-later') {
        const { data } = await supabase
          .from('watch_later')
          .select('*, video:videos(*, channel:channels(*))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setWatchLater(data as (WatchLater & { video: VideoWithChannel })[]);
      }

      if (tab === 'liked') {
        const { data } = await supabase
          .from('video_likes')
          .select('video:videos(*, channel:channels(*))')
          .eq('user_id', user.id)
          .eq('is_like', true)
          .order('created_at', { ascending: false });
        if (data) setLikedVideos(data.map((d: any) => d.video).filter(Boolean) as VideoWithChannel[]);
      }

      if (tab === 'playlists') {
        const { data } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        if (data) setPlaylists(data as Playlist[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchLater = async (watchLaterId: string) => {
    await supabase.from('watch_later').delete().eq('id', watchLaterId);
    setWatchLater(prev => prev.filter(w => w.id !== watchLaterId));
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from('watch_history').delete().eq('user_id', user.id);
    setHistory([]);
  };

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video bg-white/5 rounded-2xl mb-3" />
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-white/5 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/5 rounded w-4/5" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ListVideo size={40} className="text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Library</h2>
          <p className="text-white/40 mb-8 max-w-sm mx-auto text-sm">Sign in to access your watch history, saved videos, liked content, and playlists.</p>
          <Link href="/auth?next=/library" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/20">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-[1400px] mx-auto">
      <h1 className="text-3xl font-black text-white mb-8">Your Library</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 h-11 px-5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <SkeletonGrid />
          ) : (
            <>
              {/* HISTORY */}
              {activeTab === 'history' && (
                history.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-white/40 text-sm">{history.length} videos</p>
                      <button
                        onClick={clearHistory}
                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                      >
                        <Trash2 size={14} />
                        Clear History
                      </button>
                    </div>
                    <div className="space-y-4">
                      {history.map((item, i) => (
                        item.video && (
                          <div key={item.id} className="flex gap-4 group">
                            <VideoCard video={item.video} index={i} layout="list" />
                            <div className="text-xs text-white/25 font-medium shrink-0 pt-1">
                              {timeAgo(item.watched_at)}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={<History size={40} />}
                    title="No watch history"
                    description="Videos you watch will appear here so you can easily find them again."
                    action={{ label: 'Explore Videos', href: '/' }}
                  />
                )
              )}

              {/* WATCH LATER */}
              {activeTab === 'watch-later' && (
                watchLater.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {watchLater.map((item, i) => (
                      item.video && (
                        <div key={item.id} className="relative group/wl">
                          <VideoCard video={item.video} index={i} />
                          <button
                            onClick={() => removeFromWatchLater(item.id)}
                            className="absolute top-2 left-2 opacity-0 group-hover/wl:opacity-100 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white/60 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                            title="Remove from Watch Later"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Clock size={40} />}
                    title="Watch Later is empty"
                    description="Save videos to watch later by clicking the bookmark icon on any video."
                    action={{ label: 'Explore Videos', href: '/' }}
                  />
                )
              )}

              {/* LIKED VIDEOS */}
              {activeTab === 'liked' && (
                likedVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {likedVideos.map((video, i) => (
                      <VideoCard key={video.id} video={video} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Heart size={40} />}
                    title="No liked videos yet"
                    description="Videos you like will be saved here automatically."
                    action={{ label: 'Explore Videos', href: '/' }}
                  />
                )
              )}

              {/* PLAYLISTS */}
              {activeTab === 'playlists' && (
                playlists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.map((playlist) => (
                      <Link key={playlist.id} href={`/playlist?list=${playlist.id}`} className="group">
                        <div className="aspect-video bg-white/5 rounded-2xl border border-white/5 group-hover:border-indigo-500/40 transition-all overflow-hidden relative">
                          {playlist.thumbnail_url ? (
                            <img src={playlist.thumbnail_url} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ListVideo size={40} className="text-white/20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className="text-xs font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-lg">
                              {playlist.video_count} videos
                            </span>
                            <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={14} className="text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h3 className="text-sm font-bold text-white/90 group-hover:text-indigo-400 transition-colors">{playlist.title}</h3>
                          <p className="text-xs text-white/40 mt-1">{playlist.is_public ? 'Public' : 'Private'} playlist</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<ListVideo size={40} />}
                    title="No playlists yet"
                    description="Create playlists to organize your favorite videos."
                    action={{ label: 'Explore Videos', href: '/' }}
                  />
                )
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
