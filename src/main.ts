import { rootServer, RootBotStartState } from "@rootsdk/server-bot";

async function onStarting(state: RootBotStartState) {
  // Run core logic for the bot, such as initializing commands, event listeners, etc.
}

(async () => {
  await rootServer.lifecycle.start(onStarting);
})();
