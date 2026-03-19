import type { Command, CommandContext } from "../types/index.js";
import { sendMessage, formatTrackAdded, formatTracksAdded, formatNowPlaying } from "../utils/message.js";
import { resolve } from "../services/resolver.js";
import { addTrack, addTracks, getCurrentTrack, startPlaying } from "../queue/manager.js";

// TODO: Get communityId properly when SDK provides it. Using a constant for now.
const COMMUNITY_ID = "default";

export const playCommand: Command = {
  name: "play",
  aliases: ["p"],
  description: "Play a track or add to queue",
  async execute(ctx: CommandContext) {
    if (!ctx.rawArgs.trim()) {
      await sendMessage(
        ctx.channelId,
        "❌ Please provide a URL or search query. Usage: `/play <url|query>`",
      );
      return;
    }

    await sendMessage(ctx.channelId, "🔍 Searching...");

    const tracks = await resolve(ctx.rawArgs.trim(), ctx.userId);

    if (tracks.length === 0) {
      await sendMessage(
        ctx.channelId,
        `❌ No results found for "${ctx.rawArgs.trim()}".`,
      );
      return;
    }

    const wasPlaying = await getCurrentTrack(COMMUNITY_ID);

    if (tracks.length === 1) {
      const position = await addTrack(COMMUNITY_ID, tracks[0]);

      if (!wasPlaying) {
        await sendMessage(ctx.channelId, formatNowPlaying(tracks[0]));
        await startPlaying(COMMUNITY_ID, ctx.channelId);
      } else {
        await sendMessage(
          ctx.channelId,
          formatTrackAdded(tracks[0], position),
        );
      }
    } else {
      await addTracks(COMMUNITY_ID, tracks);

      const source = tracks[0].source === "spotify" ? "Spotify" : "YouTube";
      await sendMessage(
        ctx.channelId,
        formatTracksAdded(tracks.length, source),
      );

      if (!wasPlaying) {
        await startPlaying(COMMUNITY_ID, ctx.channelId);
      }
    }
  },
};
