"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Play, 
  Download,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Check,
  Video,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
  Sparkles,
  Smartphone
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const sections: SettingsSection[] = [
  { id: 'account', title: 'Identity', icon: <User size={18} /> },
  { id: 'notifications', title: 'Alerts', icon: <Bell size={18} /> },
  { id: 'playback', title: 'Performance', icon: <Zap size={18} /> },
  { id: 'privacy', title: 'Security', icon: <Shield size={18} /> },
  { id: 'appearance', title: 'Visuals', icon: <Palette size={18} /> },
  { id: 'language', title: 'Localization', icon: <Globe size={18} /> },
  { id: 'billing', title: 'Wallet', icon: <CreditCard size={18} /> },
  { id: 'advanced', title: 'Core', icon: <Settings size={18} /> },
];

interface UserSettings {
  theme: string;
  autoplay: boolean;
  restricted_mode: boolean;
  language: string;
  country: string;
  notifications_subscriptions: boolean;
  notifications_recommendations: boolean;
  notifications_activity: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeSection, setActiveSection] = useState('account');
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    autoplay: true,
    restricted_mode: false,
    language: 'en',
    country: 'US',
    notifications_subscriptions: true,
    notifications_recommendations: true,
    notifications_activity: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setSettings({
            theme: data.theme || 'dark',
            autoplay: data.autoplay ?? true,
            restricted_mode: data.restricted_mode ?? false,
            language: data.language || 'en',
            country: data.country || 'US',
            notifications_subscriptions: data.notifications_subscriptions ?? true,
            notifications_recommendations: data.notifications_recommendations ?? true,
            notifications_activity: data.notifications_activity ?? true,
          });
        }
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    
    setSaving(true);
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase
        .from('user_settings')
        .update({
          ...updatedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...updatedSettings,
        });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    if (newSettings.theme) {
      document.documentElement.classList.toggle('dark', newSettings.theme === 'dark');
    }
  };

  const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`w-12 h-6 rounded-full transition-all relative ${
        value ? 'bg-primary' : 'bg-white/10'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-lg absolute top-1 transition-all ${
        value ? 'left-7' : 'left-1'
      }`} />
    </button>
  );

  return (
    <main className="flex-1 bg-background transition-all duration-500 pt-18 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 text-primary mb-4">
              <Sparkles size={24} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Control Center</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">System Configuration</h1>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-xl border border-primary/20"
              >
                <Check size={16} />
                Sync Complete
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Nav */}
          <nav className="lg:col-span-3">
            <div className="space-y-1 p-2 bg-white/5 border border-white/5 rounded-[32px] sticky top-32">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all group relative overflow-hidden ${
                      isActive ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav-bg"
                        className="absolute inset-0 bg-primary shadow-lg shadow-primary/20"
                      />
                    )}
                    <span className="relative z-10">{section.icon}</span>
                    <span className="relative z-10">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/10 blur-[100px] -z-10" />

               {!user && !loading && (
                 <div className="text-center py-20">
                   <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white/20">
                     <User size={40} />
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
                   <p className="text-white/40 mb-8 max-w-sm mx-auto">Please sign in to access and modify your personalized system settings.</p>
                   <Link href="/auth" className="inline-flex h-12 px-8 items-center bg-primary hover:bg-primary/90 rounded-2xl text-white font-bold transition-all shadow-lg shadow-primary/20">
                     Authorize
                   </Link>
                 </div>
               )}

               {user && (
                 <motion.div
                   key={activeSection}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.3 }}
                 >
                   {activeSection === 'account' && (
                     <div className="space-y-10">
                       <section>
                         <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                           <User className="text-primary" /> Profile Identity
                         </h2>
                         <div className="flex items-center gap-8 p-8 bg-white/5 rounded-3xl border border-white/5">
                           <div className="w-24 h-24 bg-gradient-to-tr from-primary to-brand-secondary rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-primary/20">
                             {user.email?.charAt(0).toUpperCase()}
                           </div>
                           <div className="flex-1">
                             <h3 className="text-xl font-bold text-white mb-1">{user.user_metadata?.name || 'Explorer'}</h3>
                             <p className="text-white/40 font-medium mb-4">{user.email}</p>
                             <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all border border-white/10">
                               Update Identity
                             </button>
                           </div>
                         </div>
                       </section>

                       <section className="space-y-4">
                         <div className="flex items-center justify-between p-6 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group">
                           <div>
                             <h3 className="font-bold text-white mb-1">Creator Hub</h3>
                             <p className="text-sm text-white/40">Manage your published streams and analytics</p>
                           </div>
                           <ChevronRight className="text-white/20 group-hover:text-primary transition-colors" />
                         </div>
                         <div className="flex items-center justify-between p-6 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group">
                           <div>
                             <h3 className="font-bold text-white mb-1">Vault Subscriptions</h3>
                             <p className="text-sm text-white/40">Manage premium access and memberships</p>
                           </div>
                           <ChevronRight className="text-white/20 group-hover:text-primary transition-colors" />
                         </div>
                       </section>
                     </div>
                   )}

                   {activeSection === 'appearance' && (
                     <div className="space-y-10">
                        <section>
                          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <Palette className="text-primary" /> Interface Style
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => saveSettings({ theme: 'dark' })}
                              className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                                settings.theme === 'dark' 
                                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                                  : 'border-white/5 hover:border-white/20 bg-white/5'
                              }`}
                            >
                              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Moon className="text-white" size={20} />
                              </div>
                              <h3 className="font-bold text-white mb-1">Midnight</h3>
                              <p className="text-xs text-white/40">Deep obsidian background with neon accents</p>
                            </button>
                            <button
                              onClick={() => saveSettings({ theme: 'light' })}
                              className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                                settings.theme === 'light' 
                                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                                  : 'border-white/5 hover:border-white/20 bg-white/5'
                              }`}
                            >
                              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Sun className="text-black" size={20} />
                              </div>
                              <h3 className="font-bold text-white mb-1">Daylight</h3>
                              <p className="text-xs text-white/40">Clean white interface for high visibility</p>
                            </button>
                          </div>
                        </section>
                     </div>
                   )}

                   {activeSection === 'playback' && (
                     <div className="space-y-8">
                       <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                         <Zap className="text-primary" /> Engine Performance
                       </h2>
                       <div className="space-y-2">
                         <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                           <div>
                             <h3 className="font-bold text-white mb-1">Neural Autoplay</h3>
                             <p className="text-sm text-white/40">Intelligently sequence the next experience</p>
                           </div>
                           <Toggle value={settings.autoplay} onChange={(v) => saveSettings({ autoplay: v })} />
                         </div>
                         <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                           <div>
                             <h3 className="font-bold text-white mb-1">Buffer Optimization</h3>
                             <p className="text-sm text-white/40">Pre-load content based on predictive patterns</p>
                           </div>
                           <Toggle value={true} onChange={() => {}} disabled />
                         </div>
                       </div>
                     </div>
                   )}

                   {activeSection === 'notifications' && (
                     <div className="space-y-8">
                       <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                         <Bell className="text-primary" /> Signal Processing
                       </h2>
                       <div className="space-y-2">
                          <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div>
                              <h3 className="font-bold text-white mb-1">Subscription Updates</h3>
                              <p className="text-sm text-white/40">Instant alerts when following entities publish</p>
                            </div>
                            <Toggle value={settings.notifications_subscriptions} onChange={(v) => saveSettings({ notifications_subscriptions: v })} />
                          </div>
                          <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div>
                              <h3 className="font-bold text-white mb-1">Neural Recommendations</h3>
                              <p className="text-sm text-white/40">Notify when high-relevance content is detected</p>
                            </div>
                            <Toggle value={settings.notifications_recommendations} onChange={(v) => saveSettings({ notifications_recommendations: v })} />
                          </div>
                       </div>
                     </div>
                   )}

                   <div className="mt-20 pt-10 border-t border-white/5">
                     <button className="flex items-center gap-3 text-rose-500 font-bold hover:text-rose-400 transition-colors">
                       <LogOut size={20} />
                       Terminate Session
                     </button>
                   </div>
                 </motion.div>
               )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
