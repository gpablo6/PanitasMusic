import type { Command, CommandContext } from "../types/index.js";
import { sendMessage } from "../utils/message.js";
import { isSpotifyConfigured } from "../services/spotify/auth.js";

export const authCommand: Command = {
  name: "auth",
  aliases: [],
  description: "Manage authentication",
  async execute(ctx: CommandContext) {
    const service = ctx.args[0]?.toLowerCase();

    if (service === "spotify") {
      if (!isSpotifyConfigured()) {
        await sendMessage(
          ctx.channelId,
          "❌ Spotify is not configured. The bot admin needs to set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.",
        );
        return;
      }

      // For now, client credentials flow is automatic. User-specific OAuth
      // would require a callback URL which needs server infrastructure.
      await sendMessage(
        ctx.channelId,
        "✅ Spotify is configured with Client Credentials. User-specific OAuth is not yet available.",
      );
      return;
    }

    await sendMessage(
      ctx.channelId,
      "Usage: `/auth spotify` — Check Spotify authentication status.",
    );
  },
};
