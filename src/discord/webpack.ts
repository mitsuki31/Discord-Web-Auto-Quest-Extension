import type { WebpackRequire, NewWindowI } from "../types";
import { QUEST_MAX_ATTEMPTS, QUEST_CHECK_INTERVAL } from "../constants";
import { sleep } from "../utils";

export async function waitForWebpack(): Promise<WebpackRequire | null> {
  let attempts = 0;

  while (attempts <= QUEST_MAX_ATTEMPTS) {
    if (attempts >= QUEST_MAX_ATTEMPTS) {
      console.error("Discord Auto Quest: Unable to locate Discord webpack runtime.");
      return null;
    }

    const discordWindow = window as NewWindowI;

    if (typeof discordWindow.webpackChunkdiscord_app === "undefined") {
      attempts++;
      await sleep(QUEST_CHECK_INTERVAL);
      continue;
    }

    try {
      const originalJQuery = discordWindow.$;

      delete discordWindow.$;

      const webpackRequire =
        discordWindow.webpackChunkdiscord_app.push([
          [Symbol()],
          {},
          (require: unknown) => require,
        ]) as WebpackRequire;

      discordWindow.webpackChunkdiscord_app.pop();

      if (originalJQuery) {
        discordWindow.$ = originalJQuery;
      }

      if (
        !webpackRequire?.c ||
        Object.keys(webpackRequire.c).length < 10
      ) {
        attempts++;
        await sleep(QUEST_CHECK_INTERVAL);
        continue;
      }

      return webpackRequire;
    } catch (error) {
      attempts++;

      if (attempts >= QUEST_MAX_ATTEMPTS) {
        console.error("Discord Auto Quest: Failed to access webpack runtime.", error);
        return null;
      }

      await sleep(QUEST_CHECK_INTERVAL);
    }
  };

  return null;
}
