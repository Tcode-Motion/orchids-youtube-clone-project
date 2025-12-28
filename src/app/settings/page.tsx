"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import LayoutWrapper from '@/components/sections/layout-wrapper';
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
    LogOut
    } from 'lucide-react';
  import type { User as SupabaseUser } from '@supabase/supabase-js';
  
  interface SettingsSection {
    id: string;
    title: string;
    icon: React.ReactNode;
  }
  
  const sections: SettingsSection[] = [
    { id: 'account', title: 'Account', icon: <User size={20} /> },
    { id: 'notifications', title: 'Notifications', icon: <Bell size={20} /> },
    { id: 'playback', title: 'Playback and performance', icon: <Play size={20} /> },
    { id: 'downloads', title: 'Downloads', icon: <Download size={20} /> },
    { id: 'privacy', title: 'Privacy', icon: <Shield size={20} /> },
    { id: 'creator', title: 'Creator Studio', icon: <Video size={20} /> },
    { id: 'billing', title: 'Billing and payments', icon: <CreditCard size={20} /> },
    { id: 'appearance', title: 'Appearance', icon: <Palette size={20} /> },
    { id: 'language', title: 'Language and location', icon: <Globe size={20} /> },
    { id: 'advanced', title: 'Advanced settings', icon: <Settings size={20} /> },
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
    theme: 'light',
    autoplay: true,
    restricted_mode: false,
    language: 'en',
    country: 'US',
    notifications_subscriptions: true,
    notifications_recommendations: true,
    notifications_activity: true,
  });
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
            theme: data.theme || 'light',
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
  };

  return (
    <div className="bg-[#f9f9f9] min-h-screen">
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#0f0f0f]">Settings</h1>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check size={16} />
              Settings saved
            </div>
          )}
        </div>

        {!user && (
          <div className="bg-white rounded-xl p-8 text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Sign in to manage your settings</h2>
            <p className="text-[#606060] mb-4">Your settings will be saved to your account</p>
            <Link href="/auth" className="inline-block px-4 py-2 bg-[#065fd4] text-white rounded-full font-medium text-sm hover:bg-[#0556be]">
              Sign in
            </Link>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-64 shrink-0">
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#e5e5e5] text-[#0f0f0f]'
                        : 'text-[#606060] hover:bg-[#f2f2f2]'
                    }`}
                  >
                    {section.icon}
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
            {activeSection === 'account' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Account</h2>
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-[#f9f9f9] rounded-lg">
                      <div className="w-16 h-16 bg-[#ef4444] rounded-full flex items-center justify-center text-white text-2xl font-medium">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{user.user_metadata?.name || 'User'}</p>
                        <p className="text-sm text-[#606060]">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                      <div>
                        <h3 className="font-medium">Your channel</h3>
                        <p className="text-sm text-[#606060]">Manage your channel settings</p>
                      </div>
                      <ChevronRight size={20} className="text-[#606060]" />
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                      <div>
                        <h3 className="font-medium">Memberships</h3>
                        <p className="text-sm text-[#606060]">View your memberships and subscriptions</p>
                      </div>
                      <ChevronRight size={20} className="text-[#606060]" />
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                      <div>
                        <h3 className="font-medium">Privacy</h3>
                        <p className="text-sm text-[#606060]">Manage your privacy settings</p>
                      </div>
                      <ChevronRight size={20} className="text-[#606060]" />
                    </div>
                  </div>
                ) : (
                  <p className="text-[#606060]">Sign in to manage your account settings</p>
                )}
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                    <div>
                      <h3 className="font-medium">Subscriptions</h3>
                      <p className="text-sm text-[#606060]">Notify me about activity from channels I'm subscribed to</p>
                    </div>
                    <button
                      onClick={() => saveSettings({ notifications_subscriptions: !settings.notifications_subscriptions })}
                      disabled={!user}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.notifications_subscriptions ? 'bg-[#065fd4]' : 'bg-[#ccc]'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.notifications_subscriptions ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                    <div>
                      <h3 className="font-medium">Recommended videos</h3>
                      <p className="text-sm text-[#606060]">Notify me of recommended videos</p>
                    </div>
                    <button
                      onClick={() => saveSettings({ notifications_recommendations: !settings.notifications_recommendations })}
                      disabled={!user}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.notifications_recommendations ? 'bg-[#065fd4]' : 'bg-[#ccc]'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.notifications_recommendations ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                    <div>
                      <h3 className="font-medium">Activity on my channel</h3>
                      <p className="text-sm text-[#606060]">Notify me about comments and other activity</p>
                    </div>
                    <button
                      onClick={() => saveSettings({ notifications_activity: !settings.notifications_activity })}
                      disabled={!user}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.notifications_activity ? 'bg-[#065fd4]' : 'bg-[#ccc]'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.notifications_activity ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'playback' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Playback and performance</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                    <div>
                      <h3 className="font-medium">Autoplay</h3>
                      <p className="text-sm text-[#606060]">Autoplay next video</p>
                    </div>
                    <button
                      onClick={() => saveSettings({ autoplay: !settings.autoplay })}
                      disabled={!user}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.autoplay ? 'bg-[#065fd4]' : 'bg-[#ccc]'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.autoplay ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="py-4 border-b border-[#e5e5e5]">
                    <h3 className="font-medium mb-2">Video quality preferences</h3>
                    <p className="text-sm text-[#606060] mb-3">Choose your default video quality</p>
                    <select className="px-4 py-2 border border-[#e5e5e5] rounded-lg bg-white text-sm">
                      <option>Auto (recommended)</option>
                      <option>Higher picture quality</option>
                      <option>Data saver</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Privacy</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                    <div>
                      <h3 className="font-medium">Restricted Mode</h3>
                      <p className="text-sm text-[#606060]">Hide potentially mature videos</p>
                    </div>
                    <button
                      onClick={() => saveSettings({ restricted_mode: !settings.restricted_mode })}
                      disabled={!user}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.restricted_mode ? 'bg-[#065fd4]' : 'bg-[#ccc]'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.restricted_mode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                    <div>
                      <h3 className="font-medium">Manage your data and privacy</h3>
                      <p className="text-sm text-[#606060]">Control your search and watch history</p>
                    </div>
                    <ChevronRight size={20} className="text-[#606060]" />
                  </div>
                </div>
              </div>
            )}

              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Appearance</h2>
                  <p className="text-sm text-[#606060]">Adjust the appearance of VidStream across this browser</p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <button
                      onClick={() => saveSettings({ theme: 'light' })}
                      disabled={!user}
                      className={`p-4 rounded-xl border-2 transition-colors ${settings.theme === 'light' ? 'border-[#065fd4] bg-[#e8f0fe]' : 'border-[#e5e5e5] hover:bg-[#f2f2f2]'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Sun size={24} className="mx-auto mb-2" />
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => saveSettings({ theme: 'dark' })}
                      disabled={!user}
                      className={`p-4 rounded-xl border-2 transition-colors ${settings.theme === 'dark' ? 'border-[#065fd4] bg-[#e8f0fe]' : 'border-[#e5e5e5] hover:bg-[#f2f2f2]'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Moon size={24} className="mx-auto mb-2" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                    <button
                      onClick={() => saveSettings({ theme: 'system' })}
                      disabled={!user}
                      className={`p-4 rounded-xl border-2 transition-colors ${settings.theme === 'system' ? 'border-[#065fd4] bg-[#e8f0fe]' : 'border-[#e5e5e5] hover:bg-[#f2f2f2]'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Monitor size={24} className="mx-auto mb-2" />
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'creator' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Creator Studio</h2>
                  <div className="space-y-4">
                    <div className="p-6 bg-[#f9f9f9] rounded-xl border border-dashed border-[#ccc] text-center">
                      <Video size={48} className="mx-auto mb-4 text-[#606060]" />
                      <h3 className="text-lg font-medium mb-2">Ready to start creating?</h3>
                      <p className="text-sm text-[#606060] mb-6">Upload videos or go live to start building your audience on VidStream.</p>
                      <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-6 py-2 bg-[#065fd4] text-white rounded-full font-medium text-sm hover:bg-[#0556be]">
                          Go to Studio
                        </button>
                        <button className="px-6 py-2 border border-[#ccc] text-[#0f0f0f] rounded-full font-medium text-sm hover:bg-[#f2f2f2]">
                          View Analytics
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-[#e5e5e5] rounded-xl">
                        <h4 className="font-medium mb-1 text-sm">Latest Performance</h4>
                        <p className="text-2xl font-bold">124.5K</p>
                        <p className="text-xs text-green-600 font-medium">+12% from last month</p>
                      </div>
                      <div className="p-4 border border-[#e5e5e5] rounded-xl">
                        <h4 className="font-medium mb-1 text-sm">Total Subscribers</h4>
                        <p className="text-2xl font-bold">8,421</p>
                        <p className="text-xs text-green-600 font-medium">+243 this week</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'billing' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Billing and payments</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#f9f9f9] rounded-xl border border-[#e5e5e5]">
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard size={24} className="text-[#065fd4]" />
                        <h3 className="font-medium">Payment methods</h3>
                      </div>
                      <p className="text-sm text-[#606060] mb-4">Add a payment method to buy movies, premium subscriptions, and support creators.</p>
                      <button className="text-[#065fd4] text-sm font-medium hover:underline">Add payment method</button>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                      <div>
                        <h3 className="font-medium">Quick Purchase</h3>
                        <p className="text-sm text-[#606060]">Authorize purchases without entering your password</p>
                      </div>
                      <button className="w-12 h-6 rounded-full bg-[#ccc]">
                        <div className="w-5 h-5 bg-white rounded-full shadow translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'advanced' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Advanced settings</h2>
                  <div className="space-y-4">
                    <div className="py-4 border-b border-[#e5e5e5]">
                      <h3 className="font-medium">User ID</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={user?.id || 'Not signed in'} 
                          className="flex-1 px-4 py-2 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm font-mono"
                        />
                        <button className="px-4 py-2 text-[#065fd4] text-sm font-medium">Copy</button>
                      </div>
                    </div>
                    <div className="py-4 border-b border-[#e5e5e5]">
                      <h3 className="font-medium">Channel ID</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="text" 
                          readOnly 
                          value="UC-X0V6n6n6n6n6n6n6n6n6n" 
                          className="flex-1 px-4 py-2 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm font-mono"
                        />
                        <button className="px-4 py-2 text-[#065fd4] text-sm font-medium">Copy</button>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button className="text-[#cc0000] text-sm font-medium hover:underline">Delete channel</button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'language' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Language and location</h2>
                <div className="space-y-4">
                  <div className="py-4 border-b border-[#e5e5e5]">
                    <h3 className="font-medium mb-2">Language</h3>
                    <select 
                      value={settings.language}
                      onChange={(e) => saveSettings({ language: e.target.value })}
                      disabled={!user}
                      className={`w-full px-4 py-2 border border-[#e5e5e5] rounded-lg bg-white text-sm ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="en">English (US)</option>
                      <option value="en-gb">English (UK)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="zh">Chinese (Simplified)</option>
                    </select>
                  </div>
                  <div className="py-4 border-b border-[#e5e5e5]">
                    <h3 className="font-medium mb-2">Location</h3>
                    <select 
                      value={settings.country}
                      onChange={(e) => saveSettings({ country: e.target.value })}
                      disabled={!user}
                      className={`w-full px-4 py-2 border border-[#e5e5e5] rounded-lg bg-white text-sm ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                      <option value="IN">India</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'downloads' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Downloads</h2>
                <div className="space-y-4">
                  <div className="py-4 border-b border-[#e5e5e5]">
                    <h3 className="font-medium mb-2">Download quality</h3>
                    <p className="text-sm text-[#606060] mb-3">Choose your download quality for offline viewing</p>
                    <select className="px-4 py-2 border border-[#e5e5e5] rounded-lg bg-white text-sm">
                      <option>Full HD (1080p)</option>
                      <option>HD (720p)</option>
                      <option>Medium (480p)</option>
                      <option>Low (360p)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                    <div>
                      <h3 className="font-medium">Download over Wi-Fi only</h3>
                      <p className="text-sm text-[#606060]">Only download when connected to Wi-Fi</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-[#065fd4]">
                      <div className="w-5 h-5 bg-white rounded-full shadow translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
