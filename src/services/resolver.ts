import type { UserGuid } from "@rootsdk/server-bot";
import type { TrackInfo } from "../types/index.js";
import { parseUrl } from "../utils/url-parser.js";
import * as youtube from "./youtube/client.js";
import * as spotify from "./spotify/client.js";
import { isSpotifyConfigured } from "./spotify/auth.js";

async function spotifyTrackToTrackInfo(
  spotifyTrack: {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    uri: string;
    thumbnailUrl?: string;
  },
  requestedBy: UserGuid,
): Promise<TrackInfo> {
  // Search YouTube for the audio source
  const ytResults = await youtube.searchVideos(
    `${spotifyTrack.title} ${spotifyTrack.artist}`,
    1,
  );
  const ytMatch = ytResults[0];

  return {
    id: spotifyTrack.id,
    title: spotifyTrack.title,
    artist: spotifyTrack.artist,
    album: spotifyTrack.album,
    duration: spotifyTrack.duration,
    thumbnailUrl: spotifyTrack.thumbnailUrl,
    spotifyUri: spotifyTrack.uri,
    youtubeId: ytMatch?.id,
    youtubeUrl: ytMatch?.url,
    requestedBy,
    source: "spotify",
  };
}

export async function resolve(
  input: string,
  requestedBy: UserGuid,
): Promise<TrackInfo[]> {
  const parsed = parseUrl(input);

  if (parsed) {
    switch (parsed.type) {
      case "spotify-track": {
        const track = await spotify.getTrack(parsed.id);
        if (!track) return [];
        return [await spotifyTrackToTrackInfo(track, requestedBy)];
      }

      case "spotify-playlist": {
        const tracks = await spotify.getPlaylistTracks(parsed.id);
        return Promise.all(
          tracks.map((t) => spotifyTrackToTrackInfo(t, requestedBy)),
        );
      }

      case "spotify-album": {
        const tracks = await spotify.getAlbumTracks(parsed.id);
        return Promise.all(
          tracks.map((t) => spotifyTrackToTrackInfo(t, requestedBy)),
        );
      }

      case "youtube-video": {
        const info = await youtube.getVideoInfo(parsed.id);
        if (!info) return [];
        return [
          {
            id: info.id,
            title: info.title,
            artist: info.artist,
            duration: info.duration,
            thumbnailUrl: info.thumbnailUrl,
            youtubeId: info.id,
            youtubeUrl: info.url,
            requestedBy,
            source: "youtube",
          },
        ];
      }

      case "youtube-playlist": {
        const videos = await youtube.getPlaylistVideos(parsed.id);
        return videos.map((v) => ({
          id: v.id,
          title: v.title,
          artist: v.artist,
          duration: v.duration,
          thumbnailUrl: v.thumbnailUrl,
          youtubeId: v.id,
          youtubeUrl: v.url,
          requestedBy,
          source: "youtube" as const,
        }));
      }
    }
  }

  // Text query — search Spotify first for better metadata, fallback to YouTube
  if (isSpotifyConfigured()) {
    const spotifyResults = await spotify.searchTracks(input, 1);
    if (spotifyResults.length > 0) {
      return [await spotifyTrackToTrackInfo(spotifyResults[0], requestedBy)];
    }
  }

  // Fallback to YouTube search
  const ytResults = await youtube.searchVideos(input, 1);
  if (ytResults.length > 0) {
    const v = ytResults[0];
    return [
      {
        id: v.id,
        title: v.title,
        artist: v.artist,
        duration: v.duration,
        thumbnailUrl: v.thumbnailUrl,
        youtubeId: v.id,
        youtubeUrl: v.url,
        requestedBy,
        source: "youtube",
      },
    ];
  }

  return [];
}

export async function search(
  query: string,
  requestedBy: UserGuid,
): Promise<TrackInfo[]> {
  const results: TrackInfo[] = [];

  // Search both services in parallel
  const [spotifyResults, ytResults] = await Promise.all([
    isSpotifyConfigured()
      ? spotify.searchTracks(query, 3)
      : Promise.resolve([]),
    youtube.searchVideos(query, 3),
  ]);

  for (const track of spotifyResults) {
    results.push({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      thumbnailUrl: track.thumbnailUrl,
      spotifyUri: track.uri,
      requestedBy,
      source: "spotify",
    });
  }

  for (const v of ytResults) {
    results.push({
      id: v.id,
      title: v.title,
      artist: v.artist,
      duration: v.duration,
      thumbnailUrl: v.thumbnailUrl,
      youtubeId: v.id,
      youtubeUrl: v.url,
      requestedBy,
      source: "youtube",
    });
  }

  return results;
}
