import type { Command, CommandContext } from "../types/index.js";
import { sendMessage } from "../utils/message.js";

const HELP_TEXT = `🎵 **PanitasMusic Bot — Commands**

\`/play <url|query>\` (alias: \`/p\`) — Play a track or add to queue
\`/queue\` (alias: \`/q\`) — Show the current queue
\`/skip\` (alias: \`/s\`) — Skip to the next track
\`/stop\` — Stop playback and clear the queue
\`/remove <n>\` (alias: \`/rm\`) — Remove track at position n
\`/clear\` — Clear the queue (keeps current track)
\`/np\` (alias: \`/nowplaying\`) — Show current track info
\`/search <query>\` — Search Spotify & YouTube
\`/help\` — Show this message

**Supported links:** Spotify tracks, playlists, albums · YouTube videos, playlists`;

export const helpCommand: Command = {
  name: "help",
  aliases: [],
  description: "List all commands",
  async execute(ctx: CommandContext) {
    await sendMessage(ctx.channelId, HELP_TEXT);
  },
};
