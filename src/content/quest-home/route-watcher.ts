import { createQuestButton } from "./button";
import { isQuestHome } from "./navigation";
import { initPanel } from "./panel";

let previousUrl = window.location.href;
let routeObserver: MutationObserver | null = null;

export function watchRouteChanges(): void {
  let currentUrl = window.location.href;

  routeObserver?.disconnect();

  routeObserver = new MutationObserver(() => {
    currentUrl = window.location.href;

    if (currentUrl === previousUrl) return;

    previousUrl = currentUrl;
    handleRouteChange();
  });

  if (document.body) {
    routeObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

export function stopWatchingRouteChanges(): void {
  routeObserver?.disconnect();
  routeObserver = null;
}

export function handleRouteChange(): void {
  createQuestButton();
  if (isQuestHome()) initPanel();
}
