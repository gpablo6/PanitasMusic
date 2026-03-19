export interface SpotifyTrackInfo {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  uri: string;
  thumbnailUrl?: string;
}
