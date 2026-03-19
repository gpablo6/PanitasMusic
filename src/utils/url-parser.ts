export type ParsedUrl =
  | { type: "spotify-track"; id: string }
  | { type: "spotify-playlist"; id: string }
  | { type: "spotify-album"; id: string }
  | { type: "youtube-video"; id: string }
  | { type: "youtube-playlist"; id: string }
  | null;

const SPOTIFY_TRACK_RE =
  /(?:https?:\/\/)?(?:open\.)?spotify\.com\/track\/([a-zA-Z0-9]+)/;
const SPOTIFY_PLAYLIST_RE =
  /(?:https?:\/\/)?(?:open\.)?spotify\.com\/playlist\/([a-zA-Z0-9]+)/;
const SPOTIFY_ALBUM_RE =
  /(?:https?:\/\/)?(?:open\.)?spotify\.com\/album\/([a-zA-Z0-9]+)/;
const SPOTIFY_URI_TRACK_RE = /spotify:track:([a-zA-Z0-9]+)/;
const SPOTIFY_URI_PLAYLIST_RE = /spotify:playlist:([a-zA-Z0-9]+)/;
const SPOTIFY_URI_ALBUM_RE = /spotify:album:([a-zA-Z0-9]+)/;

const YOUTUBE_VIDEO_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
const YOUTUBE_PLAYLIST_RE =
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/;

export function parseUrl(input: string): ParsedUrl {
  let match: RegExpMatchArray | null;

  match = input.match(SPOTIFY_TRACK_RE) ?? input.match(SPOTIFY_URI_TRACK_RE);
  if (match) return { type: "spotify-track", id: match[1] };

  match =
    input.match(SPOTIFY_PLAYLIST_RE) ?? input.match(SPOTIFY_URI_PLAYLIST_RE);
  if (match) return { type: "spotify-playlist", id: match[1] };

  match = input.match(SPOTIFY_ALBUM_RE) ?? input.match(SPOTIFY_URI_ALBUM_RE);
  if (match) return { type: "spotify-album", id: match[1] };

  match = input.match(YOUTUBE_PLAYLIST_RE);
  if (match) return { type: "youtube-playlist", id: match[1] };

  match = input.match(YOUTUBE_VIDEO_RE);
  if (match) return { type: "youtube-video", id: match[1] };

  return null;
}
