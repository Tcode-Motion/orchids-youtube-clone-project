"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Masthead from "@/components/sections/masthead";
import Sidebar from "@/components/sections/sidebar";
import MobileNav from "@/components/sections/mobile-nav";
import { cn } from '@/lib/utils';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Close sidebar on navigation on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Determine if we should show the sidebar/masthead (e.g., hide on auth pages or watch page might have different layout)
  const isAuthPage = pathname?.startsWith('/auth');
  const isShortsPage = pathname?.startsWith('/shorts');
  const isWatchPage = pathname?.startsWith('/watch');

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!isShortsPage && (
        <Masthead onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      )}
      
      <div className={cn(
        "flex flex-1",
        !isShortsPage && "pt-[56px]"
      )}>
        {!isShortsPage && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className={cn(
          "flex-1 w-full",
          !isShortsPage && "lg:pl-[240px]", // Default desktop sidebar width
          !isShortsPage && !sidebarOpen && "lg:pl-[72px]" // Mini sidebar width
        )}>
          {children}
        </main>
      </div>
      
      {!isShortsPage && !isWatchPage && <MobileNav />}
    </div>
  );
}
