import { createQuestButton } from "./button";
import { watchRouteChanges } from "./route-watcher";
import { handleWindowMessage } from "./messages";
import { setExpandButtonRef } from "./state";

let isInitialized = false;
let routeObserver: MutationObserver | null = null;

// We need our own removeElements that also clears the expandButtonReference
export function removeElements(): void {
  const button = document.getElementById("DiscordQuestButton");
  if (button) button.remove();

  const panel = document.getElementById("DiscordQuestPanel");
  if (panel) panel.remove();

  setExpandButtonRef(null);
  routeObserver?.disconnect();
  routeObserver = null;
}

export function init(): void {
  if (isInitialized) return;

  isInitialized = true;

  createQuestButton();
  watchRouteChanges();
  window.addEventListener("message", handleWindowMessage);
}

export function dispose(): void {
  removeElements();
}
