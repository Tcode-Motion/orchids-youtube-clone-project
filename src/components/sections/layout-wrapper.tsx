"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Masthead from "@/components/sections/masthead";
import Sidebar from "@/components/sections/sidebar";
import MobileNav from "@/components/sections/mobile-nav";
import { cn } from '@/lib/utils';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  // Default to open on desktop (lg), closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  // Detect screen size for initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

    const isAuthPage = pathname?.startsWith('/auth');
    const isShortsPage = pathname?.startsWith('/shorts');
    const isWatchPage = pathname?.startsWith('/watch');
    const isStudioPage = pathname?.startsWith('/studio');

    if (isAuthPage) return <>{children}</>;

    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* Masthead is always visible except on auth and studio pages (studio has its own) */}
        {!isStudioPage && <Masthead onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
        
        <div className={cn(
          "flex flex-1 pt-18",
          isStudioPage && "pt-0" // Studio handles its own padding/header
        )}>
          {/* Sidebar is hidden on shorts, watch, and studio page */}
          {!isShortsPage && !isStudioPage && !isWatchPage && (
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          )}
          
          <main className={cn(
            "flex-1 w-full transition-all duration-300",
            !isShortsPage && !isStudioPage && !isWatchPage && (sidebarOpen ? "lg:pl-[240px]" : "lg:pl-[72px]"),
            (isShortsPage || isStudioPage || isWatchPage) && "lg:pl-0" 
          )}>
            {children}
          </main>
        </div>
      
      {!isShortsPage && !isWatchPage && <MobileNav />}
    </div>
  );
}
