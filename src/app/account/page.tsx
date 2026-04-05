'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Channel, UserSettings } from '@/lib/supabase/types';
import { motion } from 'framer-motion';
import { Camera, Edit2, Save, X, LogOut, Shield, Trash2, Bell, Moon, Sun, Globe, Zap } from 'lucide-react';
import { formatSubscribers } from '@/lib/utils/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [channelRes, profileRes, settingsRes] = await Promise.all([
      supabase.from('channels').select('*').eq('user_id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
    ]);

    if (channelRes.data) setChannel(channelRes.data);
    if (settingsRes.data) setSettings(settingsRes.data as UserSettings);

    const name = profileRes.data?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || '';
    const bio = profileRes.data?.bio || '';
    const website = profileRes.data?.website || '';
    const avatar = channelRes.data?.avatar_url || profileRes.data?.avatar_url || '';

    setDisplayName(name);
    setBio(bio);
    setWebsite(website);
    setAvatarUrl(avatar);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: displayName,
      bio,
      website,
      updated_at: new Date().toISOString(),
    });

    if (channel) {
      await supabase.from('channels').update({
        name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }).eq('id', channel.id);
    }

    setEditing(false);
    setSaving(false);
    fetchData();
  };

  const toggleSetting = async (key: keyof UserSettings, value: boolean) => {
    if (!user || !settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated as UserSettings);
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      [key]: value,
      updated_at: new Date().toISOString(),
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your account</h2>
          <Link href="/auth?next=/account" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold text-sm transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const SettingToggle = ({ label, description, icon: Icon, value, onChange }: {
    label: string; description: string; icon: any; value: boolean; onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={16} className="text-white/50" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">{label}</p>
          <p className="text-xs text-white/40 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-all ${value ? 'bg-indigo-600' : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-[860px] mx-auto">
      <h1 className="text-3xl font-black text-white mb-8">Account</h1>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Profile</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              <Edit2 size={14} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white font-medium transition-colors">
                <X size={14} />Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white">{displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            {editing && (
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Camera size={14} className="text-white" />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="text-xs font-bold text-white/30 uppercase tracking-widest block mb-1.5">Display Name</label>
              {editing ? (
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-indigo-500/60 transition-all"
                />
              ) : (
                <p className="text-white font-semibold">{displayName || 'Set display name'}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-white/30 uppercase tracking-widest block mb-1.5">Email</label>
              <p className="text-white/60 text-sm">{user.email}</p>
            </div>

            {editing && (
              <>
                <div>
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest block mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-indigo-500/60 transition-all resize-none"
                    placeholder="Tell the world about yourself..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest block mb-1.5">Website</label>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-indigo-500/60 transition-all"
                    placeholder="https://yoursite.com"
                  />
                </div>
              </>
            )}

            {channel && (
              <div className="flex items-center gap-4 pt-2">
                <div className="text-center">
                  <p className="text-lg font-black text-white">{formatSubscribers(channel.subscriber_count)}</p>
                  <p className="text-xs text-white/40">Subscribers</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-lg font-black text-white">{channel.video_count}</p>
                  <p className="text-xs text-white/40">Videos</p>
                </div>
                <Link href={`/channel/${channel.handle?.replace('@', '')}`} className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  View Channel →
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      {settings && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Notifications</h2>
          <SettingToggle
            label="Subscriptions"
            description="Get notified when channels you follow upload new videos"
            icon={Bell}
            value={settings.notifications_subscriptions}
            onChange={(v) => toggleSetting('notifications_subscriptions', v)}
          />
          <SettingToggle
            label="Recommendations"
            description="Receive personalized video recommendations"
            icon={Zap}
            value={settings.notifications_recommendations}
            onChange={(v) => toggleSetting('notifications_recommendations', v)}
          />
          <SettingToggle
            label="Account Activity"
            description="Security alerts and account updates"
            icon={Shield}
            value={settings.notifications_activity}
            onChange={(v) => toggleSetting('notifications_activity', v)}
          />
        </motion.div>
      )}

      {/* Preferences */}
      {settings && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Preferences</h2>
          <SettingToggle
            label="Autoplay"
            description="Automatically play the next video"
            icon={Zap}
            value={settings.autoplay}
            onChange={(v) => toggleSetting('autoplay', v)}
          />
          <SettingToggle
            label="Restricted Mode"
            description="Filter out potentially mature content"
            icon={Shield}
            value={settings.restricted_mode}
            onChange={(v) => toggleSetting('restricted_mode', v)}
          />
        </motion.div>
      )}

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.02] border border-red-500/10 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Account Actions</h2>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-2xl transition-all group text-left"
        >
          <div className="w-9 h-9 bg-rose-500/10 rounded-xl flex items-center justify-center">
            <LogOut size={16} className="text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-400 group-hover:text-rose-300">Sign Out</p>
            <p className="text-xs text-white/30">Sign out of your account on this device</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
