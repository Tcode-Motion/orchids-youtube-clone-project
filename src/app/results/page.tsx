'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { search } from '@/app/actions/youtube';
import type { VideoWithChannel } from '@/lib/supabase/types';
import VideoCard from '@/components/ui/video-card';
import EmptyState from '@/components/ui/empty-state';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('search_query');
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setVideos([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await search(query);
      setVideos(res);
      setLoading(false);
    }
    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="pt-24 px-8 md:pl-72 max-w-[1400px] w-full min-h-screen">
        <h2 className="text-xl font-bold mb-6 text-white/50">Searching for &quot;{query}&quot;...</h2>
        <div className="flex flex-col gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
               <div className="w-[246px] h-[138px] bg-white/5 rounded-2xl shrink-0" />
               <div className="flex-1 space-y-3 py-2">
                 <div className="h-4 bg-white/5 rounded-md w-3/4" />
                 <div className="h-3 bg-white/5 rounded-md w-1/4" />
                 <div className="h-8 bg-white/5 rounded-md w-1/2 mt-4" />
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="pt-24 px-8 md:pl-72 max-w-[1400px] w-full min-h-screen">
        <EmptyState 
          icon={<SearchIcon size={40} />}
          title="No results found"
          description={`We couldn't find any videos matching "${query}". Try different keywords.`}
        />
      </div>
    );
  }

  return (
    <div className="pt-24 px-8 md:pl-72 max-w-[1400px] w-full min-h-screen pb-12">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <h2 className="text-xl font-bold text-white">Results for &quot;{query}&quot;</h2>
        <span className="text-white/40 text-sm font-medium">{videos.length} videos found</span>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-4xl">
        {videos.map((video, index) => (
          <VideoCard 
            key={video.id + index} 
            video={video} 
            index={index} 
            layout="list"
          />
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
       <div className="pt-24 px-8 md:pl-72 w-full min-h-screen flex items-center justify-center">
         <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
       </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
