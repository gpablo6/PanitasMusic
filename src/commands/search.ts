import type { Command, CommandContext } from "../types/index.js";
import { sendMessage, formatSearchResults } from "../utils/message.js";
import { search } from "../services/resolver.js";

export const searchCommand: Command = {
  name: "search",
  aliases: [],
  description: "Search Spotify & YouTube",
  async execute(ctx: CommandContext) {
    const query = ctx.rawArgs.trim();
    if (!query) {
      await sendMessage(
        ctx.channelId,
        "❌ Please provide a search query. Usage: `/search <query>`",
      );
      return;
    }

    await sendMessage(ctx.channelId, "🔍 Searching...");

    const results = await search(query, ctx.userId);
    await sendMessage(ctx.channelId, formatSearchResults(results, query));
  },
};
