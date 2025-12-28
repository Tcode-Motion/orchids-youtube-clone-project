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
  X,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoData {
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
  { id: 'dashboard', icon: LayoutDashboard, label: 'Control Panel' },
  { id: 'content', icon: Video, label: 'Media Library' },
  { id: 'analytics', icon: BarChart3, label: 'Neural Analytics' },
  { id: 'comments', icon: MessageSquare, label: 'Community' },
  { id: 'subtitles', icon: Subtitles, label: 'Captions' },
  { id: 'copyright', icon: Copyright, label: 'IP Rights' },
  { id: 'earn', icon: DollarSign, label: 'Revenue' },
  { id: 'settings', icon: Settings, label: 'Engine Config' },
];

function formatCount(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return count.toString();
}

export default function StudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
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
          if (videosData) setVideos(videosData as VideoData[]);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12 bg-white/5 border border-white/5 rounded-[40px] max-w-md shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px]" />
          <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-primary shadow-inner">
            <Zap size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4">Command Center</h1>
          <p className="text-white/40 mb-10 leading-relaxed">Please authorize your session to access the neural media management system.</p>
          <button 
            onClick={() => router.push('/auth')}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Authorize Access
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      <header className="fixed top-0 left-0 right-0 h-18 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/50 hover:text-white"
          >
            <Menu size={20} />
          </button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-gradient-to-tr from-primary to-brand-secondary rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                VidStream Neural Studio
              </span>
            </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/upload"
            className="hidden sm:flex items-center gap-2.5 h-11 px-5 bg-primary hover:bg-primary/90 rounded-2xl text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={18} />
            Initialize Broadcast
          </Link>
          <button className="w-11 h-11 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-colors text-white/40">
            <Bell size={20} />
          </button>
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-indigo-600 rounded-[14px] flex items-center justify-center text-white font-bold shadow-lg shadow-primary/10 border border-white/10">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <aside className={`fixed left-0 top-18 bottom-0 bg-[#09090b] border-r border-white/5 transition-all duration-500 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex flex-col h-full">
          {sidebarOpen && channel && (
            <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold">
                    {channel.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{channel.name}</p>
                    <p className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">Verified Entity</p>
                  </div>
                </div>
            </div>
          )}

          <nav className="space-y-1.5">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group overflow-hidden ${
                  activeSection === item.id 
                    ? 'text-white' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeSection === item.id && (
                  <motion.div layoutId="studio-active-pill" className="absolute inset-0 bg-primary shadow-lg shadow-primary/20" />
                )}
                <item.icon size={20} className="relative z-10" />
                {sidebarOpen && <span className="text-sm font-semibold relative z-10">{item.label}</span>}
              </button>
            ))}
          </nav>
          
          <div className="mt-auto p-4 opacity-20">
             <p className="text-[10px] font-bold tracking-[0.2em] uppercase">VidStream Neural Studio</p>
          </div>
        </div>
      </aside>

      <main className={`pt-18 transition-all duration-500 min-h-screen ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto">
          {activeSection === 'dashboard' && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 text-primary mb-3">
                    <Zap size={20} />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">Neural Uplink Active</span>
                  </div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">System Overview</h1>
                </div>
                <Link href="/upload" className="h-12 px-8 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-white font-bold transition-all flex items-center gap-3 shadow-xl">
                  <Upload size={18} />
                  Manual Upload
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Engagement', value: formatCount(videos.reduce((a, v) => a + v.view_count, 0)), icon: Eye, color: 'primary' },
                  { label: 'Neural Followers', value: formatCount(channel?.subscriber_count || 0), icon: Users, color: 'brand-secondary' },
                  { label: 'Positive Resonance', value: formatCount(videos.reduce((a, v) => a + v.like_count, 0)), icon: ThumbsUp, color: 'indigo' },
                  { label: 'Active Signals', value: formatCount(videos.reduce((a, v) => a + v.comment_count, 0)), icon: MessageSquare, color: 'rose' }
                ].map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white/5 rounded-[32px] p-8 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-primary transition-all">
                        <stat.icon size={24} />
                      </div>
                      <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">+12.4%</div>
                    </div>
                    <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{stat.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/5 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
                   <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                     <h2 className="text-xl font-bold">Latest Transmissions</h2>
                     <button onClick={() => setActiveSection('content')} className="text-xs font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-all">
                        Access All Media
                     </button>
                   </div>
                   <div className="p-8">
                      {videos.length === 0 ? (
                        <div className="text-center py-20 bg-white/[0.02] rounded-[32px] border border-dashed border-white/5">
                           <Play size={48} className="mx-auto text-white/10 mb-6" />
                           <h3 className="text-lg font-bold mb-2">The Lab is Quiet</h3>
                           <p className="text-white/30 text-sm mb-8 max-w-xs mx-auto">Initialize your first broadcast to begin populating your neural dashboard.</p>
                           <Link href="/upload" className="px-10 py-4 bg-primary hover:bg-primary/90 rounded-2xl text-white font-bold transition-all shadow-lg shadow-primary/20">
                             Launch Stream
                           </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {videos.slice(0, 5).map((v, idx) => (
                            <Link key={v.id} href={`/watch?v=${v.id}`} className="flex gap-6 p-4 rounded-3xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                              <div className="w-40 h-24 rounded-2xl overflow-hidden bg-white/5 relative shrink-0">
                                 <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Play size={20} className="fill-white" />
                                 </div>
                              </div>
                              <div className="flex-1 py-1">
                                 <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">{v.title}</h3>
                                 <div className="flex items-center gap-6 text-sm text-white/30">
                                    <span className="flex items-center gap-1.5"><Eye size={14} /> {formatCount(v.view_count)}</span>
                                    <span className="flex items-center gap-1.5"><ThumbsUp size={14} /> {formatCount(v.like_count)}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(v.published_at).toLocaleDateString()}</span>
                                 </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-white/5 rounded-[40px] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                      <h2 className="text-xl font-bold mb-8">Neural Growth</h2>
                      <div className="space-y-6">
                         <div className="flex items-end gap-1.5 h-32">
                           {[...Array(15)].map((_, i) => (
                             <div key={i} className="flex-1 bg-primary/20 hover:bg-primary rounded-t-lg transition-all" style={{ height: `${30 + Math.random() * 70}%` }} />
                           ))}
                         </div>
                         <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="text-2xl font-black">+{formatCount(1240)}</div>
                            <div className="text-xs font-bold text-primary uppercase tracking-widest">Growth Vector</div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white/5 rounded-[40px] border border-white/5 p-8 shadow-2xl">
                      <h2 className="text-xl font-bold mb-6">Quick Links</h2>
                      <div className="grid grid-cols-2 gap-3">
                         <button className="h-24 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all flex flex-col items-center justify-center gap-2 group">
                            <BarChart3 size={20} className="text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Analytics</span>
                         </button>
                         <button className="h-24 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all flex flex-col items-center justify-center gap-2 group">
                            <Settings size={20} className="text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Engine</span>
                         </button>
                         <button className="h-24 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all flex flex-col items-center justify-center gap-2 group">
                            <DollarSign size={20} className="text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Revenue</span>
                         </button>
                         <button className="h-24 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all flex flex-col items-center justify-center gap-2 group">
                            <HelpCircle size={20} className="text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Support</span>
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[40px] border border-white/5 border-dashed">
               <Sparkles size={64} className="text-primary/20 mb-8" />
               <h2 className="text-2xl font-bold">Feature Under Neural Construction</h2>
               <p className="text-white/30 max-w-sm text-center mt-4">This section is being recalibrated for the VidStream 1.0 update. Access your dashboard for core controls.</p>
               <button onClick={() => setActiveSection('dashboard')} className="mt-10 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all">
                  Return to Matrix
               </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
