import type { ChannelGuid } from "@rootsdk/server-bot";
import type { QueueState, TrackInfo } from "../types/index.js";
import { saveQueueState, getQueueState } from "../storage/store.js";
import { sendMessage, formatNowPlaying } from "../utils/message.js";

const queues = new Map<string, QueueState>();
const advanceTimers = new Map<string, ReturnType<typeof setTimeout>>();

function defaultState(): QueueState {
  return {
    tracks: [],
    currentIndex: -1,
    isPlaying: false,
    repeatMode: "off",
  };
}

export async function getQueue(communityId: string): Promise<QueueState> {
  let state = queues.get(communityId);
  if (!state) {
    state = (await getQueueState(communityId)) ?? defaultState();
    queues.set(communityId, state);
  }
  return state;
}

async function persist(communityId: string, state: QueueState): Promise<void> {
  queues.set(communityId, state);
  await saveQueueState(communityId, state);
}

export async function addTrack(
  communityId: string,
  track: TrackInfo,
): Promise<number> {
  const state = await getQueue(communityId);
  state.tracks.push(track);
  const position = state.tracks.length;

  if (!state.isPlaying) {
    state.currentIndex = state.tracks.length - 1;
    state.isPlaying = true;
  }

  await persist(communityId, state);
  return position;
}

export async function addTracks(
  communityId: string,
  tracks: TrackInfo[],
): Promise<void> {
  const state = await getQueue(communityId);
  const wasEmpty = state.tracks.length === 0;
  state.tracks.push(...tracks);

  if (wasEmpty && tracks.length > 0) {
    state.currentIndex = 0;
    state.isPlaying = true;
  }

  await persist(communityId, state);
}

export async function skip(
  communityId: string,
  channelId: ChannelGuid,
): Promise<TrackInfo | null> {
  const state = await getQueue(communityId);
  cancelAutoAdvance(communityId);

  if (state.tracks.length === 0) return null;

  if (state.repeatMode === "one") {
    // replay same track
  } else {
    state.currentIndex++;
  }

  if (state.currentIndex >= state.tracks.length) {
    if (state.repeatMode === "all") {
      state.currentIndex = 0;
    } else {
      state.isPlaying = false;
      state.currentIndex = -1;
      await persist(communityId, state);
      return null;
    }
  }

  state.isPlaying = true;
  await persist(communityId, state);

  const current = state.tracks[state.currentIndex];
  scheduleAutoAdvance(communityId, channelId, current.duration);
  return current;
}

export async function removeTack(
  communityId: string,
  position: number,
): Promise<TrackInfo | null> {
  const state = await getQueue(communityId);
  const index = position - 1;

  if (index < 0 || index >= state.tracks.length) return null;

  const [removed] = state.tracks.splice(index, 1);

  if (index < state.currentIndex) {
    state.currentIndex--;
  } else if (index === state.currentIndex) {
    if (state.currentIndex >= state.tracks.length) {
      state.currentIndex = state.tracks.length > 0 ? 0 : -1;
      if (state.tracks.length === 0) state.isPlaying = false;
    }
  }

  await persist(communityId, state);
  return removed;
}

export async function clearQueue(communityId: string): Promise<void> {
  const state = await getQueue(communityId);
  const current =
    state.currentIndex >= 0 ? state.tracks[state.currentIndex] : null;
  state.tracks = current ? [current] : [];
  state.currentIndex = current ? 0 : -1;
  await persist(communityId, state);
}

export async function stop(communityId: string): Promise<void> {
  cancelAutoAdvance(communityId);
  const state = defaultState();
  await persist(communityId, state);
}

export async function getCurrentTrack(
  communityId: string,
): Promise<TrackInfo | null> {
  const state = await getQueue(communityId);
  if (!state.isPlaying || state.currentIndex < 0) return null;
  return state.tracks[state.currentIndex] ?? null;
}

export async function startPlaying(
  communityId: string,
  channelId: ChannelGuid,
): Promise<void> {
  const track = await getCurrentTrack(communityId);
  if (track) {
    await sendMessage(channelId, formatNowPlaying(track));
    scheduleAutoAdvance(communityId, channelId, track.duration);
  }
}

function scheduleAutoAdvance(
  communityId: string,
  channelId: ChannelGuid,
  durationSeconds: number,
): void {
  cancelAutoAdvance(communityId);
  const timer = setTimeout(async () => {
    const next = await skip(communityId, channelId);
    if (next) {
      await sendMessage(channelId, formatNowPlaying(next));
    } else {
      await sendMessage(
        channelId,
        "⏹️ Queue finished. Add more tracks with `/play`.",
      );
    }
  }, durationSeconds * 1000);
  advanceTimers.set(communityId, timer);
}

function cancelAutoAdvance(communityId: string): void {
  const timer = advanceTimers.get(communityId);
  if (timer) {
    clearTimeout(timer);
    advanceTimers.delete(communityId);
  }
}
