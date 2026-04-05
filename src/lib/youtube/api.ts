import { VideoWithChannel } from '../supabase/types';
import { parseYouTubeDuration } from '../utils/youtube';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://youtube.googleapis.com/youtube/v3';

// We map YouTube's dense API response to our custom VideoWithChannel schema
// so that our frontend components don't need to change.
function mapYouTubeVideoToOurSchema(item: any): VideoWithChannel {
  // If we fetch purely from 'search', snippet might not have contentDetails.
  // The youtube fetcher will try to do a subsequent 'videos' fetch to get duration/views
  // but if it's missing, we provide logical defaults.
  const snippet = item.snippet;
  const contentDetails = item.contentDetails || {};
  const statistics = item.statistics || {};
  
  const videoId = typeof item.id === 'string' ? item.id : (item.id?.videoId || 'unknown');

  return {
    id: videoId,
    youtube_id: videoId,
    channel_id: snippet.channelId,
    category_id: null,
    title: snippet.title,
    description: snippet.description,
    thumbnail_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    video_url: null,
    video_source: 'youtube',
    duration: contentDetails.duration ? parseYouTubeDuration(contentDetails.duration) : Math.floor(Math.random() * 600) + 120, // Default to a random 2-12 min if missing
    view_count: parseInt(statistics.viewCount || '0', 10) || Math.floor(Math.random() * 500000) + 10000,
    like_count: parseInt(statistics.likeCount || '0', 10) || Math.floor(Math.random() * 10000) + 500,
    dislike_count: 0,
    comment_count: parseInt(statistics.commentCount || '0', 10) || 0,
    is_live: snippet.liveBroadcastContent === 'live',
    is_short: false,
    is_premiere: false,
    is_private: false,
    published_at: snippet.publishedAt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    channel: {
      id: snippet.channelId,
      user_id: null,
      name: snippet.channelTitle,
      handle: `@${snippet.channelTitle?.replace(/\s+/g, '').toLowerCase()}`,
      description: null,
      avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${snippet.channelId}`,
      banner_url: null,
      subscriber_count: Math.floor(Math.random() * 1000000) + 5000,
      video_count: 0,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  };
}

// ==========================================
// FALLBACK MOCK DATA ENGINE 
// (For when YOUTUBE_API_KEY is missing or Quota Exceeded)
// ==========================================

const MOCK_VIDEOS: VideoWithChannel[] = [
  ...[
    { id: 'JhHMJCUmq28', title: 'The Future of Quantum Computing Explained', channel: 'TechVault', dur: 1847 },
    { id: 'udHVy4Y0T8s', title: 'Hubbles Greatest Discoveries of the Decade', channel: 'Cosmos Explorer', dur: 2340 },
    { id: 'Sklc_fQBmcs', title: 'Next.js 15 Full Course - Build Production Apps', channel: 'Dev Mastery', dur: 14400 },
    { id: 'aircAruvnKk', title: 'GPT-5 vs Gemini Ultra: The Real Comparison', channel: 'AI Frontiers', dur: 1920 },
    { id: 'zBZgdTb-dns', title: 'Supabase in 100 Seconds', channel: 'Dev Mastery', dur: 102 },
    { id: '5fLd8kH2jgA', title: 'Dust: Best Sci-Fi Short Films 2024', channel: 'Sci-Fi Shorts', dur: 2100 },
    { id: 'HneiEA1B8ks', title: 'Dark Matter: The Invisible Universe', channel: 'Cosmos Explorer', dur: 2640 },
    { id: 'F9zdInrwFcc', title: 'TypeScript Advanced Patterns You Need to Know', channel: 'Dev Mastery', dur: 5400 }
  ].map((v) => mapYouTubeVideoToOurSchema({
    id: v.id,
    snippet: {
      channelId: v.channel.toLowerCase().replace(/\s/g, ''),
      title: v.title,
      description: 'Mocked fallback description for this highly requested video.',
      thumbnails: { high: { url: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg` } },
      channelTitle: v.channel,
      publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    },
    contentDetails: { duration: `PT${Math.floor(v.dur / 60)}M${v.dur % 60}S` },
    statistics: { viewCount: String(Math.floor(Math.random() * 10000000)), likeCount: String(Math.floor(Math.random() * 100000)) }
  }))
];

function getFallbackResults(query?: string) {
  if (!query) return MOCK_VIDEOS;
  return MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()) || v.channel?.name.toLowerCase().includes(query.toLowerCase()));
}

// ==========================================
// LIVE API FETCHERS
// ==========================================

export async function fetchTrendingVideos(categoryId = '', pageToken = ''): Promise<{videos: VideoWithChannel[], nextPageToken: string | null}> {
  if (!YOUTUBE_API_KEY) {
    console.warn("Missing YOUTUBE_API_KEY: Serving fallback trending videos.");
    return { videos: MOCK_VIDEOS, nextPageToken: null };
  }

  try {
    let url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=24&regionCode=US&key=${YOUTUBE_API_KEY}`;
    if (categoryId) url += `&videoCategoryId=${categoryId}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache for 1 hour
    
    if (!res.ok) throw new Error(`YouTube API Error: ${res.status}`);
    
    const data = await res.json();
    return { 
      videos: data.items.map(mapYouTubeVideoToOurSchema),
      nextPageToken: data.nextPageToken || null
    };
  } catch (error) {
    console.warn("YouTube API error (trending):", error, "Serving fallback videos.");
    return { videos: MOCK_VIDEOS, nextPageToken: null };
  }
}

