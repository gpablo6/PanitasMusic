import { Innertube } from "youtubei.js";
import type { YouTubeVideoInfo } from "./types.js";

let innertube: Innertube | null = null;

async function getClient(): Promise<Innertube> {
  if (!innertube) {
    innertube = await Innertube.create({ generate_session_locally: true });
  }
  return innertube;
}

export async function getVideoInfo(
  videoId: string,
): Promise<YouTubeVideoInfo | null> {
  try {
    const yt = await getClient();
    const info = await yt.getBasicInfo(videoId);
    const details = info.basic_info;

    return {
      id: videoId,
      title: details.title ?? "Unknown",
      artist: details.author ?? "Unknown",
      duration: details.duration ?? 0,
      thumbnailUrl: details.thumbnail?.[0]?.url,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    console.error(`[YouTube] Failed to get video info for ${videoId}:`, error);
    return null;
  }
}

export async function searchVideos(
  query: string,
  limit: number = 5,
): Promise<YouTubeVideoInfo[]> {
  try {
    const yt = await getClient();
    const results = await yt.search(query, { type: "video" });
    const videos: YouTubeVideoInfo[] = [];

    if (!results.results) return videos;

    for (const item of results.results) {
      if (videos.length >= limit) break;
      if (item.type !== "Video") continue;

      const video = item as {
        id?: string;
        title?: { text?: string };
        author?: { name?: string };
        duration?: { seconds?: number };
        thumbnails?: Array<{ url?: string }>;
      };

      if (!video.id) continue;

      videos.push({
        id: video.id,
        title: video.title?.text ?? "Unknown",
        artist: video.author?.name ?? "Unknown",
        duration: video.duration?.seconds ?? 0,
        thumbnailUrl: video.thumbnails?.[0]?.url,
        url: `https://www.youtube.com/watch?v=${video.id}`,
      });
    }

    return videos;
  } catch (error) {
    console.error(`[YouTube] Search failed for "${query}":`, error);
    return [];
  }
}

export async function getPlaylistVideos(
  playlistId: string,
): Promise<YouTubeVideoInfo[]> {
  try {
    const yt = await getClient();
    const playlist = await yt.getPlaylist(playlistId);
    const videos: YouTubeVideoInfo[] = [];

    if (!playlist.items) return videos;

    for (const item of playlist.items) {
      const video = item as {
        id?: string;
        title?: { text?: string };
        author?: { name?: string };
        duration?: { seconds?: number };
        thumbnails?: Array<{ url?: string }>;
      };

      if (!video.id) continue;

      videos.push({
        id: video.id,
        title: video.title?.text ?? "Unknown",
        artist: video.author?.name ?? "Unknown",
        duration: video.duration?.seconds ?? 0,
        thumbnailUrl: video.thumbnails?.[0]?.url,
        url: `https://www.youtube.com/watch?v=${video.id}`,
      });
    }

    return videos;
  } catch (error) {
    console.error(
      `[YouTube] Failed to get playlist ${playlistId}:`,
      error,
    );
    return [];
  }
}
