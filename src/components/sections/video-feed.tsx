"use client";

import React, { useState } from 'react';
import { MoreVertical, CheckCircle2 } from 'lucide-react';

const categories = [
  "All", "Music", "Gaming", "Live", "Synthesizers", "Computers", 
  "Podcasts", "Mixes", "News", "JavaScript", "Visual Arts", 
  "Recently uploaded", "Watched", "New to you"
];

const videos = [
  {
    id: 1,
    title: "Building a YouTube Clone with Next.js 15 and Tailwind CSS",
    thumbnail: "https://picsum.photos/seed/vid1/320/180",
    channelName: "Tech Masterclass",
    channelAvatar: "https://picsum.photos/seed/ch1/36/36",
    views: "1.2M views",
    timestamp: "2 days ago",
    duration: "15:24",
    isLive: false,
    verified: true
  },
  {
    id: 2,
    title: "The Future of Web Development in 2025",
    thumbnail: "https://picsum.photos/seed/vid2/320/180",
    channelName: "Dev Insights",
    channelAvatar: "https://picsum.photos/seed/ch2/36/36",
    views: "450K views",
    timestamp: "1 week ago",
    duration: "10:05",
    isLive: false,
    verified: true
  },
  {
    id: 3,
    title: "10 Tips for Mastering Tailwind CSS Fast",
    thumbnail: "https://picsum.photos/seed/vid3/320/180",
    channelName: "Styling Pro",
    channelAvatar: "https://picsum.photos/seed/ch3/36/36",
    views: "89K views",
    timestamp: "3 hours ago",
    duration: "08:42",
    isLive: false,
    verified: false
  },
  {
    id: 4,
    title: "Live: Coding Session - React Server Components Deep Dive",
    thumbnail: "https://picsum.photos/seed/vid4/320/180",
    channelName: "Code Live",
    channelAvatar: "https://picsum.photos/seed/ch4/36/36",
    views: "2.5K watching",
    timestamp: "LIVE",
    duration: "LIVE",
    isLive: true,
    verified: true
  },
  {
    id: 5,
    title: "How to Optimize Your Next.js Application for Performance",
    thumbnail: "https://picsum.photos/seed/vid5/320/180",
    channelName: "Performance Guru",
    channelAvatar: "https://picsum.photos/seed/ch5/36/36",
    views: "125K views",
    timestamp: "5 days ago",
    duration: "12:18",
    isLive: false,
    verified: true
  },
  {
    id: 6,
    title: "Top 5 VS Code Extensions for Web Devs in 2024",
    thumbnail: "https://picsum.photos/seed/vid6/320/180",
    channelName: "Developer Tools",
    channelAvatar: "https://picsum.photos/seed/ch6/36/36",
    views: "300K views",
    timestamp: "4 months ago",
    duration: "06:30",
    isLive: false,
    verified: false
  },
  {
    id: 7,
    title: "TypeScript Deep Dive: Advanced Types Explained",
    thumbnail: "https://picsum.photos/seed/vid7/320/180",
    channelName: "TS Expert",
    channelAvatar: "https://picsum.photos/seed/ch7/36/36",
    views: "56K views",
    timestamp: "1 day ago",
    duration: "22:15",
    isLive: false,
    verified: true
  },
  {
    id: 8,
    title: "Creating Pixel Perfect Designs with CSS Grid and Flexbox",
    thumbnail: "https://picsum.photos/seed/vid8/320/180",
    channelName: "UI/UX Mastery",
    channelAvatar: "https://picsum.photos/seed/ch8/36/36",
    views: "1.2M views",
    timestamp: "6 months ago",
    duration: "18:40",
    isLive: false,
    verified: true
  },
  {
    id: 9,
    title: "Live: Q&A Session - Ask Me Anything About Programming",
    thumbnail: "https://picsum.photos/seed/vid9/320/180",
    channelName: "Code Academy",
    channelAvatar: "https://picsum.photos/seed/ch9/36/36",
    views: "1.8K watching",
    timestamp: "LIVE",
    duration: "LIVE",
    isLive: true,
    verified: true
  },
  {
    id: 10,
    title: "Node.js Complete Course - From Beginner to Advanced",
    thumbnail: "https://picsum.photos/seed/vid10/320/180",
    channelName: "Backend Masters",
    channelAvatar: "https://picsum.photos/seed/ch10/36/36",
    views: "890K views",
    timestamp: "2 weeks ago",
    duration: "3:45:22",
    isLive: false,
    verified: true
  },
  {
    id: 11,
    title: "React 19 New Features You Need to Know",
    thumbnail: "https://picsum.photos/seed/vid11/320/180",
    channelName: "React Daily",
    channelAvatar: "https://picsum.photos/seed/ch11/36/36",
    views: "234K views",
    timestamp: "3 days ago",
    duration: "14:55",
    isLive: false,
    verified: true
  },
  {
    id: 12,
    title: "Building Real-time Apps with WebSockets Tutorial",
    thumbnail: "https://picsum.photos/seed/vid12/320/180",
    channelName: "Full Stack Dev",
    channelAvatar: "https://picsum.photos/seed/ch12/36/36",
    views: "178K views",
    timestamp: "1 month ago",
    duration: "28:12",
    isLive: false,
    verified: false
  }
];

export default function VideoFeed() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <main className="flex-1 overflow-y-auto bg-[#f9f9f9] ml-0 lg:ml-[240px] transition-all duration-300">
      <div className="sticky top-[56px] z-40 bg-white py-3 px-6 flex items-center gap-3 border-b border-[#e5e5e5]">
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((category, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className={`h-8 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                idx === activeCategory 
                  ? 'bg-[#0f0f0f] text-white' 
                  : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col cursor-pointer group">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-200">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {video.isLive ? (
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="bg-[#cc0000] text-white text-xs font-medium px-1 py-0.5 rounded-sm uppercase">
                    Live
                  </span>
                  <span className="bg-black/70 text-white text-xs px-1 py-0.5 rounded-sm">
                    {video.views.replace(' watching', '')}
                  </span>
                </div>
              ) : (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1 py-0.5 rounded">
                  {video.duration}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            <div className="mt-3 flex gap-3">
              <div className="flex-shrink-0">
                <img 
                  src={video.channelAvatar}
                  alt={video.channelName}
                  className="h-9 w-9 rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col flex-1 min-w-0 pr-6 relative">
                <h3 className="text-sm font-medium text-[#0f0f0f] line-clamp-2 leading-5 mb-1">
                  {video.title}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#606060] hover:text-[#0f0f0f] transition-colors">
                    {video.channelName}
                  </span>
                  {video.verified && (
                    <CheckCircle2 size={12} className="text-[#606060]" />
                  )}
                </div>
                <div className="text-xs text-[#606060] flex items-center">
                  <span>{video.views}</span>
                  {!video.isLive && (
                    <>
                      <span className="mx-1">&middot;</span>
                      <span>{video.timestamp}</span>
                    </>
                  )}
                </div>
                <button className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#e5e5e5] rounded-full transition-all">
                  <MoreVertical size={20} className="text-[#0f0f0f]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
