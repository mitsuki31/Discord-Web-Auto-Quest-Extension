import { createQuestButton, destroyQuestButton } from "./button";
import { getQuestControls } from "./dom";
import { handleWindowMessage } from "./messages";
import { isQuestHome } from "./navigation";
import { destroyPanel, initPanel } from "./panel";
import { stopWatchingRouteChanges, watchRouteChanges } from "./route-watcher";
import { injectStyles, removeStyles } from "./styles";

let isInitialized = false;

export function removeElements(): void {
  destroyPanel();
  destroyQuestButton();
  getQuestControls()?.remove();
}

export function init(): void {
  if (isInitialized) return;
  isInitialized = true;
  injectStyles();
  createQuestButton();
  if (isQuestHome()) initPanel();
  watchRouteChanges();
  window.addEventListener("message", handleWindowMessage);
}

export function dispose(): void {
  if (!isInitialized) return;
  removeElements();
  stopWatchingRouteChanges();
  window.removeEventListener("message", handleWindowMessage);
  removeStyles();
  isInitialized = false;
}
