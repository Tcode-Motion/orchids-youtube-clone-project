"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Mic, Video, Bell, CircleUserRound, X, Upload, Radio, Settings, HelpCircle, MessageSquare, Moon, Globe, Shield, LogOut, User, DollarSign, ArrowLeft, Sun, Keyboard, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { search } from '@/app/actions/youtube';
import type { VideoWithChannel } from '@/lib/supabase/types';

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
  
  // Search Suggestions State
  const [suggestions, setSuggestions] = useState<VideoWithChannel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await search(searchQuery);
          setSuggestions(res.slice(0, 5)); // show top 5
          setShowSuggestions(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e?: React.FormEvent, explicitQuery?: string) => {
    if (e) e.preventDefault();
    const query = explicitQuery || searchQuery;
    if (query.trim()) {
      setShowSuggestions(false);
      setSearchQuery(query);
      router.push(`/results?search_query=${encodeURIComponent(query)}`);
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
        <div className="flex flex-1 items-center mx-3 relative" ref={searchContainerRef}>
          <form onSubmit={(e) => handleSearch(e)} className="w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="Search videos..."
              autoFocus
              className="w-full h-11 px-5 bg-white/5 rounded-full border border-white/10 outline-none text-[15px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-white"
            />
          </form>

          {/* Suggestions Dropdown Mobile */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#1c1b1b] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
              >
                {isSearching ? (
                  <div className="px-4 py-3 text-sm text-neutral-400 animate-pulse">Loading...</div>
                ) : (
                  <>
                    {suggestions.map((s) => (
                      <button 
                        key={s.id} 
                        onClick={() => handleSearch(undefined, s.title)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="text-sm font-medium text-white line-clamp-1">{s.title}</span>
                      </button>
                    ))}
                    <button onClick={() => handleSearch()} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors mt-1 border-t border-white/5">
                      <span className="text-sm font-bold text-indigo-400">Search for "{searchQuery}"</span>
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 w-full z-40 border-b border-white/5 bg-neutral-900/40 backdrop-blur-2xl flex justify-between items-center h-16 px-8 md:pl-72 w-full">
        <div className="flex items-center gap-8">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/" className="flex items-center gap-3 md:hidden">
            <img src="/logo.png" alt="VidStrim" className="h-8 w-auto object-contain" />
          </Link>

          <nav className="hidden lg:flex gap-6 items-center pt-2">
            <Link href="/" className="text-white border-b-2 border-indigo-500 pb-1 font-medium font-sans transition-opacity">Discover</Link>
            <Link href="/trending" className="text-neutral-400 hover:text-neutral-200 font-medium font-sans transition-opacity">Trending</Link>
            <Link href="/live" className="text-neutral-400 hover:text-neutral-200 font-medium font-sans transition-opacity">Live</Link>
          </nav>
        </div>

        <div className="flex-1 max-w-xl px-12 hidden sm:block">
          <div className="relative group" ref={searchContainerRef}>
            <form onSubmit={(e) => handleSearch(e)}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search movies, creators, lives..."
                className="w-full bg-[#1c1b1b] border border-white/5 rounded-full py-2 pl-12 pr-4 text-sm text-[#e5e2e1] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600 outline-none"
              />
            </form>

            {/* Suggestions Dropdown Desktop */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1c1b1b] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                >
                  {isSearching ? (
                    <div className="px-5 py-3 text-sm text-neutral-400 animate-pulse flex items-center gap-3">
                       <Search className="w-4 h-4 text-neutral-600 shrink-0" />
                       Loading suggestions...
                    </div>
                  ) : (
                    <>
                      {suggestions.map((s) => (
                        <button 
                          key={s.id} 
                          onClick={() => handleSearch(undefined, s.title)}
                          className="w-full text-left px-5 py-2.5 hover:bg-white/5 flex items-center gap-3 transition-colors"
                        >
                          <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-white line-clamp-1">{s.title}</span>
                          </div>
                        </button>
                      ))}
                      <button onClick={() => handleSearch()} className="w-full text-left px-5 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors mt-1 border-t border-white/5">
                        <span className="text-sm font-bold text-indigo-400">Search for "{searchQuery}"</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowMobileSearch(true)}
            className="sm:hidden p-2 text-white/70 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </button>

          {user ? (
            <>


              <div className="flex items-center gap-4 text-neutral-400">
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative hover:text-white transition-all p-2 rounded-full ${showNotifications ? 'bg-white/10 text-indigo-400' : 'text-neutral-400'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 border-2 border-[#050505] rounded-full"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0f0f12]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[1001] overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                          <h3 className="font-black text-white tracking-widest text-xs uppercase">Notifications</h3>
                          <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors">Mark all as read</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                          {notifications.map((notif) => (
                            <Link 
                              key={notif.id} 
                              href="#" 
                              className="flex gap-4 px-6 py-4 hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0"
                              onClick={() => setShowNotifications(false)}
                            >
                              <div className="relative shrink-0">
                                <img src={notif.avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-[#0f0f12] flex items-center justify-center">
                                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/90 leading-snug mb-1">
                                  <span className="font-black text-white">{notif.channel}</span> uploaded: {notif.message}
                                </p>
                                <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{notif.time}</span>
                              </div>
                              <div className="shrink-0">
                                <img src={notif.thumbnail} alt="" className="w-16 h-10 rounded-lg object-cover border border-white/10 group-hover:border-indigo-500/50 transition-colors" />
                              </div>
                            </Link>
                          ))}
                        </div>
                        <Link href="/settings" onClick={() => setShowNotifications(false)} className="block py-3 text-center text-xs font-black text-white/30 hover:text-white uppercase tracking-widest bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                          View All Activity
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="focus:outline-none flex items-center">
                    <div className="w-9 h-9 rounded-full border border-white/10 bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                       {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-[#0f0f12]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 py-3"
                      >
                         <div className="px-5 py-2 border-b border-white/5 mb-2">
                           <p className="font-bold text-white truncate">{user.user_metadata?.name || 'Explorer'}</p>
                           <p className="text-xs text-white/40 truncate">{user.email}</p>
                         </div>
                         <Link 
                           href={`/channel/${channelHandle ? channelHandle.replace('@', '') : 'Google'}`} 
                           onClick={() => setShowUserMenu(false)} 
                           className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm"
                         >
                           <User size={16} /> My Channel
                         </Link>

                         <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm">
                           <Settings size={16} /> Settings
                         </Link>
                         <div className="h-px bg-white/5 mx-3 my-2" />
                         <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors text-sm text-left">
                           <LogOut size={16} /> Sign Out
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          ) : (
            <Link 
              href="/auth"
              className="px-6 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-full transition-all flex items-center gap-2"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>
    </>
  );
};

export default Masthead;
