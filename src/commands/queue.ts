import type { Command, CommandContext } from "../types/index.js";
import { sendMessage, formatQueue, formatNowPlaying } from "../utils/message.js";
import {
  getQueue,
  skip as skipTrack,
  removeTack,
  clearQueue,
  stop as stopQueue,
} from "../queue/manager.js";

const COMMUNITY_ID = "default";

export const queueCommand: Command = {
  name: "queue",
  aliases: ["q"],
  description: "Show the current queue",
  async execute(ctx: CommandContext) {
    const state = await getQueue(COMMUNITY_ID);
    const page = parseInt(ctx.args[0]) || 1;
    await sendMessage(ctx.channelId, formatQueue(state, page));
  },
};

export const skipCommand: Command = {
  name: "skip",
  aliases: ["s"],
  description: "Skip to the next track",
  async execute(ctx: CommandContext) {
    const next = await skipTrack(COMMUNITY_ID, ctx.channelId);
    if (next) {
      await sendMessage(ctx.channelId, `⏭️ Skipped!\n\n${formatNowPlaying(next)}`);
    } else {
      await sendMessage(ctx.channelId, "⏹️ No more tracks in the queue.");
    }
  },
};

export const removeCommand: Command = {
  name: "remove",
  aliases: ["rm"],
  description: "Remove a track from the queue",
  async execute(ctx: CommandContext) {
    const position = parseInt(ctx.args[0]);
    if (isNaN(position) || position < 1) {
      await sendMessage(
        ctx.channelId,
        "❌ Please specify a valid position. Usage: `/remove <n>`",
      );
      return;
    }

    const removed = await removeTack(COMMUNITY_ID, position);
    if (removed) {
      await sendMessage(
        ctx.channelId,
        `🗑️ Removed **${removed.title}** — ${removed.artist} from the queue.`,
      );
    } else {
      await sendMessage(ctx.channelId, "❌ Invalid position.");
    }
  },
};

export const clearCommand: Command = {
  name: "clear",
  aliases: [],
  description: "Clear the queue (keeps current track)",
  async execute(ctx: CommandContext) {
    await clearQueue(COMMUNITY_ID);
    await sendMessage(ctx.channelId, "🧹 Queue cleared.");
  },
};

export const stopCommand: Command = {
  name: "stop",
  aliases: [],
  description: "Stop playback and clear the queue",
  async execute(ctx: CommandContext) {
    await stopQueue(COMMUNITY_ID);
    await sendMessage(ctx.channelId, "⏹️ Playback stopped and queue cleared.");
  },
};
