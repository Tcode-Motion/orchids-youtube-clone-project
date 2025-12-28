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
    const [channelHandle, setChannelHandle] = useState<string | null>(null);
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
            placeholder="Search VidStream"
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
          
            <Link href="/" className="flex items-center gap-1 py-[18px] px-2 sm:px-4 cursor-pointer">
              <div className="flex items-center gap-1">
                <div className="bg-[#cc0000] p-1 rounded-lg">
                  <Video className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-xl font-bold tracking-tighter text-[#0f0f0f] hidden sm:block">
                  VidStream
                </span>
              </div>
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
                          <Link href={`/channel/${channelHandle?.replace('@', '')}`} onClick={() => setShowUserMenu(false)} className="text-sm text-[#065fd4] hover:underline mt-2 block">
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
                        {hasChannel ? (
                          <Link href={`/channel/${channelHandle?.replace('@', '')}`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-4 px-4 py-2.5 hover:bg-[#f2f2f2]">
                            <User size={20} />
                            <span className="text-sm">Your channel</span>
                          </Link>
                        ) : (
                          <button 
                            onClick={() => { setShowCreateChannelModal(true); setShowUserMenu(false); }}
                            className="flex items-center gap-4 px-4 py-2.5 hover:bg-[#f2f2f2] w-full text-left"
                          >
                            <User size={20} />
                            <span className="text-sm">Create a channel</span>
                          </button>
                        )}
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
              <p className="text-xs text-[#606060] mt-1">Your handle is your unique identifier on VidStream</p>
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
