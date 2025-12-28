"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Video as PlaySquare, 
  Library, 
  History, 
  Clock, 
  ThumbsUp, 
  Flame, 
  Music2, 
  Gamepad2, 
  Trophy,
  Newspaper,
  Lightbulb,
  Settings, 
  Flag, 
  HelpCircle, 
  MessageSquarePlus,
  ChevronRight,
  ChevronDown,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

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

interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar_url: string;
}

const SidebarItem = ({ icon, label, href, active, onClick, mini }: SidebarItemProps) => {
  if (mini) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center py-4 px-1 cursor-pointer rounded-lg transition-colors duration-200 hover:bg-[#f2f2f2]",
          active && "bg-[#f2f2f2]"
        )}
      >
        <div className="flex items-center justify-center w-6 h-6 mb-1.5">
          {icon}
        </div>
        <span className="text-[10px] leading-3 text-center overflow-hidden whitespace-nowrap text-ellipsis max-w-[64px]">
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
        "flex items-center h-10 px-3 mx-3 cursor-pointer rounded-lg transition-colors duration-200",
        active 
          ? "bg-[#f2f2f2] font-medium" 
          : "hover:bg-[#f2f2f2]"
      )}
    >
      <div className="flex items-center justify-center w-6 h-6 mr-6">
        {icon}
      </div>
      <span className="text-[14px] leading-5 tracking-[0.1px] overflow-hidden whitespace-nowrap text-ellipsis">
        {label}
      </span>
    </Link>
  );
};

const SectionDivider = () => (
  <div className="my-3 border-t border-[#e5e5e5]" />
);

