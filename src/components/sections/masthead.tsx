"use client";

import React from 'react';
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
            <svg viewBox="0 0 90 20" preserveAspectRatio="xMidYMid meet" focusable="false" className="w-[90px] h-5">
              <g viewBox="0 0 90 20" preserveAspectRatio="xMidYMid meet">
                <g>
                  <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"></path>
                  <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"></path>
                </g>
                <g>
                  <path d="M34.6024 19.4328C33.6192 18.9272 32.8304 18.1888 32.2416 17.2272C31.6536 16.2632 31.3576 15.1352 31.3576 13.8416V6.15681C31.3576 4.86321 31.6536 3.73521 32.2416 2.77281C32.8304 1.80881 33.6192 1.07121 34.6024 0.565609C35.5864 0.0576094 36.7 -0.195991 37.9416 -0.195991C39.1832 -0.195991 40.2976 0.0576094 41.2816 0.565609C42.2656 1.07121 43.0552 1.80881 43.6424 2.77281C44.2304 3.73521 44.5264 4.86321 44.5264 6.15681V13.8416C44.5264 15.1352 44.2304 16.2632 43.6424 17.2272C43.0552 18.1888 42.2656 18.9272 41.2816 19.4328C40.2976 19.9408 39.1832 20.1944 37.9416 20.1944C36.7 20.1944 35.5864 19.9408 34.6024 19.4328ZM39.2176 17.0016C39.6384 16.6896 39.9728 16.2624 40.22 15.7176C40.4664 15.1728 40.5896 14.5408 40.5896 13.8216V6.17601C40.5896 5.45681 40.4664 4.82481 40.22 4.27921C39.9728 3.73441 39.6384 3.30721 39.2176 2.99521C38.7968 2.68321 38.3064 2.52721 37.7416 2.52721C37.1768 2.52721 36.6864 2.68321 36.2656 2.99521C35.8456 3.30721 35.512 3.73441 35.264 4.27921C35.0176 4.82481 34.8944 5.45681 34.8944 6.17601V13.8216C34.8944 14.5408 35.0176 15.1728 35.264 15.7176C35.512 16.2624 35.8456 16.6896 36.2656 17.0016C36.6864 17.3136 37.1768 17.4696 37.7416 17.4696C38.3064 17.4696 38.7968 17.3136 39.2176 17.0016Z" fill="#282828"></path>
                  <path d="M56.1696 20L52.5296 10.568V20H48.7928V0.0959952H52.5296V9.5064L56.1696 0.0959952H60.0544L55.8384 10.032L60.1544 20H56.1696Z" fill="#282828"></path>
                  <path d="M64.8608 19.4328C63.8768 18.9272 63.088 18.1888 62.5 17.2272C61.912 16.2632 61.616 15.1352 61.616 13.8416V6.15681C61.616 4.86321 61.912 3.73521 62.5 2.77281C63.088 1.80881 63.8768 1.07121 64.8608 0.565609C65.8448 0.0576094 66.9592 -0.195991 68.2 -0.195991C69.4416 -0.195991 70.556 0.0576094 71.54 0.565609C72.524 1.07121 73.3136 1.80881 73.9016 2.77281C74.4888 3.73521 74.7848 4.86321 74.7848 6.15681V13.8416C74.7848 15.1352 74.4888 16.2632 73.9016 17.2272C73.3136 18.1888 72.524 18.9272 71.54 19.4328C70.556 19.9408 69.4416 20.1944 68.2 20.1944C66.9592 20.1944 65.8448 19.9408 64.8608 19.4328ZM69.476 17.0016C69.8968 16.6896 70.2312 16.2624 70.4784 15.7176C70.7256 15.1728 70.8488 14.5408 70.8488 13.8216V6.17601C70.8488 5.45681 70.7256 4.82481 70.4784 4.27921C70.2312 3.73441 69.8968 3.30721 69.476 2.99521C69.056 2.68321 68.5656 2.52721 68.0008 2.52721C67.436 2.52721 66.9448 2.68321 66.524 2.99521C66.104 3.30721 65.7704 3.73441 65.5224 4.27921C65.276 4.82481 65.1528 5.45681 65.1528 6.17601V13.8216C65.1528 14.5408 65.276 15.1728 65.5224 15.7176C65.7704 16.2624 66.104 16.6896 66.524 17.0016C66.9448 17.3136 67.436 17.4696 68.0008 17.4696C68.5656 17.4696 69.056 17.3136 69.476 17.0016Z" fill="#282828"></path>
                  <path d="M84.5248 0.0959952H88.4104V20H84.5248V0.0959952Z" fill="#282828"></path>
                  <path d="M80.8032 0.0959952V20H76.9176V0.0959952H80.8032Z" fill="#282828"></path>
                </g>
              </g>
            </svg>
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