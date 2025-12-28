"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Video, 
  BarChart3, 
  MessageSquare, 
  Subtitles,
  Copyright,
  DollarSign,
  Settings,
  Upload,
  Eye,
  ThumbsUp,
  Users,
  Clock,
  TrendingUp,
  PlayCircle,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Radio,
  ChevronRight,
  Bell,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string;
  is_short: boolean;
  is_live: boolean;
  is_private: boolean;
}

interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar_url: string;
  subscriber_count: number;
  video_count: number;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'content', icon: Video, label: 'Content' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'comments', icon: MessageSquare, label: 'Comments' },
  { id: 'subtitles', icon: Subtitles, label: 'Subtitles' },
  { id: 'copyright', icon: Copyright, label: 'Copyright' },
  { id: 'earn', icon: DollarSign, label: 'Earn' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

function formatCount(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return count.toString();
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export default function StudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

        if (channelData) {
          setChannel(channelData);

          const { data: videosData } = await supabase
            .from('videos')
            .select('*')
            .eq('channel_id', channelData.id)
            .order('created_at', { ascending: false });

          if (videosData) setVideos(videosData);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const totalViews = videos.reduce((acc, v) => acc + v.view_count, 0);
  const totalLikes = videos.reduce((acc, v) => acc + v.like_count, 0);
  const totalComments = videos.reduce((acc, v) => acc + v.comment_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-[#3f3f3f] rounded-full flex items-center justify-center mx-auto mb-6">
            <Video size={40} className="text-white/60" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Sign in to VidStream Studio</h1>
          <p className="text-white/60 mb-6">Manage your videos, view analytics, and grow your channel</p>
          <button 
            onClick={() => router.push('/auth')}
            className="px-6 py-3 bg-[#3ea6ff] text-black font-medium rounded-full hover:bg-[#65b8ff] transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white">
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#282828] border-b border-[#3f3f3f] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#3f3f3f] rounded-full"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <PlayCircle className="text-red-600" size={28} fill="currentColor" />
              <span className="text-lg font-semibold ml-1">Studio</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-[#3ea6ff] text-black font-medium rounded-full hover:bg-[#65b8ff] transition-colors"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Create</span>
          </Link>
          <button className="p-2 hover:bg-[#3f3f3f] rounded-full">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-[#3f3f3f] rounded-full">
            <HelpCircle size={20} />
          </button>
          <div className="w-8 h-8 bg-[#3ea6ff] rounded-full flex items-center justify-center text-black font-medium">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      <aside className={`fixed left-0 top-14 bottom-0 bg-[#282828] border-r border-[#3f3f3f] transition-all duration-300 z-40 ${sidebarOpen ? 'w-56' : 'w-16'}`}>
        <div className="p-4">
          {sidebarOpen && channel && (
            <div className="mb-4 pb-4 border-b border-[#3f3f3f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3ea6ff] rounded-full flex items-center justify-center text-black font-medium">
                  {channel.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{channel.name}</p>
                  <p className="text-xs text-white/60 truncate">{channel.handle}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? 'bg-[#3f3f3f] text-white' 
                    : 'text-white/70 hover:bg-[#3f3f3f]/50 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className={`pt-14 transition-all duration-300 ${sidebarOpen ? 'pl-56' : 'pl-16'}`}>
        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Channel dashboard</h1>
                <Link href="/upload" className="flex items-center gap-2 px-4 py-2 bg-[#3ea6ff] text-black font-medium rounded-lg hover:bg-[#65b8ff] transition-colors">
                  <Upload size={18} />
                  Upload video
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#282828] rounded-xl p-4 border border-[#3f3f3f]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#3ea6ff]/20 rounded-lg flex items-center justify-center">
                      <Eye size={20} className="text-[#3ea6ff]" />
                    </div>
                    <span className="text-white/60 text-sm">Total views</span>
                  </div>
                  <p className="text-3xl font-bold">{formatCount(totalViews)}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp size={12} /> +12.5% from last month
                  </p>
                </div>

                <div className="bg-[#282828] rounded-xl p-4 border border-[#3f3f3f]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-red-500" />
                    </div>
                    <span className="text-white/60 text-sm">Subscribers</span>
                  </div>
                  <p className="text-3xl font-bold">{formatCount(channel?.subscriber_count || 0)}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp size={12} /> +243 this week
                  </p>
                </div>

                <div className="bg-[#282828] rounded-xl p-4 border border-[#3f3f3f]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <ThumbsUp size={20} className="text-green-500" />
                    </div>
                    <span className="text-white/60 text-sm">Total likes</span>
                  </div>
                  <p className="text-3xl font-bold">{formatCount(totalLikes)}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp size={12} /> +8.3% from last month
                  </p>
                </div>

                <div className="bg-[#282828] rounded-xl p-4 border border-[#3f3f3f]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <MessageSquare size={20} className="text-yellow-500" />
                    </div>
                    <span className="text-white/60 text-sm">Comments</span>
                  </div>
                  <p className="text-3xl font-bold">{formatCount(totalComments)}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp size={12} /> +15.2% from last month
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#282828] rounded-xl border border-[#3f3f3f]">
                  <div className="p-4 border-b border-[#3f3f3f] flex items-center justify-between">
                    <h2 className="font-semibold">Latest videos</h2>
                    <button 
                      onClick={() => setActiveSection('content')}
                      className="text-[#3ea6ff] text-sm hover:underline flex items-center gap-1"
                    >
                      View all <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    {videos.length === 0 ? (
                      <div className="text-center py-12">
                        <Video size={48} className="mx-auto text-white/30 mb-4" />
                        <p className="text-white/60 mb-4">No videos uploaded yet</p>
                        <Link 
                          href="/upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3ea6ff] text-black font-medium rounded-lg hover:bg-[#65b8ff] transition-colors"
                        >
                          <Upload size={18} />
                          Upload your first video
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {videos.slice(0, 5).map(video => (
                          <Link 
                            key={video.id}
                            href={`/watch?v=${video.id}`}
                            className="flex gap-4 p-2 rounded-lg hover:bg-[#3f3f3f]/50 transition-colors"
                          >
                            <div className="w-32 h-18 rounded-lg overflow-hidden bg-[#3f3f3f] shrink-0">
                              <img 
                                src={video.thumbnail_url || 'https://picsum.photos/seed/default/160/90'} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">{video.title}</h3>
                              <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                                <span className="flex items-center gap-1">
                                  <Eye size={12} /> {formatCount(video.view_count)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp size={12} /> {formatCount(video.like_count)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare size={12} /> {formatCount(video.comment_count)}
                                </span>
                              </div>
                              <p className="text-xs text-white/40 mt-1">{formatDate(video.published_at)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#282828] rounded-xl border border-[#3f3f3f]">
                  <div className="p-4 border-b border-[#3f3f3f]">
                    <h2 className="font-semibold">Quick actions</h2>
                  </div>
                  <div className="p-4 space-y-2">
                    <Link 
                      href="/upload"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#3f3f3f]/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#3ea6ff]/20 rounded-lg flex items-center justify-center">
                        <Upload size={20} className="text-[#3ea6ff]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Upload video</p>
                        <p className="text-xs text-white/60">Share content with your audience</p>
                      </div>
                    </Link>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#3f3f3f]/50 transition-colors">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Radio size={20} className="text-red-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">Go live</p>
                        <p className="text-xs text-white/60">Start streaming now</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#3f3f3f]/50 transition-colors">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <BarChart3 size={20} className="text-purple-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">View analytics</p>
                        <p className="text-xs text-white/60">Track your performance</p>
                      </div>
                    </button>
                    <Link 
                      href={`/channel/${channel?.handle}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#3f3f3f]/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Eye size={20} className="text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">View channel</p>
                        <p className="text-xs text-white/60">See how viewers see you</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Channel content</h1>
                <Link href="/upload" className="flex items-center gap-2 px-4 py-2 bg-[#3ea6ff] text-black font-medium rounded-lg hover:bg-[#65b8ff] transition-colors">
                  <Plus size={18} />
                  Create
                </Link>
              </div>

              <div className="bg-[#282828] rounded-xl border border-[#3f3f3f] overflow-hidden">
                <div className="flex border-b border-[#3f3f3f]">
                  <button className="px-6 py-3 text-sm font-medium border-b-2 border-[#3ea6ff] text-[#3ea6ff]">
                    Videos
                  </button>
                  <button className="px-6 py-3 text-sm font-medium text-white/60 hover:text-white">
                    Shorts
                  </button>
                  <button className="px-6 py-3 text-sm font-medium text-white/60 hover:text-white">
                    Live
                  </button>
                </div>

                {videos.length === 0 ? (
                  <div className="text-center py-16">
                    <Video size={64} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/60 mb-2">No videos yet</p>
                    <p className="text-white/40 text-sm mb-6">Upload your first video to get started</p>
                    <Link 
                      href="/upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#3ea6ff] text-black font-medium rounded-lg hover:bg-[#65b8ff] transition-colors"
                    >
                      <Upload size={18} />
                      Upload video
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-[#3f3f3f]">
                        <tr className="text-left text-xs text-white/60">
                          <th className="p-4 font-medium">Video</th>
                          <th className="p-4 font-medium">Visibility</th>
                          <th className="p-4 font-medium">Date</th>
                          <th className="p-4 font-medium">Views</th>
                          <th className="p-4 font-medium">Comments</th>
                          <th className="p-4 font-medium">Likes</th>
                          <th className="p-4 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {videos.map(video => (
                          <tr key={video.id} className="border-b border-[#3f3f3f] hover:bg-[#3f3f3f]/30">
                            <td className="p-4">
                              <Link href={`/watch?v=${video.id}`} className="flex items-center gap-4">
                                <div className="w-28 h-16 rounded bg-[#3f3f3f] overflow-hidden shrink-0">
                                  <img 
                                    src={video.thumbnail_url || 'https://picsum.photos/seed/default/112/64'} 
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate max-w-xs">{video.title}</p>
                                  {video.is_short && (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#3f3f3f] rounded">Short</span>
                                  )}
                                </div>
                              </Link>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded ${
                                video.is_private ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                              }`}>
                                {video.is_private ? 'Private' : 'Public'}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-white/60">{formatDate(video.published_at)}</td>
                            <td className="p-4 text-sm">{formatCount(video.view_count)}</td>
                            <td className="p-4 text-sm">{formatCount(video.comment_count)}</td>
                            <td className="p-4 text-sm">{formatCount(video.like_count)}</td>
                            <td className="p-4">
                              <button className="p-2 hover:bg-[#3f3f3f] rounded-full">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-semibold">Channel analytics</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#282828] rounded-xl p-6 border border-[#3f3f3f]">
                  <h3 className="text-white/60 text-sm mb-2">Views (Last 28 days)</h3>
                  <p className="text-3xl font-bold">{formatCount(Math.floor(totalViews * 0.3))}</p>
                  <div className="mt-4 h-24 flex items-end gap-1">
                    {[...Array(28)].map((_, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-[#3ea6ff] rounded-t"
                        style={{ height: `${20 + Math.random() * 80}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#282828] rounded-xl p-6 border border-[#3f3f3f]">
                  <h3 className="text-white/60 text-sm mb-2">Watch time (hours)</h3>
                  <p className="text-3xl font-bold">{formatCount(Math.floor(totalViews * 0.05))}</p>
                  <div className="mt-4 h-24 flex items-end gap-1">
                    {[...Array(28)].map((_, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-purple-500 rounded-t"
                        style={{ height: `${20 + Math.random() * 80}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#282828] rounded-xl p-6 border border-[#3f3f3f]">
                  <h3 className="text-white/60 text-sm mb-2">Subscribers</h3>
                  <p className="text-3xl font-bold">+{formatCount(Math.floor((channel?.subscriber_count || 0) * 0.02))}</p>
                  <div className="mt-4 h-24 flex items-end gap-1">
                    {[...Array(28)].map((_, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-red-500 rounded-t"
                        style={{ height: `${20 + Math.random() * 80}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#282828] rounded-xl border border-[#3f3f3f]">
                <div className="p-4 border-b border-[#3f3f3f]">
                  <h2 className="font-semibold">Top videos</h2>
                </div>
                <div className="p-4">
                  {videos.slice(0, 5).map((video, i) => (
                    <div key={video.id} className="flex items-center gap-4 py-3 border-b border-[#3f3f3f] last:border-0">
                      <span className="text-white/40 w-6 text-center">{i + 1}</span>
                      <div className="w-20 h-12 rounded bg-[#3f3f3f] overflow-hidden shrink-0">
                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{video.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCount(video.view_count)}</p>
                        <p className="text-xs text-white/40">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(activeSection === 'comments' || activeSection === 'subtitles' || activeSection === 'copyright' || activeSection === 'earn' || activeSection === 'settings') && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#3f3f3f] rounded-full flex items-center justify-center mx-auto mb-4">
                {activeSection === 'comments' && <MessageSquare size={40} className="text-white/40" />}
                {activeSection === 'subtitles' && <Subtitles size={40} className="text-white/40" />}
                {activeSection === 'copyright' && <Copyright size={40} className="text-white/40" />}
                {activeSection === 'earn' && <DollarSign size={40} className="text-white/40" />}
                {activeSection === 'settings' && <Settings size={40} className="text-white/40" />}
              </div>
              <h2 className="text-xl font-semibold capitalize mb-2">{activeSection}</h2>
              <p className="text-white/60">This feature is coming soon</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
