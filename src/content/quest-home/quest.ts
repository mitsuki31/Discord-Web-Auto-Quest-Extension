import { getQuestListContainer } from "./dom";
import { questStateCache } from "./state";
import type { QuestListItem } from "../../types";

export function updateQuestListUI(): void {
  const container = getQuestListContainer();
  if (!container) return;

  container.replaceChildren();

  for (const quest of questStateCache.values()) {
    updateQuestItemUI(container, quest);
  }
}

export function updateQuestItemUI(
  container: HTMLElement,
  quest: QuestListItem,
): void {
  const itemId = `quest-item-${quest.id}`;
  const progressId = `quest-progress-${quest.id}`;
  let item = document.getElementById(itemId);

  if (!(item instanceof HTMLDivElement)) {
    item = document.createElement("div");
    item.id = itemId;

    const name = document.createElement("span");
    name.title = quest.name;
    name.textContent = quest.name;

    const progress = document.createElement("span");
    progress.id = progressId;

    item.appendChild(name);
    item.appendChild(progress);

    container.appendChild(item);
  }

  const progress = document.getElementById(progressId);

  if (!(progress instanceof HTMLSpanElement)) {
    return;
  }

  progress.textContent = quest.completed
    ? "DONE"
    : `${quest.progress}/${quest.target}`;

  progress.style.color = quest.completed
    ? "#43b581"
    : "#aaa";

  item.style.opacity = quest.completed
    ? "0.5"
    : "1";
}
