import { createQuestButton } from "./button";

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

export function handleRouteChange(): void {
  createQuestButton();
}
