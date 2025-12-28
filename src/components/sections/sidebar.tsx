"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  PlaySquare, 
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link
      href={href}
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
  <div className="my-[12px] border-t border-[#e5e5e5]" />
);

const SidebarHeader = ({ title }: { title: string }) => (
  <h3 className="px-6 py-2 text-[16px] font-medium text-[#0f0f0f]">
    {title}
  </h3>
);

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed top-[56px] left-0 w-[240px] h-[calc(100vh-56px)] bg-white overflow-y-auto z-[900] hidden lg:block scrollbar-thin hover:scrollbar-thumb-gray-300">
      <div className="pt-3">
        <div className="flex flex-col">
          <SidebarItem 
            icon={<Home size={24} strokeWidth={pathname === '/' ? 2.5 : 2} />} 
            label="Home"
            href="/"
            active={pathname === '/'}
          />
          <SidebarItem 
            icon={<PlaySquare size={24} strokeWidth={2} />} 
            label="Shorts"
            href="/shorts"
          />
          <SidebarItem 
            icon={<Library size={24} strokeWidth={2} />} 
            label="Subscriptions"
            href="/subscriptions"
          />
        </div>

        <SectionDivider />

        <div className="flex flex-col">
          <div className="flex items-center h-10 px-3 mx-3 cursor-pointer rounded-lg hover:bg-[#f2f2f2]">
            <span className="text-[16px] font-medium mr-2">You</span>
            <ChevronRight size={16} />
          </div>
          <SidebarItem 
            icon={<History size={24} strokeWidth={2} />} 
            label="History"
            href="/history"
          />
          <SidebarItem 
            icon={<Clock size={24} strokeWidth={2} />} 
            label="Watch later"
            href="/playlist?list=WL"
          />
          <SidebarItem 
            icon={<ThumbsUp size={24} strokeWidth={2} />} 
            label="Liked videos"
            href="/playlist?list=LL"
          />
        </div>

        <SectionDivider />

        <SidebarHeader title="Explore" />
        <div className="flex flex-col">
          <SidebarItem 
            icon={<Flame size={24} strokeWidth={2} />} 
            label="Trending"
            href="/trending"
          />
          <SidebarItem 
            icon={<Music2 size={24} strokeWidth={2} />} 
            label="Music"
            href="/channel/music"
          />
          <SidebarItem 
            icon={<Gamepad2 size={24} strokeWidth={2} />} 
            label="Gaming"
            href="/gaming"
          />
          <SidebarItem 
            icon={<Newspaper size={24} strokeWidth={2} />} 
            label="News"
            href="/channel/news"
          />
          <SidebarItem 
            icon={<Trophy size={24} strokeWidth={2} />} 
            label="Sports"
            href="/channel/sports"
          />
          <SidebarItem 
            icon={<Lightbulb size={24} strokeWidth={2} />} 
            label="Learning"
            href="/channel/learning"
          />
        </div>

        <SectionDivider />

        <SidebarHeader title="More from YouTube" />
        <div className="flex flex-col">
          <SidebarItem 
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#FF0000" d="M21.78 8s-.2-1.4-.8-2c-.76-.8-1.6-.8-2-.85C16.22 5 12 5 12 5s-4.22 0-6.98.15c-.4.05-1.24.05-2 .85-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.22 3.2.22 3.2s.2 1.4.8 2c.76.8 1.74.77 2.18.85 1.58.15 6.8.2 6.8.2s4.22 0 6.98-.2c.4-.05 1.24-.05 2-.85.6-.6.8-2 .8-2s.22-1.6.22-3.2v-1.5c0-1.6-.22-3.2-.22-3.2zM9.75 15.02v-6.5l5.76 3.26-5.76 3.24z"/>
              </svg>
            } 
            label="YouTube Premium"
            href="/premium"
          />
          <SidebarItem 
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#FF0000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            } 
            label="YouTube Music"
            href="/music"
          />
          <SidebarItem 
            icon={
              <div className="w-6 h-6 bg-[#ff0000] flex items-center justify-center rounded text-[8px] font-bold text-white">TV</div>
            } 
            label="YouTube TV"
            href="/tv"
          />
        </div>

        <SectionDivider />

        <div className="flex flex-col">
          <SidebarItem 
            icon={<Settings size={24} strokeWidth={2} />} 
            label="Settings"
            href="/settings"
            active={pathname === '/settings'}
          />
          <SidebarItem 
            icon={<Flag size={24} strokeWidth={2} />} 
            label="Report history"
            href="/reporthistory"
          />
          <SidebarItem 
            icon={<HelpCircle size={24} strokeWidth={2} />} 
            label="Help"
            href="/help"
          />
          <SidebarItem 
            icon={<MessageSquarePlus size={24} strokeWidth={2} />} 
            label="Send feedback"
            href="/feedback"
          />
        </div>

        <SectionDivider />

        <div className="px-6 py-4 flex flex-wrap gap-x-2 text-[13px] font-medium text-[#606060]">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Press</a>
          <a href="#" className="hover:underline">Copyright</a>
          <a href="#" className="hover:underline">Contact us</a>
          <a href="#" className="hover:underline">Creators</a>
          <a href="#" className="hover:underline">Advertise</a>
          <a href="#" className="hover:underline">Developers</a>
        </div>
        
        <div className="px-6 pb-4 flex flex-wrap gap-x-2 text-[13px] font-medium text-[#606060]">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Policy & Safety</a>
          <a href="#" className="hover:underline">How YouTube works</a>
          <a href="#" className="hover:underline">Test new features</a>
        </div>

        <div className="px-6 pb-4 text-[12px] text-[#909090]">
          © 2024 Google LLC
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
