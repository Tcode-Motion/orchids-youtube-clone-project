"use client";

import React from 'react';
import Image from 'next/image';
import { Menu, Search, Mic, MoreVertical, CircleUserRound } from 'lucide-react';

/**
 * YouTube Masthead Component
 * Replicates the top navigation bar with search, voice search, and global actions.
 */
const Masthead: React.FC = () => {
  return (
    <header className="masthead fixed top-0 left-0 right-0 h-[56px] bg-white flex items-center justify-between px-4 z-[1000]">
      {/* Start: Menu and Logo */}
      <div className="flex items-center">
        <button 
          className="p-2 mr-1 hover:bg-[#f2f2f2] rounded-full transition-colors flex items-center justify-center"
          aria-label="Guide"
        >
          <Menu className="w-6 h-6 text-[#0f0f0f]" />
        </button>
        
        <a href="/" className="flex items-center py-[18px] pr-[14px] pl-4 cursor-pointer">
          <div className="relative w-[90px] h-5">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png"
              alt="YouTube Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </a>
      </div>

      {/* Center: Search Bar */}
      <div className="flex items-center flex-1 max-w-[720px] ml-10">
        <div className="flex flex-1 items-center">
          <div className="flex flex-1 items-center h-10 px-4 ml-8 bg-white border border-[#ccc] rounded-l-[40px] shadow-inner focus-within:border-[#065fd4] focus-within:ml-0 group transition-all">
            <div className="hidden group-focus-within:flex mr-4">
              <Search className="w-5 h-5 text-[#606060]" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent outline-none text-[16px] font-normal leading-6 text-[#0f0f0f] placeholder:text-[#888]"
            />
          </div>
          <button 
            className="search-btn h-10 w-16 flex items-center justify-center bg-[#f8f8f8] border border-[#ccc] border-l-0 rounded-r-[40px] hover:bg-[#f0f0f0] hover:shadow-sm"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[#0f0f0f]" />
          </button>
        </div>
        
        <button 
          className="voice-search-btn h-10 w-10 ml-2 flex items-center justify-center bg-[#f2f2f2] rounded-full hover:bg-[#e5e5e5] transition-colors"
          aria-label="Search with your voice"
        >
          <Mic className="w-6 h-6 text-[#0f0f0f]" />
        </button>
      </div>

      {/* End: Settings and Sign In */}
      <div className="flex items-center gap-2">
        <button 
          className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors flex items-center justify-center"
          aria-label="Settings"
        >
          <MoreVertical className="w-6 h-6 text-[#0f0f0f]" />
        </button>
        
        <a 
          href="https://accounts.google.com/ServiceLogin?service=youtube"
          className="signin-btn flex items-center gap-2 px-[15px] h-9 border border-[#e5e5e5] rounded-[18px] text-[#065fd4] font-medium text-sm hover:bg-[#def1ff] hover:border-transparent transition-colors"
        >
          <CircleUserRound className="w-6 h-6" />
          <span>Sign in</span>
        </a>
      </div>
    </header>
  );
};

export default Masthead;