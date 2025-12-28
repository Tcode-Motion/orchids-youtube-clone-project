"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { History, Clock, ThumbsUp, ListVideo, PlaySquare, ChevronRight, User } from 'lucide-react';
import Masthead from '@/components/sections/masthead';
import Sidebar from '@/components/sections/sidebar';
import MobileNav from '@/components/sections/mobile-nav';

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  view_count: number;
  published_at: string;
  channel: {
    name: string;
    handle: string;
  };
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return 'LIVE';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (views >= 1000000) return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return views.toString();
}

export default function YouPage() {
  const [user, setUser] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: channelData } = await supabase
          .from('channels')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setChannel(channelData);
      }

      const { data: videos } = await supabase
        .from('videos')
        .select(`
          *,
          channel:channels(name, handle)
        `)
        .order('published_at', { ascending: false })
        .limit(8);
      
      if (videos) {
        setRecentVideos(videos as Video[]);
      }
      setLoading(false);
    }

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sections = [
    { icon: History, label: 'History', href: '/history', count: null },
    { icon: PlaySquare, label: 'Your videos', href: '/studio', count: channel?.video_count || 0 },
    { icon: Clock, label: 'Watch later', href: '/playlist?list=WL', count: null },
    { icon: ThumbsUp, label: 'Liked videos', href: '/playlist?list=LL', count: null },
    { icon: ListVideo, label: 'Playlists', href: '/playlists', count: null },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Masthead onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 ml-0 md:ml-[72px] lg:ml-[240px] pb-16 md:pb-0 transition-all duration-300">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-full bg-[#f2f2f2] flex items-center justify-center mb-4">
                  <User size={48} className="text-[#606060]" />
                </div>
                <h1 className="text-2xl font-medium text-[#0f0f0f] mb-2">Enjoy your favorite videos</h1>
                <p className="text-[#606060] mb-4 text-center max-w-md">
                  Sign in to access videos that you&apos;ve liked or saved
                </p>
                <Link 
                  href="/auth"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#065fd4] text-white rounded-full font-medium hover:bg-[#0556bf] transition-colors"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-full bg-[#065fd4] flex items-center justify-center text-white text-3xl font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-medium text-[#0f0f0f]">
                      {channel?.name || user.email?.split('@')[0] || 'Your Channel'}
                    </h1>
                    <p className="text-[#606060]">
                      {channel?.handle || `@${user.email?.split('@')[0]}`}
                    </p>
                    {channel && (
                      <Link 
                        href={`/channel/${channel.handle}`}
                        className="text-[#065fd4] text-sm font-medium hover:text-[#0556bf]"
                      >
                        View channel
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <Link
                        key={section.href}
                        href={section.href}
                        className="flex flex-col items-center p-4 rounded-xl bg-[#f2f2f2] hover:bg-[#e5e5e5] transition-colors"
                      >
                        <Icon size={28} className="text-[#0f0f0f] mb-2" />
                        <span className="text-sm font-medium text-[#0f0f0f]">{section.label}</span>
                        {section.count !== null && section.count > 0 && (
                          <span className="text-xs text-[#606060] mt-0.5">{section.count} videos</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-[#0f0f0f]">History</h2>
                    <Link 
                      href="/history"
                      className="flex items-center gap-1 text-sm font-medium text-[#065fd4] hover:text-[#0556bf]"
                    >
                      View all
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                  
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col">
                          <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
                          <div className="mt-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {recentVideos.slice(0, 4).map((video) => (
                        <Link key={video.id} href={`/watch?v=${video.id}`} className="group">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
                            <img 
                              src={video.thumbnail_url || 'https://picsum.photos/seed/default/320/180'}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                              {formatDuration(video.duration)}
                            </div>
                          </div>
                          <div className="mt-2">
                            <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2">{video.title}</h3>
                            <p className="text-xs text-[#606060] mt-1">
                              {video.channel?.name} • {formatViews(video.view_count)} views
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-[#0f0f0f]">Watch later</h2>
                    <Link 
                      href="/playlist?list=WL"
                      className="flex items-center gap-1 text-sm font-medium text-[#065fd4] hover:text-[#0556bf]"
                    >
                      View all
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recentVideos.slice(4, 8).map((video) => (
                      <Link key={video.id} href={`/watch?v=${video.id}`} className="group">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
                          <img 
                            src={video.thumbnail_url || 'https://picsum.photos/seed/default/320/180'}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2">{video.title}</h3>
                          <p className="text-xs text-[#606060] mt-1">
                            {video.channel?.name} • {formatViews(video.view_count)} views
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
