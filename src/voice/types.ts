import type { ChannelGuid, UserGuid } from "@rootsdk/server-bot";

export interface VoiceChannelState {
  channelId: ChannelGuid;
  users: Set<UserGuid>;
}