const SidebarHeader = ({ title }: { title: string }) => (
  <div className="px-6 py-2">
    <h3 className="text-[16px] font-medium text-[#0f0f0f]">
      {title}
    </h3>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [subscriptions, setSubscriptions] = useState<Channel[]>([]);
  const [showAllSubs, setShowAllSubs] = useState(false);
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
      .limit(10);
    
    if (data) {
      setSubscriptions(data.map((s: any) => s.channel).filter(Boolean));
    }
  };

  const displayedSubs = showAllSubs ? subscriptions : subscriptions.slice(0, 7);

  const renderFullSidebar = () => (
    <div className="pt-3 pb-4 h-full bg-white overflow-y-auto scrollbar-thin hover:scrollbar-thumb-gray-300">
      <div className="flex flex-col">
        <SidebarItem 
          icon={<Home size={24} strokeWidth={pathname === '/' ? 2.5 : 2} />} 
          label="Home"
          href="/"
          active={pathname === '/'}
          onClick={onClose}
        />
        <SidebarItem 
          icon={<PlaySquare size={24} strokeWidth={2} />} 
          label="Shorts"
          href="/shorts"
          active={pathname === '/shorts'}
          onClick={onClose}
        />
        <SidebarItem 
          icon={<Library size={24} strokeWidth={2} />} 
          label="Subscriptions"
          href="/subscriptions"
          active={pathname === '/subscriptions'}
          onClick={onClose}
        />
      </div>

      <SectionDivider />

      <div className="flex flex-col">
        <Link
          href="/feed/you"
          onClick={onClose}
          className="flex items-center h-10 px-6 cursor-pointer rounded-lg hover:bg-[#f2f2f2] mx-3"
        >
          <span className="text-[16px] font-medium mr-1">You</span>
          <ChevronRight size={16} />
        </Link>
        <SidebarItem 
          icon={<History size={24} strokeWidth={2} />} 
          label="History"
          href="/history"
          active={pathname === '/history'}
          onClick={onClose}
        />
        <SidebarItem 
          icon={<Clock size={24} strokeWidth={2} />} 
          label="Watch later"
          href="/playlist?list=WL"
          active={pathname === '/playlist' && typeof window !== 'undefined' && window.location.search.includes('WL')}
          onClick={onClose}
        />
        <SidebarItem 
          icon={<ThumbsUp size={24} strokeWidth={2} />} 
          label="Liked videos"
          href="/playlist?list=LL"
          active={pathname === '/playlist' && typeof window !== 'undefined' && window.location.search.includes('LL')}
          onClick={onClose}
        />
      </div>

      {user && subscriptions.length > 0 && (
        <>
          <SectionDivider />
          <SidebarHeader title="Subscriptions" />
          <div className="flex flex-col">
            {displayedSubs.map((channel) => (
              <Link
                key={channel.id}
                href={`/channel/${channel.handle}`}
                onClick={onClose}
                className="flex items-center h-10 px-3 mx-3 cursor-pointer rounded-lg hover:bg-[#f2f2f2]"
              >
                <img 
                  src={channel.avatar_url || `https://picsum.photos/seed/${channel.id}/24/24`}
                  alt={channel.name}
                  className="w-6 h-6 rounded-full mr-6 object-cover"
                />
                <span className="text-[14px] leading-5 overflow-hidden whitespace-nowrap text-ellipsis">
                  {channel.name}
                </span>
              </Link>
            ))}
            {subscriptions.length > 7 && (
              <button
                onClick={() => setShowAllSubs(!showAllSubs)}
                className="flex items-center h-10 px-3 mx-3 cursor-pointer rounded-lg hover:bg-[#f2f2f2]"
              >
                <div className="w-6 h-6 mr-6 flex items-center justify-center">
                  <ChevronDown size={20} className={cn("transition-transform", showAllSubs && "rotate-180")} />
                </div>
                <span className="text-[14px] leading-5">
                  {showAllSubs ? 'Show less' : `Show ${subscriptions.length - 7} more`}
                </span>
              </button>
            )}
          </div>
        </>
      )}

      {!user && (
        <>
          <SectionDivider />
          <div className="px-6 py-4">
            <p className="text-sm text-[#0f0f0f] mb-3">Sign in to like videos, comment, and subscribe.</p>
            <Link 
              href="/auth"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#cce3fc] rounded-full text-[#065fd4] font-medium text-sm hover:bg-[#def1ff] transition-colors"
            >
              <User size={18} />
              Sign in
            </Link>
          </div>
        </>
      )}

      <SectionDivider />

      <SidebarHeader title="Explore" />
      <div className="flex flex-col">
        <SidebarItem icon={<Flame size={24} />} label="Trending" href="/trending" active={pathname === '/trending'} onClick={onClose} />
        <SidebarItem icon={<Music2 size={24} />} label="Music" href="/channel/music" onClick={onClose} />
        <SidebarItem icon={<Gamepad2 size={24} />} label="Gaming" href="/gaming" active={pathname === '/gaming'} onClick={onClose} />
        <SidebarItem icon={<Newspaper size={24} />} label="News" href="/channel/news" onClick={onClose} />
        <SidebarItem icon={<Trophy size={24} />} label="Sports" href="/channel/sports" onClick={onClose} />
        <SidebarItem icon={<Lightbulb size={24} />} label="Learning" href="/channel/learning" onClick={onClose} />
      </div>

      <SectionDivider />

      <div className="flex flex-col">
        <SidebarItem icon={<Settings size={24} />} label="Settings" href="/settings" active={pathname === '/settings'} onClick={onClose} />
        <SidebarItem icon={<Flag size={24} />} label="Report history" href="/reporthistory" onClick={onClose} />
        <SidebarItem icon={<HelpCircle size={24} />} label="Help" href="/help" onClick={onClose} />
        <SidebarItem icon={<MessageSquarePlus size={24} />} label="Send feedback" href="/feedback" onClick={onClose} />
      </div>

      <SectionDivider />

      <div className="px-6 py-4 flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-medium text-[#606060]">
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Press</a>
        <a href="#" className="hover:underline">Copyright</a>
        <a href="#" className="hover:underline">Contact us</a>
        <a href="#" className="hover:underline">Creators</a>
        <a href="#" className="hover:underline">Advertise</a>
        <a href="#" className="hover:underline">Developers</a>
      </div>
      
      <div className="px-6 pb-4 flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-medium text-[#606060]">
        <a href="#" className="hover:underline">Terms</a>
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Policy & Safety</a>
        <a href="#" className="hover:underline">How VidStream works</a>
        <a href="#" className="hover:underline">Test new features</a>
      </div>

      <div className="px-6 pb-4 text-[12px] text-[#909090]">
        © 2024 Google LLC
      </div>
    </div>
  );

  const renderMiniSidebar = () => (
    <div className="flex flex-col items-center py-1 bg-white h-full">
      <SidebarItem 
        icon={<Home size={24} strokeWidth={pathname === '/' ? 2.5 : 2} />} 
        label="Home"
        href="/"
        active={pathname === '/'}
        mini
      />
      <SidebarItem 
        icon={<PlaySquare size={24} strokeWidth={2} />} 
        label="Shorts"
        href="/shorts"
        active={pathname === '/shorts'}
        mini
      />
      <SidebarItem 
        icon={<Library size={24} strokeWidth={2} />} 
        label="Subscriptions"
        href="/subscriptions"
        active={pathname === '/subscriptions'}
        mini
      />
      <SidebarItem 
        icon={<User size={24} strokeWidth={2} />} 
        label="You"
        href="/feed/you"
        mini
      />
      <SidebarItem 
        icon={<History size={24} strokeWidth={2} />} 
        label="History"
        href="/history"
        active={pathname === '/history'}
        mini
      />
    </div>
  );

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-[950] transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside 
        className={cn(
          "fixed top-[56px] left-0 h-[calc(100vh-56px)] bg-white z-[960] transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0 w-[240px]" : "-translate-x-full w-[240px] lg:translate-x-0 lg:w-[72px]",
          "hidden md:block" 
        )}
      >
        {isOpen ? renderFullSidebar() : renderMiniSidebar()}
      </aside>

      <aside 
        className={cn(
          "md:hidden fixed top-[56px] left-0 h-[calc(100vh-56px)] bg-white z-[960] transition-transform duration-300 w-[240px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderFullSidebar()}
      </aside>
    </>
  );
};

export default Sidebar;
