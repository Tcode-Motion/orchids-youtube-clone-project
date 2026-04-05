export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  user_id: string | null;
  name: string;
  handle: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  subscriber_count: number;
  video_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export type VideoSource = 'upload' | 'youtube';

export interface Video {
  id: string;
  channel_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  video_source: VideoSource;
  youtube_id: string | null;
  duration: number;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  is_live: boolean;
  is_short: boolean;
  is_premiere: boolean;
  is_private: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  channel?: Channel;
  category?: Category;
}

export interface VideoWithChannel extends Video {
  channel: Channel;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  channel_id: string | null;
  parent_id: string | null;
  content: string;
  like_count: number;
  dislike_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_hearted: boolean;
  created_at: string;
  updated_at: string;
  channel?: Channel;
  replies?: Comment[];
}

export interface Subscription {
  id: string;
  user_id: string;
  channel_id: string;
  notifications_enabled: boolean;
  created_at: string;
  channel?: Channel;
}

export interface Playlist {
  id: string;
  user_id: string;
  channel_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_public: boolean;
  video_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistVideo {
  id: string;
  playlist_id: string;
  video_id: string;
  position: number;
  added_at: string;
  video?: VideoWithChannel;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  video_id: string;
  watch_time: number;
  last_position: number;
  watched_at: string;
  video?: VideoWithChannel;
}

export interface WatchLater {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
  video?: VideoWithChannel;
}

export interface VideoLike {
  id: string;
  user_id: string;
  video_id: string;
  is_like: boolean;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  autoplay: boolean;
  restricted_mode: boolean;
  language: string;
  country: string;
  notifications_subscriptions: boolean;
  notifications_recommendations: boolean;
  notifications_activity: boolean;
  default_playback_quality: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_video' | 'comment' | 'reply' | 'like' | 'subscribe' | 'system';
  title: string;
  message: string | null;
  thumbnail_url: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
