import React from 'react';
import { Menu, Search, Mic, MoreVertical, UserCircle } from 'lucide-react';

const Masthead = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-4 z-50">
      {/* Start: Logo and Sidebar Toggle */}
      <div className="flex items-center">
        <button 
          className="p-2 mr-2 hover:bg-[#f2f2f2] rounded-full transition-colors duration-200 focus:outline-none"
          aria-label="Guide"
        >
          <Menu className="w-6 h-6 text-[#0f0f0f]" strokeWidth={1.5} />
        </button>
        
        <a href="/" className="flex items-center py-4 pr-1 relative" aria-label="YouTube Home">
          <div className="flex items-center">
            {/* YouTube Logo Construction */}
            <div className="relative flex items-center">
              <div className="bg-[#FF0000] w-[28px] h-[20px] rounded-[4px] flex items-center justify-center mr-1">
                <div 
                  className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-[1px]"
                />
              </div>
              <span className="font-display font-bold text-[18px] tracking-tight text-[#0F0F0F] flex items-center">
                YouTube<span className="text-[10px] font-normal text-[#606060] absolute -top-1 -right-4">US</span>
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Center: Search Bar */}
      <div className="flex flex-1 items-center justify-center max-w-[720px] ml-10">
        <div className="flex flex-1 items-center">
          <div className="flex flex-1 items-center bg-white border border-[#e5e5e5] rounded-l-full px-4 py-1 h-10 shadow-inner focus-within:border-[#065fd4] focus-within:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ml-8">
            <div className="hidden items-center pr-3 group-focus-within:flex">
              <Search className="w-4 h-4 text-[#0f0f0f]" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent border-none outline-none text-[16px] font-normal placeholder:text-[#606060]"
            />
          </div>
          <button 
            className="bg-[#f8f8f8] border border-[#e5e5e5] border-l-0 rounded-r-full px-5 py-2 h-10 flex items-center justify-center hover:bg-[#f0f0f0] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[#0f0f0f]" strokeWidth={1.5} />
          </button>
        </div>
        <button 
          className="ml-4 p-2 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-full transition-colors duration-200"
          aria-label="Search with your voice"
        >
          <Mic className="w-6 h-6 text-[#0f0f0f]" />
        </button>
      </div>

      {/* End: Action Buttons and Settings */}
      <div className="flex items-center justify-end min-w-[225px]">
        <button 
          className="p-2 mr-2 hover:bg-[#f2f2f2] rounded-full transition-colors duration-200 focus:outline-none"
          aria-label="Settings"
        >
          <MoreVertical className="w-6 h-6 text-[#0f0f0f]" />
        </button>
        
        <a 
          href="https://accounts.google.com/ServiceLogin"
          className="flex items-center px-3 py-1.5 border border-[#e5e5e5] rounded-full text-[#065fd4] font-medium text-[14px] hover:bg-[#def1ff] hover:border-transparent transition-all duration-200"
        >
          <UserCircle className="w-6 h-6 mr-2" strokeWidth={1.5} />
          <span>Sign in</span>
        </a>
      </div>
    </header>
  );
};

export default Masthead;