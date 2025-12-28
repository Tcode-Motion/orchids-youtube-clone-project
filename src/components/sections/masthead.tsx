"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Mic, Video, Bell, CircleUserRound, X, Upload, Radio, Settings, HelpCircle, MessageSquare, Moon, Globe, Shield, LogOut, User, DollarSign, ArrowLeft, Sun, Keyboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [theme, setTheme] = useState('light');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: channel } = await supabase
          .from('channels')
          .select('id')
          .eq('user_id', data.user.id)
          .single();
        setHasChannel(!!channel);

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
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        setHasChannel(!!channel);
      } else {
        setHasChannel(false);
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
    { id: 1, channel: 'MrBeast', avatar: 'https://picsum.photos/seed/mrbeast/40/40', message: 'uploaded: I Gave People $1,000,000', time: '2 hours ago', thumbnail: 'https://picsum.photos/seed/vid1/120/68' },
    { id: 2, channel: 'MKBHD', avatar: 'https://picsum.photos/seed/mkbhd/40/40', message: 'uploaded: The BEST Smartphone of 2024!', time: '5 hours ago', thumbnail: 'https://picsum.photos/seed/vid2/120/68' },
    { id: 3, channel: 'Veritasium', avatar: 'https://picsum.photos/seed/veritasium/40/40', message: 'uploaded: The Surprising Truth About Magnets', time: '1 day ago', thumbnail: 'https://picsum.photos/seed/vid3/120/68' },
  ];

  if (showMobileSearch) {
    return (
      <header className="masthead fixed top-0 left-0 right-0 h-[56px] bg-white flex items-center px-2 z-[1000]">
        <button 
          onClick={() => setShowMobileSearch(false)}
          className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#0f0f0f]" />
        </button>
        <form onSubmit={handleSearch} className="flex flex-1 items-center mx-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube"
            autoFocus
            className="flex-1 h-10 px-4 bg-[#f2f2f2] rounded-full outline-none text-[16px] placeholder:text-[#888]"
          />
        </form>
        <button className="p-2 hover:bg-[#f2f2f2] rounded-full">
          <Mic className="w-6 h-6 text-[#0f0f0f]" />
        </button>
      </header>
    );
  }

  return (
    <>
      <header className="masthead fixed top-0 left-0 right-0 h-[56px] bg-white flex items-center justify-between px-2 sm:px-4 z-[1000]">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors flex items-center justify-center"
            aria-label="Guide"
          >
            <Menu className="w-6 h-6 text-[#0f0f0f]" />
          </button>
          
          <Link href="/" className="flex items-center py-[18px] px-2 sm:px-4 cursor-pointer">
            <svg viewBox="0 0 90 20" preserveAspectRatio="xMidYMid meet" focusable="false" className="w-[90px] h-5 hidden sm:block">
              <g viewBox="0 0 90 20" preserveAspectRatio="xMidYMid meet">
                <g>
                  <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"></path>
                  <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"></path>
                </g>
                <g>
                  <path d="M34.6024 19.4328C33.6192 18.9272 32.8304 18.1888 32.2416 17.2272C31.6536 16.2632 31.3576 15.1352 31.3576 13.8416V6.15681C31.3576 4.86321 31.6536 3.73521 32.2416 2.77281C32.8304 1.80881 33.6192 1.07121 34.6024 0.565609C35.5864 0.0576094 36.7 -0.195991 37.9416 -0.195991C39.1832 -0.195991 40.2976 0.0576094 41.2816 0.565609C42.2656 1.07121 43.0552 1.80881 43.6424 2.77281C44.2304 3.73521 44.5264 4.86321 44.5264 6.15681V13.8416C44.5264 15.1352 44.2304 16.2632 43.6424 17.2272C43.0552 18.1888 42.2656 18.9272 41.2816 19.4328C40.2976 19.9408 39.1832 20.1944 37.9416 20.1944C36.7 20.1944 35.5864 19.9408 34.6024 19.4328ZM39.2176 17.0016C39.6384 16.6896 39.9728 16.2624 40.22 15.7176C40.4664 15.1728 40.5896 14.5408 40.5896 13.8216V6.17601C40.5896 5.45681 40.4664 4.82481 40.22 4.27921C39.9728 3.73441 39.6384 3.30721 39.2176 2.99521C38.7968 2.68321 38.3064 2.52721 37.7416 2.52721C37.1768 2.52721 36.6864 2.68321 36.2656 2.99521C35.8456 3.30721 35.512 3.73441 35.264 4.27921C35.0176 4.82481 34.8944 5.45681 34.8944 6.17601V13.8216C34.8944 14.5408 35.0176 15.1728 35.264 15.7176C35.512 16.2624 35.8456 16.6896 36.2656 17.0016C36.6864 17.3136 37.1768 17.4696 37.7416 17.4696C38.3064 17.4696 38.7968 17.3136 39.2176 17.0016Z" fill="#282828"></path>
                  <path d="M56.1696 20L52.5296 10.568V20H48.7928V0.0959952H52.5296V9.5064L56.1696 0.0959952H60.0544L55.8384 10.032L60.1544 20H56.1696Z" fill="#282828"></path>
                  <path d="M64.8608 19.4328C63.8768 18.9272 63.088 18.1888 62.5 17.2272C61.912 16.2632 61.616 15.1352 61.616 13.8416V6.15681C61.616 4.86321 61.912 3.73521 62.5 2.77281C63.088 1.80881 63.8768 1.07121 64.8608 0.565609C65.8448 0.0576094 66.9592 -0.195991 68.2 -0.195991C69.4416 -0.195991 70.556 0.0576094 71.54 0.565609C72.524 1.07121 73.3136 1.80881 73.9016 2.77281C74.4888 3.73521 74.7848 4.86321 74.7848 6.15681V13.8416C74.7848 15.1352 74.4888 16.2632 73.9016 17.2272C73.3136 18.1888 72.524 18.9272 71.54 19.4328C70.556 19.9408 69.4416 20.1944 68.2 20.1944C66.9592 20.1944 65.8448 19.9408 64.8608 19.4328ZM69.476 17.0016C69.8968 16.6896 70.2312 16.2624 70.4784 15.7176C70.7256 15.1728 70.8488 14.5408 70.8488 13.8216V6.17601C70.8488 5.45681 70.7256 4.82481 70.4784 4.27921C70.2312 3.73441 69.8968 3.30721 69.476 2.99521C69.056 2.68321 68.5656 2.52721 68.0008 2.52721C67.436 2.52721 66.9448 2.68321 66.524 2.99521C66.104 3.30721 65.7704 3.73441 65.5224 4.27921C65.276 4.82481 65.1528 5.45681 65.1528 6.17601V13.8216C65.1528 14.5408 65.276 15.1728 65.5224 15.7176C65.7704 16.2624 66.104 16.6896 66.524 17.0016C66.9448 17.3136 67.436 17.4696 68.0008 17.4696C68.5656 17.4696 69.056 17.3136 69.476 17.0016Z" fill="#282828"></path>
                  <path d="M84.5248 0.0959952H88.4104V20H84.5248V0.0959952Z" fill="#282828"></path>
                  <path d="M80.8032 0.0959952V20H76.9176V0.0959952H80.8032Z" fill="#282828"></path>
                </g>
              </g>
            </svg>
            <svg viewBox="0 0 28 20" className="w-7 h-5 sm:hidden">
              <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"></path>
              <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"></path>
            </svg>
          </Link>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-[720px] mx-4">
          <form onSubmit={handleSearch} className="flex flex-1 items-center">
            <div className="flex flex-1 items-center h-10 px-4 bg-white border border-[#ccc] rounded-l-full shadow-inner focus-within:border-[#065fd4] group transition-all">
              <div className="hidden group-focus-within:flex mr-3">
                <Search className="w-5 h-5 text-[#606060]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent outline-none text-[16px] font-normal leading-6 text-[#0f0f0f] placeholder:text-[#888]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-[#f2f2f2] rounded-full"
                >
                  <X className="w-5 h-5 text-[#606060]" />
                </button>
              )}
            </div>
            <button 
              type="submit"
              className="h-10 w-16 flex items-center justify-center bg-[#f8f8f8] border border-[#ccc] border-l-0 rounded-r-full hover:bg-[#f0f0f0] hover:shadow-sm"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[#0f0f0f]" />
            </button>
          </form>
          
          <button 
            className="h-10 w-10 ml-3 flex items-center justify-center bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5] transition-colors"
            aria-label="Search with your voice"
          >
            <Mic className="w-5 h-5 text-[#0f0f0f]" />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setShowMobileSearch(true)}
            className="md:hidden p-2 hover:bg-[#f2f2f2] rounded-full transition-colors"
          >
            <Search className="w-6 h-6 text-[#0f0f0f]" />
          </button>

          {user ? (
            <>
              <div className="relative" ref={createMenuRef}>
                <button 
                  onClick={handleCreateClick}
                  className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors flex items-center justify-center"
                  aria-label="Create"
                >
                  <Video className="w-6 h-6 text-[#0f0f0f]" />
                </button>
                
                {showCreateMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e5e5e5] py-2 z-50">
                    <button 
                      onClick={() => { setShowUploadModal(true); setShowCreateMenu(false); }}
                      className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left"
                    >
                      <Upload size={20} />
                      <span className="text-sm">Upload video</span>
                    </button>
                    <button className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left">
                      <Radio size={20} />
                      <span className="text-sm">Go live</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors flex items-center justify-center relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-6 h-6 text-[#0f0f0f]" />
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-[#cc0000] text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                    {notifications.length}
                  </span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-16px)] sm:w-[480px] max-w-[480px] bg-white rounded-xl shadow-lg border border-[#e5e5e5] z-50 max-h-[80vh] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#e5e5e5] flex items-center justify-between sticky top-0 bg-white">
                      <h3 className="font-medium text-base">Notifications</h3>
                      <Link href="/settings" onClick={() => setShowNotifications(false)} className="p-2 hover:bg-[#f2f2f2] rounded-full">
                        <Settings size={20} />
                      </Link>
                    </div>
                    <div className="overflow-y-auto max-h-[60vh]">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#f2f2f2] cursor-pointer">
                          <img src={notif.avatar} alt={notif.channel} className="w-10 h-10 rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-5">
                              <span className="font-medium">{notif.channel}</span> {notif.message}
                            </p>
                            <p className="text-xs text-[#606060] mt-1">{notif.time}</p>
                          </div>
                          <img src={notif.thumbnail} alt="" className="w-20 h-11 rounded object-cover flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1 hover:bg-[#f2f2f2] rounded-full transition-colors flex items-center justify-center"
                  aria-label="Account"
                >
                  <div className="w-8 h-8 bg-[#ef4444] rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-[#e5e5e5] py-2 z-50 max-h-[80vh] overflow-y-auto">
                    <div className="px-4 py-3 border-b border-[#e5e5e5]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ef4444] rounded-full flex items-center justify-center text-white font-medium">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#0f0f0f] truncate">{user.user_metadata?.name || 'User'}</p>
                          <p className="text-sm text-[#606060] truncate">{user.email}</p>
                        </div>
                      </div>
                      {hasChannel ? (
                        <Link href="/channel/me" onClick={() => setShowUserMenu(false)} className="text-sm text-[#065fd4] hover:underline mt-2 block">
                          View your channel
                        </Link>
                      ) : (
                        <button 
                          onClick={() => { setShowCreateChannelModal(true); setShowUserMenu(false); }}
                          className="text-sm text-[#065fd4] hover:underline mt-2 block"
                        >
                          Create a channel
                        </button>
                      )}
                    </div>
                    <div className="py-1">
                      <Link href="/account" onClick={() => setShowUserMenu(false)} className="flex items-center gap-4 px-4 py-2.5 hover:bg-[#f2f2f2]">
                        <User size={20} />
                        <span className="text-sm">Your channel</span>
                      </Link>
                      <Link href="/purchases" onClick={() => setShowUserMenu(false)} className="flex items-center gap-4 px-4 py-2.5 hover:bg-[#f2f2f2]">
                        <DollarSign size={20} />
                        <span className="text-sm">Purchases and memberships</span>
                      </Link>
                    </div>
                    <div className="border-t border-[#e5e5e5] py-1">
                      <button 
                        onClick={toggleTheme}
                        className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left"
                      >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        <span className="text-sm">Appearance: {theme === 'light' ? 'Light' : 'Dark'}</span>
                      </button>
                      <button className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left">
                        <Globe size={20} />
                        <span className="text-sm">Language: English</span>
                      </button>
                      <button className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left">
                        <Shield size={20} />
                        <span className="text-sm">Restricted Mode: Off</span>
                      </button>
                      <button className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left">
                        <Keyboard size={20} />
                        <span className="text-sm">Keyboard shortcuts</span>
                      </button>
                    </div>
                    <div className="border-t border-[#e5e5e5] py-1">
                      <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-4 px-4 py-2.5 hover:bg-[#f2f2f2]">
                        <Settings size={20} />
                        <span className="text-sm">Settings</span>
                      </Link>
                    </div>
                    <div className="border-t border-[#e5e5e5] py-1">
                      <button className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left">
                        <HelpCircle size={20} />
                        <span className="text-sm">Help</span>
                      </button>
                      <button className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left">
                        <MessageSquare size={20} />
                        <span className="text-sm">Send feedback</span>
                      </button>
                    </div>
                    <div className="border-t border-[#e5e5e5] py-1">
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-[#f2f2f2] text-left"
                      >
                        <LogOut size={20} />
                        <span className="text-sm">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link 
              href="/auth"
              className="flex items-center gap-1.5 px-3 sm:px-4 h-9 border border-[#cce3fc] rounded-full text-[#065fd4] font-medium text-sm hover:bg-[#def1ff] transition-colors"
            >
              <CircleUserRound className="w-5 h-5" />
              <span className="hidden sm:inline">Sign in</span>
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
          onSuccess={() => {
            setHasChannel(true);
            setShowCreateChannelModal(false);
          }}
        />
      )}
    </>
  );
};

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
    if (!user) {
      setUploading(false);
      return;
    }

    const { data: channel } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      setUploading(false);
      return;
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    await supabase.from('videos').insert({
      channel_id: channel.id,
      category_id: categories?.[0]?.id,
      title,
      description,
      thumbnail_url: `https://picsum.photos/seed/${Date.now()}/640/360`,
      video_url: 'https://example.com/video.mp4',
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[900px] max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#e5e5e5]">
          <h2 className="text-lg sm:text-xl font-medium">Upload video</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f2f2f2] rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 'select' ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 bg-[#f2f2f2] rounded-full flex items-center justify-center">
                <Upload size={40} className="text-[#606060] sm:w-12 sm:h-12" />
              </div>
              <p className="text-[15px] mb-2">Drag and drop video files to upload</p>
              <p className="text-[13px] text-[#606060] mb-6">Your videos will be private until you publish them.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-[#065fd4] text-white rounded-sm font-medium text-sm hover:bg-[#0556be]"
              >
                SELECT FILES
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title (required)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Add a title that describes your video"
                      className="w-full px-3 py-2 border border-[#ccc] rounded-lg focus:outline-none focus:border-[#065fd4]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell viewers about your video"
                      rows={4}
                      className="w-full px-3 py-2 border border-[#ccc] rounded-lg focus:outline-none focus:border-[#065fd4] resize-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="aspect-video bg-[#f2f2f2] rounded-lg flex items-center justify-center mb-4">
                  <Video size={48} className="text-[#606060]" />
                </div>
                <p className="text-sm text-[#606060] truncate">
                  File: {selectedFile?.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {step === 'details' && (
          <div className="flex justify-end gap-2 px-4 sm:px-6 py-4 border-t border-[#e5e5e5]">
            <button 
              onClick={() => setStep('select')}
              className="px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] rounded-lg"
            >
              Back
            </button>
            <button 
              onClick={handleUpload}
              disabled={!title || uploading}
              className="px-6 py-2 bg-[#065fd4] text-white rounded-lg font-medium text-sm hover:bg-[#0556be] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateChannelModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !handle) return;
    
    setCreating(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCreating(false);
      return;
    }

    const handleWithAt = handle.startsWith('@') ? handle : `@${handle}`;
    
    const { error } = await supabase.from('channels').insert({
      user_id: user.id,
      name,
      handle: handleWithAt,
      description: '',
      avatar_url: `https://picsum.photos/seed/${Date.now()}/100/100`,
      subscriber_count: 0,
      video_count: 0,
      is_verified: false,
    });

    setCreating(false);
    
    if (!error) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[500px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#e5e5e5]">
          <h2 className="text-lg sm:text-xl font-medium">Create your channel</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f2f2f2] rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f2f2f2] rounded-full flex items-center justify-center text-xl sm:text-2xl font-medium text-[#606060]">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="text-sm text-[#606060]">Your channel picture</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your channel name"
                className="w-full px-3 py-2.5 border border-[#ccc] rounded-lg focus:outline-none focus:border-[#065fd4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Handle</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full px-3 py-2.5 border border-[#ccc] rounded-lg focus:outline-none focus:border-[#065fd4]"
              />
              <p className="text-xs text-[#606060] mt-1">Your handle is your unique identifier on YouTube</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 sm:px-6 py-4 border-t border-[#e5e5e5]">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!name || !handle || creating}
            className="px-6 py-2 bg-[#065fd4] text-white rounded-lg font-medium text-sm hover:bg-[#0556be] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create channel'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Masthead;
