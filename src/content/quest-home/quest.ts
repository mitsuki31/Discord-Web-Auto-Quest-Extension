import type { QuestBadgeType, QuestListItem } from "../../types";

const BADGES: Record<string, { label: string; type: QuestBadgeType }> = {
  WATCH_VIDEO: { label: "VIDEO", type: "video" },
  WATCH_VIDEO_ON_MOBILE: { label: "VIDEO", type: "video" },
  PLAY_ON_DESKTOP: { label: "PLAY", type: "play" },
  STREAM_ON_DESKTOP: { label: "STREAM", type: "stream" },
  PLAY_ACTIVITY: { label: "ACTIVITY", type: "activity" },
};

const itemElements = new Map<string, HTMLElement>();
const completionTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearCompletionTimer(id: string): void {
  const timer = completionTimers.get(id);
  if (timer) clearTimeout(timer);
  completionTimers.delete(id);
}

function badgeFor(taskType?: string): { label: string; type: QuestBadgeType } {
  return taskType ? BADGES[taskType] ?? { label: "QUEST", type: "unknown" } : { label: "QUEST", type: "unknown" };
}

function percentageFor({ completed, progress, target }: QuestListItem): number {
  if (completed) return 100;
  if (!Number.isFinite(progress) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.min(100, Math.max(0, (progress / target) * 100));
}

function seconds(value: number): string {
  return `${Math.max(0, Math.floor(Number.isFinite(value) ? value : 0))}s`;
}

function progressText(quest: QuestListItem): string {
  if (quest.completed) return "DONE";
  if (!Number.isFinite(quest.target) || quest.target <= 0) return "Progress unavailable";
  return `${seconds(quest.progress)} / ${seconds(quest.target)}`;
}

function createQuestItem(quest: QuestListItem): HTMLElement {
  const item = document.createElement("article");
  item.className = "dwaq-quest-item";
  item.dataset.questId = quest.id;

  const header = document.createElement("div");
  header.className = "dwaq-quest-header";
  const badge = document.createElement("span");
  badge.className = "dwaq-quest-badge";
  const name = document.createElement("span");
  name.className = "dwaq-quest-name";
  header.append(badge, name);

  const bar = document.createElement("div");
  bar.className = "dwaq-progress-bar";
  bar.setAttribute("role", "progressbar");
  const fill = document.createElement("div");
  fill.className = "dwaq-progress-fill";
  bar.appendChild(fill);

  const text = document.createElement("div");
  text.className = "dwaq-progress-text";
  item.append(header, bar, text);
  updateQuestItem(item, quest, false);
  return item;
}

function updateQuestItem(item: HTMLElement, quest: QuestListItem, animateCompletion = true): void {
  const wasComplete = item.classList.contains("dwaq-quest-item--complete");
  const badgeData = badgeFor(quest.taskType);
  const badge = item.querySelector<HTMLSpanElement>(".dwaq-quest-badge");
  const name = item.querySelector<HTMLSpanElement>(".dwaq-quest-name");
  const bar = item.querySelector<HTMLDivElement>(".dwaq-progress-bar");
  const fill = item.querySelector<HTMLDivElement>(".dwaq-progress-fill");
  const text = item.querySelector<HTMLDivElement>(".dwaq-progress-text");
  const percentage = percentageFor(quest);

  item.classList.toggle("dwaq-quest-item--complete", quest.completed);
  if (badge) {
    badge.className = `dwaq-quest-badge dwaq-quest-badge--${badgeData.type}`;
    badge.textContent = badgeData.label;
  }
  if (name) {
    name.textContent = quest.name;
    name.title = quest.name;
  }
  if (bar) {
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(Math.round(percentage)));
    bar.setAttribute("aria-label", `${quest.name} progress: ${progressText(quest)}`);
  }
  if (fill) {
    fill.style.width = `${percentage}%`;
    fill.classList.toggle("dwaq-progress-fill--complete", quest.completed);
  }
  if (text) text.textContent = progressText(quest);

  if (!animateCompletion || !quest.completed || wasComplete) return;
  item.classList.add("dwaq-quest-item--completing");
  clearCompletionTimer(quest.id);
  completionTimers.set(quest.id, setTimeout(() => {
    item.classList.remove("dwaq-quest-item--completing");
    completionTimers.delete(quest.id);
  }, 600));
}

export function renderQuestList(container: HTMLElement, quests: QuestListItem[]): void {
  const scrollTop = container.scrollTop;
  const empty = container.querySelector<HTMLElement>(".dwaq-empty-state");

  if (quests.length === 0) {
    for (const id of itemElements.keys()) clearCompletionTimer(id);
    itemElements.clear();
    if (!empty) {
      const message = document.createElement("p");
      message.className = "dwaq-empty-state";
      message.textContent = "No quests";
      container.replaceChildren(message);
    }
    return;
  }

  empty?.remove();
  const nextIds = new Set(quests.map(quest => quest.id));
  for (const [id, element] of itemElements) {
    if (!nextIds.has(id)) {
      element.remove();
      clearCompletionTimer(id);
      itemElements.delete(id);
    }
  }

  for (const quest of quests) {
    let item = itemElements.get(quest.id);
    if (!item) {
      item = createQuestItem(quest);
      itemElements.set(quest.id, item);
      container.appendChild(item);
    } else {
      updateQuestItem(item, quest);
    }
  }
  container.scrollTop = scrollTop;
}

export function clearQuestList(): void {
  for (const timer of completionTimers.values()) clearTimeout(timer);
  completionTimers.clear();
  itemElements.clear();
}
