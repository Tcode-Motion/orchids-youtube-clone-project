"use client";

import React, { useState, useEffect } from 'react';
import Masthead from '@/components/sections/masthead';
import Sidebar from '@/components/sections/sidebar';
import { supabase } from '@/lib/supabase/client';
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
  Monitor
} from 'lucide-react';

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
  { id: 'appearance', title: 'Appearance', icon: <Palette size={20} /> },
  { id: 'language', title: 'Language and location', icon: <Globe size={20} /> },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const [theme, setTheme] = useState('light');
  const [autoplay, setAutoplay] = useState(true);
  const [restrictedMode, setRestrictedMode] = useState(false);
  const [notifications, setNotifications] = useState({
    subscriptions: true,
    recommendations: true,
    activity: true
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Masthead />
      <div className="flex flex-1 pt-[56px]">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-[240px] bg-[#f9f9f9]">
          <div className="max-w-[1200px] mx-auto p-6">
            <h1 className="text-2xl font-semibold text-[#0f0f0f] mb-6">Settings</h1>
            
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
                    <div className="space-y-4">
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
                          onClick={() => setNotifications(prev => ({ ...prev, subscriptions: !prev.subscriptions }))}
                          className={`w-12 h-6 rounded-full transition-colors ${notifications.subscriptions ? 'bg-[#065fd4]' : 'bg-[#ccc]'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications.subscriptions ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                        <div>
                          <h3 className="font-medium">Recommended videos</h3>
                          <p className="text-sm text-[#606060]">Notify me of recommended videos</p>
                        </div>
                        <button
                          onClick={() => setNotifications(prev => ({ ...prev, recommendations: !prev.recommendations }))}
                          className={`w-12 h-6 rounded-full transition-colors ${notifications.recommendations ? 'bg-[#065fd4]' : 'bg-[#ccc]'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications.recommendations ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-[#e5e5e5]">
                        <div>
                          <h3 className="font-medium">Activity on my channel</h3>
                          <p className="text-sm text-[#606060]">Notify me about comments and other activity</p>
                        </div>
                        <button
                          onClick={() => setNotifications(prev => ({ ...prev, activity: !prev.activity }))}
                          className={`w-12 h-6 rounded-full transition-colors ${notifications.activity ? 'bg-[#065fd4]' : 'bg-[#ccc]'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications.activity ? 'translate-x-6' : 'translate-x-0.5'}`} />
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
                          onClick={() => setAutoplay(!autoplay)}
                          className={`w-12 h-6 rounded-full transition-colors ${autoplay ? 'bg-[#065fd4]' : 'bg-[#ccc]'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${autoplay ? 'translate-x-6' : 'translate-x-0.5'}`} />
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
                          onClick={() => setRestrictedMode(!restrictedMode)}
                          className={`w-12 h-6 rounded-full transition-colors ${restrictedMode ? 'bg-[#065fd4]' : 'bg-[#ccc]'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${restrictedMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
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
                    <p className="text-sm text-[#606060]">Adjust the appearance of YouTube across this browser</p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border-2 transition-colors ${theme === 'light' ? 'border-[#065fd4] bg-[#e8f0fe]' : 'border-[#e5e5e5] hover:bg-[#f2f2f2]'}`}
                      >
                        <Sun size={24} className="mx-auto mb-2" />
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border-2 transition-colors ${theme === 'dark' ? 'border-[#065fd4] bg-[#e8f0fe]' : 'border-[#e5e5e5] hover:bg-[#f2f2f2]'}`}
                      >
                        <Moon size={24} className="mx-auto mb-2" />
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`p-4 rounded-xl border-2 transition-colors ${theme === 'system' ? 'border-[#065fd4] bg-[#e8f0fe]' : 'border-[#e5e5e5] hover:bg-[#f2f2f2]'}`}
                      >
                        <Monitor size={24} className="mx-auto mb-2" />
                        <span className="text-sm font-medium">System</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'language' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Language and location</h2>
                    <div className="space-y-4">
                      <div className="py-4 border-b border-[#e5e5e5]">
                        <h3 className="font-medium mb-2">Language</h3>
                        <select className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg bg-white text-sm">
                          <option>English (US)</option>
                          <option>English (UK)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Japanese</option>
                          <option>Korean</option>
                          <option>Chinese (Simplified)</option>
                        </select>
                      </div>
                      <div className="py-4 border-b border-[#e5e5e5]">
                        <h3 className="font-medium mb-2">Location</h3>
                        <select className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg bg-white text-sm">
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>Canada</option>
                          <option>Australia</option>
                          <option>Germany</option>
                          <option>France</option>
                          <option>Japan</option>
                          <option>India</option>
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
        </main>
      </div>
    </div>
  );
}
