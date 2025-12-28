"use client";

import React from 'react';

const VideoGrid = () => {
  const videos = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: "Video Title " + (i + 1),
    channel: "Channel Name",
    views: "1.2M views",
    timestamp: "2 hours ago",
    duration: "10:00"
  }));

  return (
    <main
      id="content"
      className="flex-1 overflow-y-auto bg-background pt-[56px] min-h-screen"
      style={{
        marginLeft: 'var(--sidebar-width, 72px)',
        transition: 'margin-left 0.2s cubic-bezier(0.05, 0, 0, 1)'
      }}
    >
      <div className="relative w-full">
        {/* Dark Placeholder Banner / Chip bar container Area */}
        {/* Reference screenshot shows a large dark horizontal area at the top of content */}
        <div 
          className="w-full bg-[#0f0f0f] mb-6"
          style={{ height: '180px' }}
        >
          {/* Typically category chips would overlay or be below this in the modern UI, 
              but based on specific screenshot, it's a prominent dark placeholder banner area. */}
        </div>

        {/* Video Grid Container */}
        <div className="px-4 pb-8 max-w-[2256px] mx-auto">
          <div 
            className="grid gap-x-4 gap-y-10"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
            }}
          >
            {/* If the app was fully rendered, we would map over videos here. 
                However, to match the "pixel perfect placeholder" state in the screenshot 
                which shows a mostly empty but structured grid layout: */}
            {videos.map((video) => (
              <div key={video.id} className="cursor-pointer group">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary mb-3">
                  <div className="w-full h-full bg-[#e5e5e5] animate-pulse"></div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[12px] font-medium px-1 rounded-sm">
                    {video.duration}
                  </div>
                </div>

                {/* Details */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary overflow-hidden">
                    <div className="w-full h-full bg-[#e5e5e5]"></div>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="text-video-title line-clamp-2 leading-[22px] mb-1">
                      {/* Using whitespace to preserve layout structure from skeleton if needed */}
                      <span className="bg-[#f2f2f2] text-transparent rounded h-4 block w-[90%] mb-2">.</span>
                      <span className="bg-[#f2f2f2] text-transparent rounded h-4 block w-[60%]">.</span>
                    </h3>
                    <div className="text-metadata text-[#606060]">
                      <div className="hover:text-[#0f0f0f]">Channel Name</div>
                      <div>1.2M views • 2 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VideoGrid;