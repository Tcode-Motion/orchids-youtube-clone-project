'use server';

import { 
  fetchTrendingVideos, 
  fetchSearchVideos, 
  fetchVideoDetails, 
  fetchRelatedVideos,
  fetchShortsVideos 
} from '@/lib/youtube/api';
import { VideoWithChannel } from '@/lib/supabase/types';

/**
 * Server action to fetch trending videos securely.
 */
export async function getTrending(categoryId = '', pageToken = ''): Promise<{videos: VideoWithChannel[], nextPageToken: string | null}> {
  return await fetchTrendingVideos(categoryId, pageToken);
}

/**
 * Server action to fetch search suggestions/results securely.
 */
export async function search(query: string): Promise<VideoWithChannel[]> {
  if (!query || query.trim() === '') return [];
  return await fetchSearchVideos(query);
}

/**
 * Server action to fetch individual video details securely.
 */
export async function getVideo(videoId: string): Promise<VideoWithChannel | null> {
  if (!videoId) return null;
  return await fetchVideoDetails(videoId);
}

/**
 * Server action to fetch related videos for the sidebar securely.
 */
export async function getRelated(videoId: string): Promise<VideoWithChannel[]> {
  if (!videoId) return [];
  return await fetchRelatedVideos(videoId);
}

/**
 * Server action to fetch vertical shorts securely.
 */
export async function getShorts(): Promise<VideoWithChannel[]> {
  return await fetchShortsVideos();
}
