import React from 'react';
import Image from 'next/image';
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
    thumbnail: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    channelName: "Tech Masterclass",
    channelAvatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    views: "1.2M views",
    timestamp: "2 days ago",
    duration: "15:24"
  },
  {
    id: 2,
    title: "The Future of Web Development in 2025",
    thumbnail: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    channelName: "Dev Insights",
    channelAvatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    views: "450K views",
    timestamp: "1 week ago",
    duration: "10:05"
  },
  {
    id: 3,
    title: "10 Tips for Mastering Tailwind CSS Fast",
    thumbnail: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    channelName: "Styling Pro",
    channelAvatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    views: "89K views",
    timestamp: "3 hours ago",
    duration: "08:42"
  },
  {
    id: 4,
    title: "Live: Coding Session - React Server Components",
    thumbnail: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    channelName: "Code Live",
    channelAvatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    views: "2.5K watching",
    timestamp: "LIVE",
    duration: "LIVE"
  },
  {
    id: 5,
    title: "How to Optimize Your Next.js Application",
    thumbnail: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    channelName: "Performance Guru",
    channelAvatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    views: "125K views",
    timestamp: "5 days ago",
    duration: "12:18"
  },
  {
    id: 6,
    title: "Top 5 VS Code Extensions for Web Devs",
    thumbnail: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    channelName: "Developer Tools",
    channelAvatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    views: "300K views",
    timestamp: "4 months ago",
    duration: "06:30"
  },
  {
    id: 7,
    title: "TypeScript Deep Dive: Advanced Types",
    thumbnail: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    channelName: "TS Expert",
    channelAvatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    views: "56K views",
    timestamp: "1 day ago",
    duration: "22:15"
  },
  {
    id: 8,
    title: "Creating Pixel Perfect Designs with CSS",
    thumbnail: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    channelName: "UI/UX Mastery",
    channelAvatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/5bf2a976-9a8b-4285-99e3-d8c2d732fe3c-youtube-com/assets/images/images_1.png",
    views: "1.2M views",
    timestamp: "6 months ago",
    duration: "18:40"
  }
];

export default function VideoFeed() {
  return (
    <main className="flex-1 overflow-y-auto bg-white pt-[56px] ml-0 sm:ml-[72px] lg:ml-[240px] transition-all duration-300">
      {/* Horizontal Chip Bar */}
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

      {/* Video Grid */}
      <div className="p-4 md:p-6 lg:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-4">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col cursor-pointer group">
            {/* Thumbnail Container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover transition-opacity group-hover:opacity-90"
              />
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[12px] font-medium px-1.5 py-0.5 rounded-sm">
                {video.duration}
              </div>
            </div>

            {/* Video Info */}
            <div className="mt-3 flex gap-3">
              <div className="flex-shrink-0">
                <div className="relative h-9 w-9 overflow-hidden rounded-full">
                  <Image
                    src={video.channelAvatar}
                    alt={video.channelName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col pr-6 relative">
                <h3 className="text-title text-[#0f0f0f] line-clamp-2 leading-[22px] mb-1">
                  {video.title}
                </h3>
                <div className="flex flex-col">
                  <span className="text-metadata hover:text-[#0f0f0f] transition-colors">
                    {video.channelName}
                  </span>
                  <div className="text-metadata flex items-center">
                    <span>{video.views}</span>
                    <span className="mx-1">•</span>
                    <span>{video.timestamp}</span>
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

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}