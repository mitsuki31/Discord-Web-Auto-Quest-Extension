import { QUEST_MAX_ATTEMPTS, QUEST_CHECK_INTERVAL } from "../../constants";
import { sendUpdate } from "../../shared/messaging";
import type { WebpackRequire, NewWindowI, QuestStateI, QuestStores } from "../../types";
import { sleep } from "../../utils";
import { loadStores, processVideoStep, processHeartbeatStep } from "./processor";
import { getActiveQuests, initializeQuestState } from "./state";

type QuestResult = {
  success: boolean;
  quest: {
    id: QuestStateI["quest"]["id"];
    name: QuestStateI["questName"];
  };
  error: Error | null;
};

async function processQuest(
  state: QuestStateI,
  stores: QuestStores,
): Promise<QuestResult> {
  const quest = {
    id: state.quest.id,
    name: state.questName,
  };

  let attempts = 0;

  while (!state.completed) {
    const isVideo = state.taskType.startsWith("WATCH_VIDEO");

    try {
      const isProcessSuccess = isVideo
        ? await processVideoStep(state, stores.api)
        : await processHeartbeatStep(state, stores);

      if (!isProcessSuccess) {
        attempts++;

        if (attempts >= QUEST_MAX_ATTEMPTS) {
          throw new Error(
            `Giving up at ${attempts} attempts on quest ID: ${state.quest.id}`,
          );
        }

        // Wait for a bit before continuing
        await sleep(QUEST_CHECK_INTERVAL);
        continue;
      }

      // A successful step resets the failed-attempt counter.
      attempts = 0;

      if (!state.completed) {
        const sleepTime = isVideo
          ? 1_000 + Math.random() * 500
          : 20_000 + Math.random() * 2_000;

        await sleep(sleepTime);
      }
    } catch (err: unknown) {
      return {
        success: false,
        quest,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }

  return {
    success: true,
    quest,
    error: null,
  };
}

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

  // Run the processes in parallel
  console.group("[Discord Auto Quest] Running Quests");
  const questResultsPromise = Promise.all(
    questStates
      .filter(state => !state.completed)
      .map((state, idx) => {
        console.info(`[${idx + 1}] Quest <${state.quest.id}>: ${state.questName}`);
        return processQuest(state, stores);
      })
  );
  console.groupEnd();
  const questResults = await questResultsPromise;

  // Get total success and failed quests
  const totalSuccess = questResults.filter(res => res.success).length;
  const totalFailed = questResults.length - totalSuccess;

  // Quest results
  console.groupCollapsed(
    `[Discord Auto Quest] Quest Results | ${totalSuccess} Success : ${totalFailed} Failed`
  );
  questResults.forEach((result, idx) => {
    console.info(
      `[${idx + 1}] Quest <${result.quest.id}>: ${result.success ? '✓ Success' : '✕ Failed'}`
    );
    if (!result.success) console.error("  >", result.error);
  });
  console.groupEnd();
}
