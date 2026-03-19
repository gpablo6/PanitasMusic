import { SpotifyApi } from "@spotify/web-api-ts-sdk";

let spotifyClient: SpotifyApi | null = null;

export function getSpotifyClient(): SpotifyApi | null {
  if (spotifyClient) return spotifyClient;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn(
      "[Spotify] SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET not set. Spotify features disabled.",
    );
    return null;
  }

  spotifyClient = SpotifyApi.withClientCredentials(clientId, clientSecret);
  return spotifyClient;
}

export function isSpotifyConfigured(): boolean {
  return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}
