"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  TrendingUp, 
  Radio, 
  History, 
  Settings, 
  HelpCircle,
  Gem,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    { icon: <Home size={22} />, label: "Discover", href: "/" },
    { icon: <TrendingUp size={22} />, label: "Trending", href: "/trending" },
    { icon: <Smartphone size={22} />, label: "Shorts", href: "/shorts" },
    { icon: <Radio size={22} />, label: "Live", href: "/live" },
    { icon: <History size={22} />, label: "History", href: "/history" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-[950] transition-opacity duration-500 xl:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "h-screen w-64 fixed left-0 top-0 border-r border-white/5 bg-[#0f0f11] z-[960] flex flex-col py-6 px-4 transition-transform duration-300 xl:translate-x-0 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="mb-8 px-4 flex flex-col pt-2">
            <Link href="/" className="flex items-center gap-2" onClick={onClose}>
              <img src="/logo.png" alt="VidStrim Logo" className="h-10 w-auto object-contain" />
            </Link>
        </div>

        <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                    isActive 
                      ? "text-white font-bold bg-indigo-600 shadow-lg shadow-indigo-600/20" 
                      : "text-white/40 font-semibold hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.icon}
                  <span className="text-[13px] tracking-wide">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-4 pb-2">
              <div className="h-px w-full bg-white/5" />
            </div>

            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 font-semibold hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <Settings size={22} />
              <span className="text-[13px] tracking-wide">Settings</span>
            </Link>
            
            <button
              onClick={onClose}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 font-semibold hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <HelpCircle size={22} />
              <span className="text-[13px] tracking-wide">Help & Feedback</span>
            </button>
        </nav>


      </aside>
    </>
  );
};

export default Sidebar;
