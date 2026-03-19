import type { ChannelGuid } from "@rootsdk/server-bot";

export async function joinChannel(_channelId: ChannelGuid): Promise<void> {
  // TODO: Implement when Root SDK adds voice join API
  throw new Error("Voice streaming not yet supported by Root SDK");
}

export async function streamAudio(_url: string): Promise<void> {
  // TODO: Implement when Root SDK adds audio streaming API
  throw new Error("Voice streaming not yet supported by Root SDK");
}
