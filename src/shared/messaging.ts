import type { QuestI } from "../types";

export function sendUpdate(
  type: "QUEST_LIST" | "QUEST_UPDATE",
  data: unknown,
): void {
  window.postMessage(
    {
      prefix: "DISCORD_QUEST_COMPLETER",
      type,
      data,
    },
    "*",
  );
}

export function notifyUI(
  quest: QuestI,
  progress: number,
  target: number,
  completed: boolean,
): void {
  sendUpdate("QUEST_UPDATE", {
    id: quest.id,
    name: quest.config.messages.questName,
    progress,
    target,
    completed,
  });
}
