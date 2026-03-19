import {
  rootServer,
  type ChannelGuid,
  type ChannelMessageCreateRequest,
  type UserGuid,
  type CommunityMemberGetRequest,
} from "@rootsdk/server-bot";
import type { TrackInfo, QueueState } from "../types/index.js";

export async function sendMessage(
  channelId: ChannelGuid,
  content: string,
): Promise<void> {
  const request: ChannelMessageCreateRequest = { channelId, content };
  await rootServer.community.channelMessages.create(request);
}

export async function getMemberNickname(userId: UserGuid): Promise<string> {
  const request: CommunityMemberGetRequest = { userId };
  const user = await rootServer.community.communityMembers.get(request);
  return user.nickname;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatNowPlaying(track: TrackInfo): string {
  const duration = formatDuration(track.duration);
  let msg = `🎵 **Now Playing**\n`;
  msg += `**${track.title}** — ${track.artist}\n`;
  if (track.album) msg += `Album: ${track.album}\n`;
  msg += `Duration: ${duration}\n`;
  if (track.youtubeUrl) msg += `${track.youtubeUrl}\n`;
  return msg;
}

export function formatQueue(state: QueueState, page: number = 1): string {
  const PAGE_SIZE = 10;
  const { tracks, currentIndex, isPlaying } = state;

  if (tracks.length === 0) {
    return "📭 The queue is empty. Use `/play <url|query>` to add tracks.";
  }

  const totalPages = Math.ceil(tracks.length / PAGE_SIZE);
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, tracks.length);

  let msg = `📋 **Queue** (${tracks.length} track${tracks.length !== 1 ? "s" : ""})\n\n`;

  if (isPlaying && currentIndex >= 0 && currentIndex < tracks.length) {
    const current = tracks[currentIndex];
    msg += `▶️ **Now:** ${current.title} — ${current.artist} [${formatDuration(current.duration)}]\n\n`;
  }

  const upcoming = tracks.filter((_, i) => i !== currentIndex);
  const upcomingSlice = upcoming.slice(start, end);

  if (upcomingSlice.length > 0) {
    msg += "**Up Next:**\n";
    for (let i = 0; i < upcomingSlice.length; i++) {
      const track = upcomingSlice[i];
      msg += `${start + i + 1}. ${track.title} — ${track.artist} [${formatDuration(track.duration)}]\n`;
    }
  }

  if (totalPages > 1) {
    msg += `\nPage ${safePage}/${totalPages}`;
  }

  return msg;
}

export function formatTrackAdded(track: TrackInfo, position: number): string {
  return `✅ Added **${track.title}** — ${track.artist} [${formatDuration(track.duration)}] to queue (position ${position})`;
}

export function formatTracksAdded(count: number, source: string): string {
  return `✅ Added **${count}** tracks from ${source} to the queue.`;
}

export function formatSearchResults(
  tracks: TrackInfo[],
  query: string,
): string {
  if (tracks.length === 0) {
    return `🔍 No results found for "${query}".`;
  }

  let msg = `🔍 **Search results for "${query}":**\n\n`;
  for (let i = 0; i < Math.min(tracks.length, 5); i++) {
    const track = tracks[i];
    msg += `${i + 1}. **${track.title}** — ${track.artist} [${formatDuration(track.duration)}]\n`;
  }
  msg += `\nUse \`/play <url>\` to add a track to the queue.`;
  return msg;
}
