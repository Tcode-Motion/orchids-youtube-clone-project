'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Zap,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  Check,
  Eye,
  History,
  Monitor,
  Activity
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import LayoutWrapper from '@/components/sections/layout-wrapper';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const sections: SettingsSection[] = [
  { id: 'account', title: 'Identity', icon: <User size={18} /> },
  { id: 'appearance', title: 'Visuals', icon: <Palette size={18} /> },
  { id: 'playback', title: 'Performance', icon: <Zap size={18} /> },
  { id: 'notifications', title: 'Alerts', icon: <Bell size={18} /> },
  { id: 'privacy', title: 'Security', icon: <Shield size={18} /> },
];

interface UserSettings {
  theme: string;
  autoplay: boolean;
  ambient_mode: boolean;
  restricted_mode: boolean;
  language: string;
  country: string;
  notifications_subscriptions: boolean;
  notifications_recommendations: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeSection, setActiveSection] = useState('account');
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    autoplay: true,
    ambient_mode: true,
    restricted_mode: false,
    language: 'en',
    country: 'US',
    notifications_subscriptions: true,
    notifications_recommendations: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Load from LocalStorage first (Resilience)
      const cached = localStorage.getItem('vidstrim_settings');
      if (cached) {
        setSettings(JSON.parse(cached));
      }

      if (user) {
        try {
          const { data } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data) {
            const merged = { ...settings, ...data };
            setSettings(merged);
            localStorage.setItem('vidstrim_settings', JSON.stringify(merged));
          }
        } catch (err) {
          console.warn("Supabase settings fetch failed, using local cache.");
        }
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Always persist to local cache immediately
    localStorage.setItem('vidstrim_settings', JSON.stringify(updatedSettings));

    if (user) {
      setSaving(true);
      try {
        await supabase.from('user_settings').upsert({
          user_id: user.id,
          ...updatedSettings,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Cloud sync failed, settings saved locally.");
      }
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
        // Guest mode support
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }
    
    if (newSettings.theme) {
      document.documentElement.classList.toggle('dark', newSettings.theme === 'dark');
    }
  };

  const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`w-14 h-7 rounded-full transition-all relative p-1 ${
        value ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 border border-white/10'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${
        value ? 'ml-7' : 'ml-0'
      }`} />
    </button>
  );

  return (
    <LayoutWrapper>
      <div className="flex-1 min-h-screen bg-[#050505] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">VidStrim Engine Control</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">System Settings</h1>
              <p className="text-white/40 font-medium max-w-lg">
                Manage your cinematic preferences, account identity, and system performance optimizations.
              </p>
            </div>
            
            <AnimatePresence>
              {saved && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-500/5"
                >
                  <Check size={18} />
                  Settings Synced
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar pb-4 lg:pb-0">
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative shrink-0 lg:w-full ${
                        isActive 
                          ? 'text-white bg-indigo-600 shadow-xl shadow-indigo-600/20' 
                          : 'text-white/30 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {section.icon}
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Configuration Panel */}
            <div className="lg:col-span-9">
              <div className="bg-[#0f0f12] rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden p-8 md:p-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] -z-10 rounded-full" />
                
                {activeSection === 'account' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <section>
                      <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-8 border-l-4 border-indigo-600 pl-4">Account Identity</h2>
                      
                      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 group">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition-opacity" />
                          <div className="w-24 h-24 bg-[#1a1a1f] rounded-3xl border border-white/10 flex items-center justify-center text-4xl font-black text-white relative z-10">
                            {user?.email?.charAt(0).toUpperCase() || 'E'}
                          </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-2xl font-black text-white mb-1">{user?.user_metadata?.name || 'VStrim Explorer'}</h3>
                          <p className="text-white/30 font-bold tracking-tight mb-6">{user?.email || 'guest_user@vidstrim.net'}</p>
                          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-indigo-600/20">Manage Identity</button>
                            <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all border border-white/10">Switch User</button>
                          </div>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeSection === 'appearance' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <section>
                      <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-8 border-l-4 border-indigo-600 pl-4">Interface Visuals</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                          onClick={() => saveSettings({ theme: 'dark' })}
                          className={`p-1 bg-[#1a1a1f] rounded-[32px] border-2 transition-all relative overflow-hidden group ${settings.theme === 'dark' ? 'border-indigo-600' : 'border-transparent hover:border-white/10'}`}
                        >
                          <div className="h-32 bg-[#050505] rounded-[28px] overflow-hidden m-1 flex flex-col p-4 border border-white/5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4"><Moon size={16} className="text-indigo-400" /></div>
                            <div className="font-black text-white uppercase tracking-widest text-[10px]">Midnight Onyx</div>
                          </div>
                        </button>
                        <button 
                          onClick={() => saveSettings({ theme: 'light' })}
                          className={`p-1 bg-[#1a1a1f] rounded-[32px] border-2 transition-all relative overflow-hidden group ${settings.theme === 'light' ? 'border-indigo-600' : 'border-transparent hover:border-white/10'}`}
                        >
                          <div className="h-32 bg-white rounded-[28px] overflow-hidden m-1 flex flex-col p-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mb-4"><Sun size={16} className="text-indigo-600" /></div>
                            <div className="font-black text-neutral-800 uppercase tracking-widest text-[10px]">Daylight Silver</div>
                          </div>
                        </button>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeSection === 'playback' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-8 border-l-4 border-indigo-600 pl-4">Engine Performance</h2>
                    
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><Monitor size={24} /></div>
                        <div>
                          <h3 className="font-bold text-white mb-1">Ambient Cinematic Glow</h3>
                          <p className="text-xs text-white/30">Cast content-reactive back-lighting around the player.</p>
                        </div>
                      </div>
                      <Toggle value={settings.ambient_mode} onChange={(v) => saveSettings({ ambient_mode: v })} />
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform"><Activity size={24} /></div>
                        <div>
                          <h3 className="font-bold text-white mb-1">Neural Autoplay</h3>
                          <p className="text-xs text-white/30">Seamlessly transition to high-relevance experiences.</p>
                        </div>
                      </div>
                      <Toggle value={settings.autoplay} onChange={(v) => saveSettings({ autoplay: v })} />
                    </div>
                  </motion.div>
                )}

                {activeSection === 'notifications' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-8 border-l-4 border-indigo-600 pl-4">Signal Processing</h2>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl">
                         <span className="font-bold text-white">Subscription Uplinks</span>
                         <Toggle value={settings.notifications_subscriptions} onChange={(v) => saveSettings({ notifications_subscriptions: v })} />
                       </div>
                       <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl">
                         <span className="font-bold text-white">Neural Recommendations</span>
                         <Toggle value={settings.notifications_recommendations} onChange={(v) => saveSettings({ notifications_recommendations: v })} />
                       </div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all">
                      <img src="/logo.png" className="h-6 w-auto" alt="VidStrim" />
                      <span className="text-[10px] font-black uppercase tracking-widest">VidStrim Engine Core v2.4</span>
                   </div>
                   <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-6 py-3 rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all">
                      <LogOut size={16} />
                      Terminate Session
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
