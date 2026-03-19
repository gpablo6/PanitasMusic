import type { UserGuid, ChannelGuid } from "@rootsdk/server-bot";

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // seconds
  thumbnailUrl?: string;
  spotifyUri?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  requestedBy: UserGuid;
  source: "spotify" | "youtube";
}

export interface QueueState {
  tracks: TrackInfo[];
  currentIndex: number;
  isPlaying: boolean;
  repeatMode: "off" | "one" | "all";
  voiceChannelId?: ChannelGuid;
}

export interface CommandContext {
  channelId: ChannelGuid;
  userId: UserGuid;
  args: string[];
  rawArgs: string;
}

export interface Command {
  name: string;
  aliases: string[];
  description: string;
  execute(ctx: CommandContext): Promise<void>;
}
