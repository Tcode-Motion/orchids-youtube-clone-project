"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Play, 
  Layers, 
  History, 
  Clock, 
  Heart, 
  TrendingUp, 
  Music, 
  Gamepad, 
  Trophy,
  Globe,
  Zap,
  Settings, 
  ShieldAlert, 
  LifeBuoy, 
  MessageCirclePlus,
  ChevronRight,
  User,
  Radio,
  PlusCircle,
  LayoutDashboard,
  Sparkles,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  mini?: boolean;
}

const SidebarItem = ({ icon, label, href, active, onClick, mini }: SidebarItemProps) => {
  if (mini) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center py-5 px-1 cursor-pointer rounded-2xl transition-all duration-300 group",
          active ? "bg-primary/10 text-primary" : "text-white/40 hover:text-white hover:bg-white/5"
        )}
      >
        <div className={cn(
          "flex items-center justify-center w-6 h-6 mb-2 transition-transform duration-300",
          active ? "scale-110" : "group-hover:scale-110"
        )}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold tracking-wide uppercase opacity-70">
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center h-12 px-4 mx-3 cursor-pointer rounded-2xl transition-all duration-300 group relative overflow-hidden",
        active 
          ? "bg-gradient-to-r from-primary/20 to-indigo-500/10 text-white font-semibold border border-white/5" 
          : "text-white/50 hover:text-white hover:bg-white/5"
      )}
    >
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute left-0 w-1 h-6 bg-primary rounded-full"
        />
      )}
      <div className={cn(
        "flex items-center justify-center w-6 h-6 mr-4 transition-transform duration-300",
        active ? "text-primary" : "group-hover:scale-110 group-hover:text-white"
      )}>
        {icon}
      </div>
      <span className="text-sm tracking-tight truncate">
        {label}
      </span>
    </Link>
  );
};

const SectionDivider = () => (
  <div className="my-4 mx-6 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
);

const SidebarHeader = ({ title }: { title: string }) => (
  <div className="px-7 py-2 mb-1">
    <h3 className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">
      {title}
    </h3>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchSubscriptions(data.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSubscriptions(session.user.id);
      } else {
        setSubscriptions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSubscriptions = async (userId: string) => {
    const { data } = await supabase
      .from('subscriptions')
      .select('channel:channels(*)')
      .eq('user_id', userId)
      .limit(8);
    
    if (data) {
      setSubscriptions(data.map((s: any) => s.channel).filter(Boolean));
    }
  };

  const renderFullSidebar = () => (
    <div className="pt-6 pb-8 h-full bg-[#050505] overflow-y-auto no-scrollbar border-r border-white/5">
        <div className="space-y-1">
          <SidebarItem icon={<Home size={20} />} label="Discover" href="/" active={pathname === '/'} onClick={onClose} />
          <SidebarItem icon={<Zap size={20} />} label="Shorts" href="/shorts" active={pathname === '/shorts'} onClick={onClose} />
          <SidebarItem icon={<Radio size={20} />} label="Live" href="/live" active={pathname === '/live'} onClick={onClose} />
          <SidebarItem icon={<Sparkles size={20} />} label="Subscriptions" href="/subscriptions" active={pathname === '/subscriptions'} onClick={onClose} />
        </div>

      <SectionDivider />

      <SidebarHeader title="Library" />
      <div className="space-y-1">
        <SidebarItem icon={<History size={20} />} label="Recent" href="/history" active={pathname === '/history'} onClick={onClose} />
        <SidebarItem icon={<Clock size={20} />} label="Watch Later" href="/playlist?list=WL" active={pathname?.includes('WL')} onClick={onClose} />
        <SidebarItem icon={<Heart size={20} />} label="Favorites" href="/playlist?list=LL" active={pathname?.includes('LL')} onClick={onClose} />
      </div>

      {user && subscriptions.length > 0 && (
        <>
          <SectionDivider />
          <SidebarHeader title="Following" />
          <div className="space-y-1 px-3">
            {subscriptions.map((channel) => (
              <Link
                key={channel.id}
                href={`/channel/${channel.handle}`}
                onClick={onClose}
                className="flex items-center h-12 px-4 cursor-pointer rounded-2xl hover:bg-white/5 transition-all group"
              >
                <div className="relative mr-4">
                  <img 
                    src={channel.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.id}`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover:scale-110 transition-transform"
                  />
                  {Math.random() > 0.7 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#050505]" />}
                </div>
                <span className="text-sm font-medium text-white/50 group-hover:text-white truncate">
                  {channel.name}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      <SectionDivider />

      <SidebarHeader title="Explore" />
      <div className="space-y-1">
        <SidebarItem icon={<TrendingUp size={20} />} label="Trending" href="/trending" active={pathname === '/trending'} onClick={onClose} />
        <SidebarItem icon={<Music size={20} />} label="Music" href="/channel/music" onClick={onClose} />
        <SidebarItem icon={<Gamepad size={20} />} label="Gaming" href="/gaming" active={pathname === '/gaming'} onClick={onClose} />
        <SidebarItem icon={<Trophy size={20} />} label="Sports" href="/channel/sports" onClick={onClose} />
      </div>

      <SectionDivider />

      <SidebarHeader title="Workspace" />
      <div className="space-y-1">
        <SidebarItem icon={<PlusCircle size={20} />} label="Creator Lab" href="/upload" active={pathname === '/upload'} onClick={onClose} />
        <SidebarItem icon={<LayoutDashboard size={20} />} label="Studio" href="/studio" active={pathname === '/studio'} onClick={onClose} />
        <SidebarItem icon={<Settings size={20} />} label="Settings" href="/settings" active={pathname === '/settings'} onClick={onClose} />
      </div>

      <div className="mt-auto px-7 pt-8 opacity-20">
        <p className="text-[11px] font-bold tracking-[0.1em] uppercase">VidStream v1.0</p>
      </div>
    </div>
  );

  const renderMiniSidebar = () => (
    <div className="flex flex-col items-center py-6 bg-[#050505] h-full space-y-2 border-r border-white/5 no-scrollbar">
      <SidebarItem icon={<Home size={22} />} label="Home" href="/" active={pathname === '/'} mini />
      <SidebarItem icon={<Zap size={22} />} label="Shorts" href="/shorts" active={pathname === '/shorts'} mini />
      <SidebarItem icon={<Radio size={22} />} label="Live" href="/live" active={pathname === '/live'} mini />
      <SidebarItem icon={<Layers size={22} />} label="You" href="/history" active={pathname === '/history'} mini />
    </div>
  );

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[950] transition-opacity duration-500 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside 
        className={cn(
          "fixed top-18 left-0 h-[calc(100vh-72px)] bg-[#050505] z-[960] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          isOpen ? "translate-x-0 w-[260px] shadow-2xl shadow-black" : "-translate-x-full w-[260px] lg:translate-x-0 lg:w-20",
          "hidden md:block" 
        )}
      >
        {isOpen ? renderFullSidebar() : renderMiniSidebar()}
      </aside>

      <aside 
        className={cn(
          "md:hidden fixed top-18 left-0 h-[calc(100vh-72px)] bg-[#050505] z-[960] transition-transform duration-500 w-[260px] shadow-2xl shadow-black",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderFullSidebar()}
      </aside>
    </>
  );
};

export default Sidebar;
