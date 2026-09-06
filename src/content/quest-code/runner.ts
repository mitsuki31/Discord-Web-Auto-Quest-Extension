import { QUEST_MAX_ATTEMPTS, QUEST_CHECK_INTERVAL } from "../../constants";
import { sendUpdate } from "../../shared/messaging";
import type { WebpackRequire, NewWindowI, QuestStateI } from "../../types";
import { sleep } from "../../utils";
import { loadStores, processVideoStep, processHeartbeatStep } from "./processor";
import { getActiveQuests, initializeQuestState } from "./state";

export async function runQuestCode(webpackRequire: WebpackRequire): Promise<void> {
  const discordWindow = window as NewWindowI;
  const version = discordWindow.__QUEST_VERSION ?? "unknown";

  try {
    delete discordWindow.__QUEST_VERSION;
  } catch {
    // Nothing to do if the property cannot be removed.
  }

  console.info(`Discord Auto Quest: Initializing... (v${version})`);

  const stores = loadStores(webpackRequire);

  if (!stores) {
    console.error(
      "Discord Auto Quest: Required Discord modules were not found.",
    );
    return;
  }

  const activeQuests = getActiveQuests(stores.questsStore);

  if (activeQuests.length === 0) {
    console.info(
      "Discord Auto Quest: You don't have any uncompleted active quests!",
    );
    return;
  }

  const questStates: QuestStateI[] = [];

  for (const quest of activeQuests) {
    try {
      questStates.push(initializeQuestState(quest));
    } catch (error) {
      console.error(
        `Discord Auto Quest: Failed to initialize quest ${quest.id}.`,
        error,
      );
    }
  }

  sendUpdate(
    "QUEST_LIST",
    questStates.map(state => ({
      id: state.quest.id,
      name: state.questName,
      progress: Math.floor(state.currentProgress),
      target: state.secondsNeeded,
      completed: state.completed,
    })),
  );

  for (const state of questStates) {
    if (state.completed) continue;

    let failedAttempts = 0;

    while (!state.completed) {
      const isVideo = state.taskType?.startsWith("WATCH_VIDEO") ?? false;
      const success = isVideo
        ? await processVideoStep(state, stores.api)
        : await processHeartbeatStep(state, stores);

      if (!success) {
        failedAttempts++;

        if (failedAttempts >= QUEST_MAX_ATTEMPTS) {
          console.error(
            `Discord Auto Quest: Giving up on quest ${state.quest.id}.`,
          );
          break;
        }

        await sleep(QUEST_CHECK_INTERVAL);
        continue;
      }

      failedAttempts = 0;

      if (!state.completed) {
        await sleep(isVideo
          ? 1000 + Math.random() * 500
          : 20000 + Math.random() * 2000,
        );
      }
    }
  }
}
