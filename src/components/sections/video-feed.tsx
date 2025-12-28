"use client";

import React from 'react';
import { MoreVertical } from 'lucide-react';

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
    channelInitial: "T",
    channelColor: "#ff0000",
    views: "1.2M views",
    timestamp: "2 days ago",
    duration: "15:24",
    isLive: false
  },
  {
    id: 2,
    title: "The Future of Web Development in 2025",
    thumbnail: "https://picsum.photos/seed/vid2/320/180",
    channelName: "Dev Insights",
    channelInitial: "D",
    channelColor: "#065fd4",
    views: "450K views",
    timestamp: "1 week ago",
    duration: "10:05",
    isLive: false
  },
  {
    id: 3,
    title: "10 Tips for Mastering Tailwind CSS Fast",
    thumbnail: "https://picsum.photos/seed/vid3/320/180",
    channelName: "Styling Pro",
    channelInitial: "S",
    channelColor: "#ff6600",
    views: "89K views",
    timestamp: "3 hours ago",
    duration: "08:42",
    isLive: false
  },
  {
    id: 4,
    title: "Live: Coding Session - React Server Components Deep Dive",
    thumbnail: "https://picsum.photos/seed/vid4/320/180",
    channelName: "Code Live",
    channelInitial: "C",
    channelColor: "#ff0000",
    views: "2.5K watching",
    timestamp: "LIVE",
    duration: "LIVE",
    isLive: true
  },
  {
    id: 5,
    title: "How to Optimize Your Next.js Application for Performance",
    thumbnail: "https://picsum.photos/seed/vid5/320/180",
    channelName: "Performance Guru",
    channelInitial: "P",
    channelColor: "#9147ff",
    views: "125K views",
    timestamp: "5 days ago",
    duration: "12:18",
    isLive: false
  },
  {
    id: 6,
    title: "Top 5 VS Code Extensions for Web Devs in 2024",
    thumbnail: "https://picsum.photos/seed/vid6/320/180",
    channelName: "Developer Tools",
    channelInitial: "D",
    channelColor: "#00aa00",
    views: "300K views",
    timestamp: "4 months ago",
    duration: "06:30",
    isLive: false
  },
  {
    id: 7,
    title: "TypeScript Deep Dive: Advanced Types Explained",
    thumbnail: "https://picsum.photos/seed/vid7/320/180",
    channelName: "TS Expert",
    channelInitial: "T",
    channelColor: "#3178c6",
    views: "56K views",
    timestamp: "1 day ago",
    duration: "22:15",
    isLive: false
  },
  {
    id: 8,
    title: "Creating Pixel Perfect Designs with CSS Grid and Flexbox",
    thumbnail: "https://picsum.photos/seed/vid8/320/180",
    channelName: "UI/UX Mastery",
    channelInitial: "U",
    channelColor: "#e91e63",
    views: "1.2M views",
    timestamp: "6 months ago",
    duration: "18:40",
    isLive: false
  },
  {
    id: 9,
    title: "Live: Q&A Session - Ask Me Anything About Programming",
    thumbnail: "https://picsum.photos/seed/vid9/320/180",
    channelName: "Code Academy",
    channelInitial: "C",
    channelColor: "#ff0000",
    views: "1.8K watching",
    timestamp: "LIVE",
    duration: "LIVE",
    isLive: true
  },
  {
    id: 10,
    title: "Node.js Complete Course - From Beginner to Advanced",
    thumbnail: "https://picsum.photos/seed/vid10/320/180",
    channelName: "Backend Masters",
    channelInitial: "B",
    channelColor: "#339933",
    views: "890K views",
    timestamp: "2 weeks ago",
    duration: "3:45:22",
    isLive: false
  },
  {
    id: 11,
    title: "React 19 New Features You Need to Know",
    thumbnail: "https://picsum.photos/seed/vid11/320/180",
    channelName: "React Daily",
    channelInitial: "R",
    channelColor: "#61dafb",
    views: "234K views",
    timestamp: "3 days ago",
    duration: "14:55",
    isLive: false
  },
  {
    id: 12,
    title: "Building Real-time Apps with WebSockets Tutorial",
    thumbnail: "https://picsum.photos/seed/vid12/320/180",
    channelName: "Full Stack Dev",
    channelInitial: "F",
    channelColor: "#ff9900",
    views: "178K views",
    timestamp: "1 month ago",
    duration: "28:12",
    isLive: false
  }
];

export default function VideoFeed() {
  return (
    <main className="flex-1 overflow-y-auto bg-white pt-[56px] ml-0 sm:ml-[72px] lg:ml-[240px] transition-all duration-300">
      <div className="sticky top-[56px] z-40 bg-white py-3 px-4 flex items-center gap-3 overflow-x-hidden border-b border-transparent">
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((category, idx) => (
            <button
              key={idx}
              className={`chip ${idx === 0 ? 'chip-active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-4">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col cursor-pointer group">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
              />
              {video.isLive ? (
                <div className="absolute bottom-2 right-2 bg-[#cc0000] text-white text-[12px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                  LIVE
                </div>
              ) : (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[12px] font-medium px-1.5 py-0.5 rounded-sm">
                  {video.duration}
                </div>
              )}
              {video.isLive && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-3">
              <div className="flex-shrink-0">
                <div 
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: video.channelColor }}
                >
                  {video.channelInitial}
                </div>
              </div>
              <div className="flex flex-col pr-6 relative flex-1 min-w-0">
                <h3 className="text-[14px] font-medium text-[#0f0f0f] line-clamp-2 leading-[20px] mb-1">
                  {video.title}
                </h3>
                <div className="flex flex-col">
                  <span className="text-[12px] text-[#606060] hover:text-[#0f0f0f] transition-colors">
                    {video.channelName}
                  </span>
                  <div className="text-[12px] text-[#606060] flex items-center">
                    <span>{video.views}</span>
                    {!video.isLive && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{video.timestamp}</span>
                      </>
                    )}
                  </div>
                </div>
                <button className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#f2f2f2] rounded-full transition-all">
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
