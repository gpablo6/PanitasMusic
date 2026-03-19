import {
  rootServer,
  ChannelWebRtcEvent,
  type ChannelWebRtcUserAttachEvent,
  type ChannelWebRtcUserDetachEvent,
  type ChannelGuid,
  type UserGuid,
} from "@rootsdk/server-bot";

// In-memory map of voice channel → set of user IDs
const voiceChannels = new Map<ChannelGuid, Set<UserGuid>>();

export function initializeVoiceMonitor(): void {
  rootServer.community.channelWebRtcs.on(
    ChannelWebRtcEvent.ChannelWebRtcUserAttach,
    onUserAttach,
  );

  rootServer.community.channelWebRtcs.on(
    ChannelWebRtcEvent.ChannelWebRtcUserDetach,
    onUserDetach,
  );

  console.log("[Voice] Monitor initialized");
}

function onUserAttach(evt: ChannelWebRtcUserAttachEvent): void {
  const users = voiceChannels.get(evt.channelId) ?? new Set();
  users.add(evt.userId);
  voiceChannels.set(evt.channelId, users);
  console.log(
    `[Voice] User ${evt.userId} joined channel ${evt.channelId} (${users.size} users)`,
  );
}

function onUserDetach(evt: ChannelWebRtcUserDetachEvent): void {
  const users = voiceChannels.get(evt.channelId);
  if (!users) return;

  users.delete(evt.userId);
  if (users.size === 0) {
    voiceChannels.delete(evt.channelId);
    console.log(`[Voice] Channel ${evt.channelId} is now empty`);
  } else {
    console.log(
      `[Voice] User ${evt.userId} left channel ${evt.channelId} (${users.size} users)`,
    );
  }
}

export function getUsersInChannel(channelId: ChannelGuid): Set<UserGuid> {
  return voiceChannels.get(channelId) ?? new Set();
}

export function isChannelOccupied(channelId: ChannelGuid): boolean {
  const users = voiceChannels.get(channelId);
  return !!users && users.size > 0;
}

export function getOccupiedChannels(): ChannelGuid[] {
  return Array.from(voiceChannels.entries())
    .filter(([, users]) => users.size > 0)
    .map(([id]) => id);
}
