import {
  rootServer,
  ChannelMessageEvent,
  MessageType,
  type ChannelMessageCreatedEvent,
} from "@rootsdk/server-bot";
import type { Command, CommandContext } from "../types/index.js";
import { handleError } from "../utils/error.js";

import { helpCommand } from "./help.js";
import { playCommand } from "./play.js";
import {
  queueCommand,
  skipCommand,
  removeCommand,
  clearCommand,
  stopCommand,
} from "./queue.js";
import { nowPlayingCommand } from "./nowplaying.js";
import { searchCommand } from "./search.js";
import { authCommand } from "./auth.js";

const PREFIX = "/";

const commands: Command[] = [
  helpCommand,
  playCommand,
  queueCommand,
  skipCommand,
  removeCommand,
  clearCommand,
  stopCommand,
  nowPlayingCommand,
  searchCommand,
  authCommand,
];

// Build a lookup map: name + aliases → command
const commandMap = new Map<string, Command>();
for (const cmd of commands) {
  commandMap.set(cmd.name, cmd);
  for (const alias of cmd.aliases) {
    commandMap.set(alias, cmd);
  }
}

function parseCommand(
  content: string,
): { commandName: string; rawArgs: string; args: string[] } | null {
  if (!content.startsWith(PREFIX)) return null;

  const withoutPrefix = content.slice(PREFIX.length);
  const spaceIndex = withoutPrefix.indexOf(" ");

  const commandName =
    spaceIndex === -1
      ? withoutPrefix.toLowerCase()
      : withoutPrefix.slice(0, spaceIndex).toLowerCase();

  const rawArgs =
    spaceIndex === -1 ? "" : withoutPrefix.slice(spaceIndex + 1);

  const args = rawArgs ? rawArgs.split(/\s+/) : [];

  return { commandName, rawArgs, args };
}

async function onMessage(evt: ChannelMessageCreatedEvent): Promise<void> {
  try {
    if (evt.messageType === MessageType.System) return;
    if (!evt.messageContent) return;

    const parsed = parseCommand(evt.messageContent);
    if (!parsed) return;

    const command = commandMap.get(parsed.commandName);
    if (!command) return;

    const ctx: CommandContext = {
      channelId: evt.channelId,
      userId: evt.userId,
      args: parsed.args,
      rawArgs: parsed.rawArgs,
    };

    await command.execute(ctx);
  } catch (error) {
    handleError(error, "CommandDispatcher");
  }
}

export function initializeCommands(): void {
  rootServer.community.channelMessages.on(
    ChannelMessageEvent.ChannelMessageCreated,
    onMessage,
  );

  console.log(
    `[Commands] Registered ${commands.length} commands: ${commands.map((c) => c.name).join(", ")}`,
  );
}
