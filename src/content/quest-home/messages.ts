import { getQuestListContainer } from "./dom";
import { questStateCache } from "./state";
import type { SupportedQuestMessage } from "../../types";
import { updateQuestListUI, updateQuestItemUI } from "./quest";

export function handleQuestMessage(
  message: SupportedQuestMessage,
): void {
  const listContainer = getQuestListContainer();

  switch (message.type) {
    case "QUEST_LIST": {
      questStateCache.clear();

      for (const quest of message.data) {
        questStateCache.set(quest.id, quest);
      }

      if (listContainer) updateQuestListUI();
      break;
    }

    case "QUEST_UPDATE": {
      questStateCache.set(message.data.id, message.data);

      if (listContainer) {
        updateQuestItemUI(listContainer, message.data);
      }
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
