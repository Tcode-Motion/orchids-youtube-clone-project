'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, MoreVertical, Play, Eye, Clock } from 'lucide-react';
import type { VideoWithChannel } from '@/lib/supabase/types';
import { formatViews, formatDuration, timeAgo } from '@/lib/utils/format';
import { buildYouTubeEmbedUrl } from '@/lib/utils/youtube';

interface VideoCardProps {
  video: VideoWithChannel;
  index?: number;
  layout?: 'grid' | 'list';
  showChannel?: boolean;
}

export default function VideoCard({ video, index = 0, layout = 'grid', showChannel = true }: VideoCardProps) {
  const router = useRouter();

  const [imgSrc, setImgSrc] = React.useState(video.thumbnail_url ||
    (video.youtube_id ? `https://i.ytimg.com/vi/${video.youtube_id}/maxresdefault.jpg` : 'https://picsum.photos/seed/default/640/360'));

  const handleImageError = () => {
    if (imgSrc.includes('maxresdefault.jpg')) {
      setImgSrc(`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`);
    } else if (imgSrc.includes('hqdefault.jpg')) {
      setImgSrc(`https://i.ytimg.com/vi/${video.youtube_id}/mqdefault.jpg`);
    } else if (imgSrc.includes('mqdefault.jpg')) {
      setImgSrc(`https://i.ytimg.com/vi/${video.youtube_id}/default.jpg`);
    }
  };

  const thumbnailUrl = imgSrc;

  if (layout === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex gap-4 group"
      >
        <Link href={`/watch?v=${video.id}`} className="relative w-[246px] shrink-0 aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-indigo-500/40 transition-all">
          <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={handleImageError} />
          {video.is_live ? (
            <span className="absolute bottom-2 left-2 bg-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-ping" />Live
            </span>
          ) : (
            <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-lg">
              {formatDuration(video.duration)}
            </span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/watch?v=${video.id}`}>
            <h3 className="text-sm font-bold text-white/90 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors mb-1">
              {video.title}
            </h3>
          </Link>
          {showChannel && video.channel && (
            <Link href={`/channel/${video.channel.handle?.replace('@', '')}`} className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1 mb-1">
              {video.channel.name}
              {video.channel.is_verified && <CheckCircle2 size={10} className="text-indigo-400" />}
            </Link>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <Eye size={11} /> <span>{formatViews(video.view_count)} views</span>
            <span>•</span>
            <span>{timeAgo(video.published_at)}</span>
          </div>
          {video.description && (
            <p className="text-xs text-white/30 line-clamp-2 mt-2 leading-relaxed">{video.description}</p>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid layout (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col relative"
    >
      <Link
        href={`/watch?v=${video.id}`}
        className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-white/5 border border-white/5 group-hover:border-indigo-500/40 transition-all duration-500 shadow-xl group-hover:shadow-indigo-500/10"
      >
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={18} className="text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Watch later button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white/80 hover:bg-indigo-600 hover:text-white transition-colors"
            title="Watch later"
          >
            <Clock size={14} />
          </button>
        </div>

        {/* Duration / Live badge */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between pointer-events-none">
          {video.is_live ? (
            <div className="bg-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase flex items-center gap-1 shadow-lg">
              <span className="w-1 h-1 bg-white rounded-full animate-ping" />
              Live
            </div>
          ) : (
            <div />
          )}
          {!video.is_live && (
            <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        {showChannel && video.channel && (
          <Link href={`/channel/${video.channel.handle?.replace('@', '')}`} className="flex-shrink-0 relative group/avatar">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity blur-sm" />
            <img
              src={video.channel.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${video.channel.id}`}
              alt=""
              className="h-9 w-9 rounded-full object-cover border-2 border-background relative z-10"
            />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <Link href={`/watch?v=${video.id}`}>
            <h3 className="text-[14px] font-bold text-white/90 leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors mb-1">
              {video.title}
            </h3>
          </Link>
          {showChannel && video.channel && (
            <Link href={`/channel/${video.channel.handle?.replace('@', '')}`} className="text-[12px] text-white/40 hover:text-white transition-colors flex items-center gap-1 font-medium">
              {video.channel.name}
              {video.channel.is_verified && <CheckCircle2 size={11} className="text-indigo-400" />}
            </Link>
          )}
          <div className="text-[11px] text-white/30 flex items-center gap-1.5 mt-0.5">
            <span>{formatViews(video.view_count)} views</span>
            <span>•</span>
            <span>{timeAgo(video.published_at)}</span>
          </div>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded-lg transition-all h-fit text-white/40 hover:text-white">
          <MoreVertical size={16} />
        </button>
      </div>
    </motion.div>
  );
}
