import type { Command, CommandContext } from "../types/index.js";
import { sendMessage, formatNowPlaying } from "../utils/message.js";
import { getCurrentTrack } from "../queue/manager.js";

const COMMUNITY_ID = "default";

export const nowPlayingCommand: Command = {
  name: "np",
  aliases: ["nowplaying"],
  description: "Show current track info",
  async execute(ctx: CommandContext) {
    const track = await getCurrentTrack(COMMUNITY_ID);
    if (track) {
      await sendMessage(ctx.channelId, formatNowPlaying(track));
    } else {
      await sendMessage(
        ctx.channelId,
        "🔇 Nothing is playing right now. Use `/play` to start.",
      );
    }
  },
};
