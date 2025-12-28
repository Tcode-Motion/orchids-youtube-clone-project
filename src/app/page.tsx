"use client";

import { useState } from 'react';
import Masthead from "@/components/sections/masthead";
import Sidebar from "@/components/sections/sidebar";
import VideoFeed from "@/components/sections/video-feed";
import MobileNav from "@/components/sections/mobile-nav";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Masthead onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 pt-[56px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <VideoFeed />
      </div>
      <MobileNav />
    </div>
  );
}
