import type { QuestListItem } from "../../types";

let questStateCache = new Map<string, QuestListItem>();
let isPanelExpanded = false;
let expandButtonReference: HTMLButtonElement | null = null;

export function setIsPanelExpanded(value: typeof isPanelExpanded): void {
  if (isPanelExpanded === value) return;
  isPanelExpanded = value;
}

export function setExpandButtonRef(value: typeof expandButtonReference): void {
  if (expandButtonReference === value) return;
  expandButtonReference = value;
}

export { questStateCache, isPanelExpanded, expandButtonReference };
