/**
 * Shared formatting utilities — single source of truth.
 * Import from here instead of duplicating in each page.
 */

export function formatViews(views: number): string {
  if (views >= 1_000_000_000) return (views / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (views >= 1_000_000) return (views / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (views >= 1_000) return (views / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return views.toString();
}

export function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return count.toString();
}

export function formatDuration(seconds: number): string {
  if (seconds === 0) return 'LIVE';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function timeAgo(date: string): string {
  const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString(undefined, options ?? { dateStyle: 'long' });
}