export async function fetchSearchVideos(query: string): Promise<VideoWithChannel[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn("Missing YOUTUBE_API_KEY: Serving fallback search results.");
    return getFallbackResults(query);
  }

  try {
    // 1. Search requires fetching just the IDs first to be safe, but snippet contains base info.
    const searchUrl = `${BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=16&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 600 } });
    
    if (!searchRes.ok) throw new Error(`YouTube API Error: ${searchRes.status}`);
    const searchData = await searchRes.json();
    
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    if (!videoIds) return [];

    // 2. Fetch full details using the IDs to get accurate views & duration
    const videosUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const videosRes = await fetch(videosUrl, { next: { revalidate: 600 } });
    
    if (!videosRes.ok) throw new Error(`YouTube API Error: ${videosRes.status}`);
    const videosData = await videosRes.json();
    
    return videosData.items.map(mapYouTubeVideoToOurSchema);
  } catch (error) {
    console.warn("YouTube API error (search):", error, "Serving fallback videos.");
    return getFallbackResults(query);
  }
}

export async function fetchVideoDetails(videoId: string): Promise<VideoWithChannel | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn("Missing YOUTUBE_API_KEY: Serving fallback video details.");
    return MOCK_VIDEOS.find(v => v.youtube_id === videoId) || MOCK_VIDEOS[0];
  }

  try {
    const url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!res.ok) throw new Error(`YouTube API Error: ${res.status}`);
    const data = await res.json();
    
    if (!data.items || data.items.length === 0) return null;
    return mapYouTubeVideoToOurSchema(data.items[0]);
  } catch (error) {
    console.warn("YouTube API error (details):", error, "Serving fallback videos.");
    return MOCK_VIDEOS.find(v => v.youtube_id === videoId) || MOCK_VIDEOS[0];
  }
}

export async function fetchRelatedVideos(videoId: string): Promise<VideoWithChannel[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn("Missing YOUTUBE_API_KEY: Serving fallback related videos.");
    return MOCK_VIDEOS.filter(v => v.youtube_id !== videoId);
  }

  try {
    // Official "relatedToVideoId" is deprecated and returns 400.
    // Instead we fetch standard popular videos to populate the sidebar recommendations securely.
    const url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=12&regionCode=US&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!res.ok) throw new Error(`YouTube API Error: ${res.status}`);
    const data = await res.json();
    
    return data.items.map(mapYouTubeVideoToOurSchema);

  } catch (error) {
    console.warn("YouTube API error (related):", error, "Serving fallback videos.");
    return MOCK_VIDEOS.filter(v => v.youtube_id !== videoId);
  }
}

export async function fetchChannelByHandle(handle: string): Promise<any | null> {
  if (!YOUTUBE_API_KEY) return MOCK_VIDEOS[0].channel;

  try {
    const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;
    // First, search for the channel by handle/query to get the ID
    const searchUrl = `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(formattedHandle)}&maxResults=1&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 86400 } });
    const searchData = await searchRes.json();

    if (!searchData.items?.length) return null;
    const channelId = searchData.items[0].id.channelId;

    // Second, fetch full channel details
    const channelUrl = `${BASE_URL}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(channelUrl, { next: { revalidate: 86400 } });
    const data = await res.json();

    if (!data.items?.length) return null;
    const item = data.items[0];
    
    return {
      id: item.id,
      name: item.snippet.title,
      handle: item.snippet.customUrl || formattedHandle,
      description: item.snippet.description,
      avatar_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      banner_url: item.brandingSettings?.image?.bannerExternalUrl,
      subscriber_count: parseInt(item.statistics.subscriberCount || '0', 10),
      video_count: parseInt(item.statistics.videoCount || '0', 10),
      is_verified: true,
      created_at: item.snippet.publishedAt
    };
  } catch (error) {
    console.error("YouTube API error (channel):", error);
    return null;
  }
}

export async function fetchVideosByChannelId(channelId: string): Promise<VideoWithChannel[]> {
  if (!YOUTUBE_API_KEY) return MOCK_VIDEOS;

  try {
    const url = `${BASE_URL}/search?part=snippet&channelId=${channelId}&maxResults=20&order=date&type=video&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (!data.items?.length) return [];
    
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    
    // We need 'videos' endpoint to get duration/views
    const detailsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const detailsRes = await fetch(detailsUrl, { next: { revalidate: 3600 } });
    const detailsData = await detailsRes.json();

    return detailsData.items.map(mapYouTubeVideoToOurSchema);
  } catch (error) {
    console.error("YouTube API error (channel videos):", error);
    return MOCK_VIDEOS;
  }
}

export async function fetchShortsVideos(): Promise<VideoWithChannel[]> {
  if (!YOUTUBE_API_KEY) return MOCK_VIDEOS.map(v => ({...v, is_short: true}));

  try {
    // 1. Search for #shorts specifically, limited to 'short' duration (< 4 minutes)
    const searchUrl = `${BASE_URL}/search?part=snippet&type=video&videoDuration=short&q=${encodeURIComponent('#shorts')} &maxResults=20&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
    const searchData = await searchRes.json();

    if (!searchData.items?.length) return [];
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // 2. Fetch full details for better thumbnails and duration
    const videosUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const videosRes = await fetch(videosUrl, { next: { revalidate: 3600 } });
    const videosData = await videosRes.json();

    return videosData.items.map((item: any) => ({
      ...mapYouTubeVideoToOurSchema(item),
      is_short: true
    }));
  } catch (error) {
    console.error("YouTube API error (shorts):", error);
    return MOCK_VIDEOS.map(v => ({...v, is_short: true}));
  }
}
