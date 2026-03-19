import { rootServer } from "@rootsdk/server-bot";
import type { QueueState } from "../types/index.js";

const QUEUE_KEY_PREFIX = "queue:";

export async function getQueueState(
  communityId: string,
): Promise<QueueState | undefined> {
  return rootServer.dataStore.appData.get<QueueState>(
    QUEUE_KEY_PREFIX + communityId,
  );
}

export async function saveQueueState(
  communityId: string,
  state: QueueState,
): Promise<void> {
  await rootServer.dataStore.appData.set({
    key: QUEUE_KEY_PREFIX + communityId,
    value: state,
  });
}

export async function getSpotifyToken(
  userId: string,
): Promise<string | undefined> {
  return rootServer.dataStore.appData.get<string>(`spotify:token:${userId}`);
}

export async function saveSpotifyToken(
  userId: string,
  token: string,
): Promise<void> {
  await rootServer.dataStore.appData.set({
    key: `spotify:token:${userId}`,
    value: token,
  });
}
