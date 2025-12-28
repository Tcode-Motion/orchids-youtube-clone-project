"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Mic, Video, Bell, CircleUserRound, X, Upload, Radio, Settings, HelpCircle, MessageSquare, Moon, Globe, Shield, LogOut, User, DollarSign, ArrowLeft, Sun, Keyboard, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface MastheadProps {
  onMenuClick?: () => void;
}

const Masthead: React.FC<MastheadProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [hasChannel, setHasChannel] = useState(false);
  const [channelHandle, setChannelHandle] = useState<string | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [theme, setTheme] = useState('dark');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: channel } = await supabase
          .from('channels')
          .select('id, handle')
          .eq('user_id', data.user.id)
          .single();
        setHasChannel(!!channel);
        setChannelHandle(channel?.handle || null);

        const { data: settings } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('user_id', data.user.id)
          .single();
        if (settings?.theme) {
          setTheme(settings.theme);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: channel } = await supabase
          .from('channels')
          .select('id, handle')
          .eq('user_id', session.user.id)
          .single();
        setHasChannel(!!channel);
        setChannelHandle(channel?.handle || null);
      } else {
        setHasChannel(false);
        setChannelHandle(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/results?search_query=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    router.push('/');
  };

  const handleCreateClick = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!hasChannel) {
      setShowCreateChannelModal(true);
    } else {
      setShowCreateMenu(!showCreateMenu);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    if (user) {
      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, theme: newTheme, updated_at: new Date().toISOString() });
    }
    setShowUserMenu(false);
  };

  const notifications = [
    { id: 1, channel: 'Marques Brownlee', avatar: 'https://picsum.photos/seed/mkbhd/40/40', message: 'The Future of AI is Here', time: '2h ago', thumbnail: 'https://picsum.photos/seed/vid2/120/68' },
    { id: 2, channel: 'Veritasium', avatar: 'https://picsum.photos/seed/veritasium/40/40', message: 'Why Gravity is Not a Force', time: '5h ago', thumbnail: 'https://picsum.photos/seed/vid3/120/68' },
  ];

  if (showMobileSearch) {
    return (
      <header className="fixed top-0 left-0 right-0 h-18 bg-[#050505]/95 backdrop-blur-xl flex items-center px-4 z-[1000] border-b border-white/5">
        <button 
          onClick={() => setShowMobileSearch(false)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <form onSubmit={handleSearch} className="flex flex-1 items-center mx-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            autoFocus
            className="flex-1 h-11 px-5 bg-white/5 rounded-full border border-white/10 outline-none text-[15px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </form>
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-18 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-6 z-[1000] border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-primary to-brand-secondary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white fill-white/20" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              VidStream
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-[600px] mx-8">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full h-11 pl-11 pr-12 bg-white/5 border border-white/10 rounded-2xl outline-none text-sm placeholder:text-white/20 focus:bg-white/[0.08] focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg text-white/40"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
          <button 
            className="w-11 h-11 ml-3 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
            title="Search with voice"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMobileSearch(true)}
            className="md:hidden p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/70"
          >
            <Search className="w-5 h-5" />
          </button>

          {user ? (
            <>
              <div className="relative" ref={createMenuRef}>
                <button 
                  onClick={handleCreateClick}
                  className="px-4 h-11 bg-primary hover:bg-primary/90 rounded-2xl transition-all flex items-center gap-2 text-white font-medium text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline">Create</span>
                </button>
                
                <AnimatePresence>
                  {showCreateMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-[#0f0f12]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50"
                    >
                      <button 
                        onClick={() => { setShowUploadModal(true); setShowCreateMenu(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Upload size={18} />
                        </div>
                        <span className="text-sm font-medium text-white/80">Upload Video</span>
                      </button>
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-left mt-1">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                          <Radio size={18} />
                        </div>
                        <span className="text-sm font-medium text-white/80">Go Live</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-11 h-11 hover:bg-white/5 rounded-2xl transition-colors flex items-center justify-center relative border border-white/5 text-white/60 hover:text-white"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-[360px] bg-[#0f0f12]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-semibold text-white/90">Notifications</h3>
                        <Link href="/settings" onClick={() => setShowNotifications(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                          <Settings size={18} />
                        </Link>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto py-2">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="flex items-start gap-4 px-5 py-3 hover:bg-white/5 transition-colors cursor-pointer group">
                            <img src={notif.avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed text-white/70 group-hover:text-white transition-colors">
                                <span className="font-semibold text-white">{notif.channel}</span> uploaded: {notif.message}
                              </p>
                              <p className="text-xs text-white/30 mt-1">{notif.time}</p>
                            </div>
                            <div className="w-20 h-11 rounded-lg overflow-hidden border border-white/10">
                              <img src={notif.thumbnail} alt="" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-0.5 border-2 border-primary/20 hover:border-primary/50 rounded-2xl transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-tr from-primary to-indigo-600 rounded-[14px] flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-[280px] bg-[#0f0f12]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 py-3"
                    >
                      <div className="px-5 py-3 border-b border-white/5 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-brand-secondary rounded-xl flex items-center justify-center text-white font-bold">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{user.user_metadata?.name || 'Explorer'}</p>
                            <p className="text-xs text-white/40 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          {hasChannel ? (
                            <Link href={`/channel/${channelHandle?.replace('@', '')}`} onClick={() => setShowUserMenu(false)} className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-foreground hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all">
                              Dashboard
                            </Link>
                          ) : (
                            <button 
                              onClick={() => { setShowCreateChannelModal(true); setShowUserMenu(false); }}
                              className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Start Creating
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="px-2 space-y-1">
                        <Link href={`/channel/${channelHandle?.replace('@', '')}`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white">
                          <User size={18} />
                          <span className="text-sm font-medium">My Studio</span>
                        </Link>
                        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white text-left">
                          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                          <span className="text-sm font-medium">Appearance</span>
                        </button>
                        <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 hover:text-white">
                          <Settings size={18} />
                          <span className="text-sm font-medium">Settings</span>
                        </Link>
                        <div className="h-px bg-white/5 mx-3 my-2" />
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-rose-500/10 rounded-xl transition-colors text-rose-400 hover:text-rose-300 text-left"
                        >
                          <LogOut size={18} />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link 
              href="/auth"
              className="px-6 h-11 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-white font-semibold text-sm transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <CircleUserRound className="w-4 h-4" />
              Sign in
            </Link>
          )}
        </div>
      </header>

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}

      {showCreateChannelModal && (
        <CreateChannelModal 
          onClose={() => setShowCreateChannelModal(false)} 
          onSuccess={(handle) => {
            setHasChannel(true);
            setChannelHandle(handle);
            setShowCreateChannelModal(false);
          }}
        />
      )}
    </>
  );
};

// ... UploadModal and CreateChannelModal remain largely same but with dark aesthetic ...
// To save space and focus on redesign, I'll update their container classes in a separate pass if needed
// or just ensure they use the new global styles.

function UploadModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setStep('details');
    }
  };

  const handleUpload = async () => {
    if (!title) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: channel } = await supabase.from('channels').select('id').eq('user_id', user.id).single();
    if (!channel) return;

    const { data: categories } = await supabase.from('categories').select('id').limit(1);

    await supabase.from('videos').insert({
      channel_id: channel.id,
      category_id: categories?.[0]?.id,
      title,
      description,
      thumbnail_url: `https://picsum.photos/seed/${Date.now()}/640/360`,
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: Math.floor(Math.random() * 600) + 60,
      view_count: 0,
      like_count: 0,
      dislike_count: 0,
      comment_count: 0,
      published_at: new Date().toISOString(),
    });

    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[2000] p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-[800px] shadow-2xl overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Share Your Story</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={24} className="text-white/50 hover:text-white" />
          </button>
        </div>

        <div className="p-8">
          {step === 'select' ? (
            <div 
              className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Drag and drop videos</h3>
              <p className="text-white/40 text-sm mb-8">Up to 2GB per file</p>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
              <button className="px-8 py-3 bg-primary hover:bg-primary/90 rounded-2xl text-white font-bold transition-all shadow-lg shadow-primary/20">
                Select Files
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary transition-all text-white"
                      placeholder="What's your video about?"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary transition-all text-white resize-none"
                      placeholder="Give it some context..."
                    />
                  </div>
                </div>
                <div className="aspect-video bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative group overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                   <Video size={48} className="text-white/20 relative z-10" />
                   <p className="text-xs font-medium text-white/60 mt-3 relative z-10">{selectedFile?.name}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setStep('select')} className="px-6 py-3 hover:bg-white/5 rounded-2xl text-white font-bold transition-all border border-white/5">
                  Back
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={!title || uploading}
                  className="px-10 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-2xl text-white font-bold transition-all shadow-lg shadow-primary/20"
                >
                  {uploading ? 'Processing...' : 'Publish Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CreateChannelModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (handle: string) => void }) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !handle) return;
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const handleWithAt = handle.startsWith('@') ? handle : `@${handle}`;
    
    const { error } = await supabase.from('channels').insert({
      user_id: user.id,
      name,
      handle: handleWithAt,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      subscriber_count: 0,
      video_count: 0,
      is_verified: false,
    });

    if (!error) onSuccess(handleWithAt);
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[2000] p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden p-8" 
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary/20">
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
          <h2 className="text-2xl font-bold text-white">Create Your Identity</h2>
          <p className="text-white/40 text-sm mt-2">Set up your channel to start uploading</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary transition-all text-white"
              placeholder="e.g. Awesome Vlogs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Unique Handle</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">@</span>
              <input
                type="text"
                value={handle.replace('@', '')}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full h-12 pl-8 pr-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary transition-all text-white"
                placeholder="handle"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 h-12 hover:bg-white/5 rounded-2xl text-white font-bold transition-all border border-white/5">
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!name || !handle || creating}
            className="flex-1 h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-2xl text-white font-bold transition-all shadow-lg shadow-primary/20"
          >
            {creating ? 'Setting Up...' : 'Launch Channel'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Masthead;
