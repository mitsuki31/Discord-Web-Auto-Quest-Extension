import { questState } from "./state";
import type { SupportedQuestMessage } from "../../types";

export function handleQuestMessage(
  message: SupportedQuestMessage,
): void {
  switch (message.type) {
    case "QUEST_LIST": {
      questState.replaceQuests(message.data);
      break;
    }

    case "QUEST_UPDATE": {
      const existing = questState.getState().quests.get(message.data.id);
      const nextQuest = {
        ...message.data,
      };
      const taskType = message.data.taskType ?? existing?.taskType;
      if (taskType !== undefined) nextQuest.taskType = taskType;
      questState.upsertQuest(nextQuest);
      break;
    }
  }
}

export function isQuestMessage(
  value: unknown,
): value is SupportedQuestMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as Partial<SupportedQuestMessage>;

  if (message.prefix !== "DISCORD_QUEST_COMPLETER") {
    return false;
  }

  if (
    message.type !== "QUEST_LIST"
    && message.type !== "QUEST_UPDATE"
  ) {
    return false;
  }

  return true;
}

export function handleWindowMessage(event: MessageEvent): void {
  if (event.source !== window || !isQuestMessage(event.data)) {
    return;
  }

  handleQuestMessage(event.data);
}
