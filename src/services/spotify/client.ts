import { getSpotifyClient } from "./auth.js";
import type { SpotifyTrackInfo } from "./types.js";

function mapTrack(track: {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  duration_ms: number;
  uri: string;
}): SpotifyTrackInfo {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    duration: Math.round(track.duration_ms / 1000),
    uri: track.uri,
    thumbnailUrl: track.album.images[0]?.url,
  };
}

export async function getTrack(
  trackId: string,
): Promise<SpotifyTrackInfo | null> {
  const client = getSpotifyClient();
  if (!client) return null;

  try {
    const track = await client.tracks.get(trackId);
    return mapTrack(track);
  } catch (error) {
    console.error(`[Spotify] Failed to get track ${trackId}:`, error);
    return null;
  }
}

export async function getPlaylistTracks(
  playlistId: string,
): Promise<SpotifyTrackInfo[]> {
  const client = getSpotifyClient();
  if (!client) return [];

  try {
    const playlist = await client.playlists.getPlaylist(playlistId);
    return playlist.tracks.items
      .filter((item) => item.track && item.track.type === "track")
      .map((item) => mapTrack(item.track as Parameters<typeof mapTrack>[0]));
  } catch (error) {
    console.error(
      `[Spotify] Failed to get playlist ${playlistId}:`,
      error,
    );
    return [];
  }
}

export async function getAlbumTracks(
  albumId: string,
): Promise<SpotifyTrackInfo[]> {
  const client = getSpotifyClient();
  if (!client) return [];

  try {
    const album = await client.albums.get(albumId);
    return album.tracks.items.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: album.name,
      duration: Math.round(track.duration_ms / 1000),
      uri: track.uri,
      thumbnailUrl: album.images[0]?.url,
    }));
  } catch (error) {
    console.error(`[Spotify] Failed to get album ${albumId}:`, error);
    return [];
  }
}

export async function searchTracks(
  query: string,
  limit: number = 5,
): Promise<SpotifyTrackInfo[]> {
  const client = getSpotifyClient();
  if (!client) return [];

  try {
    const results = await client.search(query, ["track"], undefined, limit as 1 | 2 | 3 | 4 | 5);
    return results.tracks.items.map(mapTrack);
  } catch (error) {
    console.error(`[Spotify] Search failed for "${query}":`, error);
    return [];
  }
}
