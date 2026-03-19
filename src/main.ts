import { rootServer, type RootBotStartState } from "@rootsdk/server-bot";
import { initializeCommands } from "./commands/index.js";
import { initializeVoiceMonitor } from "./voice/monitor.js";

async function onStarting(_state: RootBotStartState) {
  initializeCommands();
  initializeVoiceMonitor();
  console.log("[PanitasMusic] Bot started successfully");
}

(async () => {
  await rootServer.lifecycle.start(onStarting);
})();
