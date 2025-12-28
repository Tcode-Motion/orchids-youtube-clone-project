import React from 'react';
import { Home, PlaySquare, Library, UserCircle2 } from 'lucide-react';

/**
 * SidebarGuide Component
 * 
 * Clones the VidStream left-side navigation drawer (guide) with primary links.
 * Based on the design system:
 * - Width: 240px (full)
 * - Item Height: 40px
 * - Background: #FFFFFF
 * - Active State: #F2F2F2 background, 500 font-weight
 * - Typography: Roboto, 14px
 */

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive = false, href = "#" }) => {
  return (
    <a
      href={href}
      className={`
        flex items-center h-10 px-3 mx-3 rounded-lg transition-colors duration-200
        ${isActive 
          ? 'bg-[#f2f2f2] hover:bg-[#e5e5e5]' 
          : 'bg-transparent hover:bg-[#f2f2f2]'
        }
      `}
    >
      <div className={`mr-6 flex items-center justify-center ${isActive ? 'text-[#0f0f0f]' : 'text-[#0f0f0f]'}`}>
        {icon}
      </div>
      <span className={`
        text-[14px] leading-5 whitespace-nowrap overflow-hidden text-ellipsis
        ${isActive ? 'font-medium text-[#0f0f0f]' : 'font-normal text-[#0f0f0f]'}
      `}>
        {label}
      </span>
    </a>
  );
};

const SidebarGuide: React.FC = () => {
  return (
    <aside 
      className="fixed left-0 top-14 bottom-0 w-60 bg-white z-40 overflow-y-auto hidden lg:block"
      style={{ 
        fontFamily: 'Roboto, Arial, sans-serif'
      }}
    >
      <div className="pt-3 pb-3">
        {/* Primary Navigation Section */}
        <div className="flex flex-col gap-y-1">
          <SidebarItem 
            icon={<Home size={24} strokeWidth={isActiveIcon('Home') ? 2.5 : 2} fill={isActiveIcon('Home') ? "currentColor" : "none"} />} 
            label="Home" 
            isActive={true} 
            href="/"
          />
          <SidebarItem 
            icon={
              <svg 
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                fill="currentColor" 
                className="style-scope yt-icon"
              >
                <path d="M10 14.65v-5.3L15 12l-5 2.65ZM17.77 10.32c-.77-.32-1.2-.5-1.21-.5l1.14-.63c1.27-.7 1.7-2.32 1-3.6s-2.32-1.7-3.6-1l-6.19 3.42c-1.02.57-1.7 1.66-1.7 2.84s.68 2.27 1.7 2.84l1.2.66-.47.26a3.601 3.601 0 0 0-1 5c.44.8 1.15 1.38 2 1.63 1.27.38 2.6-.03 3.6-1l6.19-3.42c1.02-.57 1.7-1.66 1.7-2.84s-.68-2.27-1.7-2.84ZM17.3 12.56l-6.19 3.42c-.51.28-1.14.09-1.42-.42a1.002 1.002 0 0 1 .42-1.42l1.58-.88.66-.37-1.12-.62-2.12-1.17a1.005 1.005 0 0 1-.41-1.42c.28-.51.92-.7 1.42-.42l6.19 3.42c.51.28.7 1.14.42 1.42a1.002 1.002 0 0 1-1.42.42Z"></path>
              </svg>
            } 
            label="Shorts" 
            href="/shorts"
          />
          <SidebarItem 
            icon={<PlaySquare size={24} strokeWidth={2} />} 
            label="Subscriptions" 
            href="/feed/subscriptions"
          />
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#e5e5e5] my-3 mx-0"></div>

        {/* "You" Section */}
        <div className="flex flex-col gap-y-1">
          <a 
            href="/feed/you" 
            className="flex items-center h-10 px-3 mx-3 mb-1 rounded-lg hover:bg-[#f2f2f2] group"
          >
            <span className="text-[16px] font-medium text-[#0f0f0f] mr-2">You</span>
            <svg 
              viewBox="0 0 24 24" 
              width="16" 
              height="16" 
              fill="currentColor"
              className="mt-[2px]"
            >
              <path d="M9.4 18.4l-.7-.7 5.6-5.6-5.6-5.6.7-.7 6.4 6.3z"></path>
            </svg>
          </a>
          <SidebarItem 
            icon={<UserCircle2 size={24} strokeWidth={2} />} 
            label="History" 
            href="/feed/history"
          />
          <SidebarItem 
            icon={<Library size={24} strokeWidth={2} />} 
            label="Playlists" 
            href="/feed/playlists"
          />
        </div>
      </div>
    </aside>
  );
};

// Helper to determine if an icon should be filled (active) or outlined
function isActiveIcon(label: string): boolean {
  return label === 'Home';
}

export default SidebarGuide;