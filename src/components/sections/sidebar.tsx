import React from 'react';
import { Home, PlaySquare, Library, UserCircle, History, Clock, ThumbsUp, Flame, Music2, Gamepad2, Trophy, Settings, Flag, HelpCircle, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, active }: SidebarItemProps) => {
  return (
    <div
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
    </div>
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
  return (
    <aside className="fixed top-[56px] left-0 w-[240px] h-[calc(100vh-56px)] bg-white overflow-y-auto z-[900] hidden lg:block scrollbar-thin hover:scrollbar-thumb-gray-300">
      <div className="pt-3">
        {/* Primary Navigation */}
        <div className="flex flex-col">
          <SidebarItem 
            icon={<Home size={24} strokeWidth={2.5} />} 
            label="Home" 
            active 
          />
          <SidebarItem 
            icon={<PlaySquare size={24} strokeWidth={2} />} 
            label="Shorts" 
          />
          <SidebarItem 
            icon={<Library size={24} strokeWidth={2} />} 
            label="Subscriptions" 
          />
        </div>

        <SectionDivider />

        {/* User Specific - "You" Section */}
        <div className="flex flex-col">
          <div className="flex items-center h-10 px-3 mx-3 cursor-pointer rounded-lg hover:bg-[#f2f2f2]">
            <span className="text-[16px] font-medium mr-2">You</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
          <SidebarItem 
            icon={<History size={24} strokeWidth={2} />} 
            label="History" 
          />
          <SidebarItem 
            icon={<Clock size={24} strokeWidth={2} />} 
            label="Watch later" 
          />
          <SidebarItem 
            icon={<ThumbsUp size={24} strokeWidth={2} />} 
            label="Liked videos" 
          />
        </div>

        <SectionDivider />

        {/* Explore Section */}
        <SidebarHeader title="Explore" />
        <div className="flex flex-col">
          <SidebarItem 
            icon={<Flame size={24} strokeWidth={2} />} 
            label="Trending" 
          />
          <SidebarItem 
            icon={<Music2 size={24} strokeWidth={2} />} 
            label="Music" 
          />
          <SidebarItem 
            icon={<Gamepad2 size={24} strokeWidth={2} />} 
            label="Gaming" 
          />
          <SidebarItem 
            icon={<Trophy size={24} strokeWidth={2} />} 
            label="Sports" 
          />
        </div>

        <SectionDivider />

        {/* More from YouTube */}
        <SidebarHeader title="More from YouTube" />
        <div className="flex flex-col">
          <SidebarItem 
            icon={<div className="w-6 h-6 bg-[#ff0000] rounded-sm" />} 
            label="YouTube Premium" 
          />
          <SidebarItem 
            icon={<div className="w-6 h-6 bg-[#ff0000] rounded-full" />} 
            label="YouTube Music" 
          />
          <SidebarItem 
            icon={<div className="w-6 h-6 bg-[#ff0000] flex items-center justify-center rounded-sm text-[8px] font-bold text-white">TV</div>} 
            label="YouTube TV" 
          />
        </div>

        <SectionDivider />

        {/* Global Action Links */}
        <div className="flex flex-col">
          <SidebarItem 
            icon={<Settings size={24} strokeWidth={2} />} 
            label="Settings" 
          />
          <SidebarItem 
            icon={<Flag size={24} strokeWidth={2} />} 
            label="Report history" 
          />
          <SidebarItem 
            icon={<HelpCircle size={24} strokeWidth={2} />} 
            label="Help" 
          />
          <SidebarItem 
            icon={<MessageSquarePlus size={24} strokeWidth={2} />} 
            label="Send feedback" 
          />
        </div>

        <SectionDivider />

        {/* Footer Info */}
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