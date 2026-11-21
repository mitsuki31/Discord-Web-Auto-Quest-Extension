import { DWAQ_AUTHORS } from "../../constants";

import { ELEMENT_IDS } from "./constants";
import { createElement, getExpandButton, getQuestControls, getQuestPanel } from "./dom";
import { clearQuestList, renderQuestList } from "./quest";
import { questState } from "./state";

let unsubscribe: (() => void) | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;
let outsideListenersAttached = false;

function addOutsideListeners(): void {
  if (outsideListenersAttached) return;
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleDocumentKeydown);
  outsideListenersAttached = true;
}

function removeOutsideListeners(): void {
  if (!outsideListenersAttached) return;
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleDocumentKeydown);
  outsideListenersAttached = false;
}

function cancelClose(): void {
  if (!closeTimer) return;
  clearTimeout(closeTimer);
  closeTimer = null;
}

function closePanel(restoreFocus: boolean): void {
  const panel = getQuestPanel();
  if (!panel) return;
  removeOutsideListeners();
  cancelClose();
  panel.classList.remove("dwaq-panel--open");
  panel.classList.add("dwaq-panel--closing");
  panel.setAttribute("aria-hidden", "true");
  closeTimer = setTimeout(() => {
    panel.remove();
    clearQuestList();
    closeTimer = null;
    if (restoreFocus) getExpandButton()?.focus();
  }, 150);
}

function createPanel(): HTMLElement {
  const panel = createElement("section");
  panel.id = ELEMENT_IDS.panel;
  panel.className = "dwaq-panel";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-labelledby", ELEMENT_IDS.panelTitle);

  const header = createElement("header");
  header.id = ELEMENT_IDS.panelHeader;
  header.className = "dwaq-panel-header";

  const titleGroup = createElement("div");
  titleGroup.className = "dwaq-panel-header__title";
  const title = createElement("h3");
  title.id = ELEMENT_IDS.panelTitle;
  title.textContent = "Auto Quest";

  const count = createElement("span");
  count.id = ELEMENT_IDS.activeCountBadge;
  count.className = "dwaq-panel-header__badge";
  titleGroup.append(title, count);

  const closeButton = createElement("button");
  closeButton.id = ELEMENT_IDS.closeButton;
  closeButton.type = "button";
  closeButton.className = "dwaq-close-btn";
  closeButton.setAttribute("aria-label", "Close quest panel");
  closeButton.innerHTML = `<svg class="dwaq-close-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  closeButton.addEventListener("click", () => setPanelExpanded(false, true));
  header.append(titleGroup, closeButton);

  const list = createElement("div");
  list.id = ELEMENT_IDS.questList;
  list.className = "dwaq-quest-list";

  const footer = createElement("footer");
  footer.id = ELEMENT_IDS.panelFooter;
  footer.className = "dwaq-panel-footer";

  const status = createElement("span");
  status.className = "dwaq-status-line";
  status.textContent = "Quest progress updates appear here while automation runs.";

  const credits = createElement("div");
  credits.className = "dwaq-credits";
  credits.append("Created by ");

  const author = createElement("a");
  author.href = DWAQ_AUTHORS[0].url;
  author.target = "_blank";
  author.rel = "noopener noreferrer";
  author.innerHTML = `<b>${DWAQ_AUTHORS[0].name}</b>`;
  credits.append(author, " · Reimagined by ");

  const contributor = createElement("a");
  contributor.href = DWAQ_AUTHORS[1].url;
  contributor.target = "_blank";
  contributor.rel = "noopener noreferrer";
  contributor.innerHTML = `<b>${DWAQ_AUTHORS[1].name}</b>`;
  credits.appendChild(contributor);
  footer.append(status, credits);

  panel.append(header, list, footer);
  panel.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      setPanelExpanded(false, true);
    }
  });
  return panel;
}

function renderPanel(): void {
  const controls = getQuestControls();
  if (!controls) return;
  const { isPanelExpanded, buttonState } = questState.getState();
  let panel = getQuestPanel();

  if (isPanelExpanded) {
    addOutsideListeners();
    cancelClose();
    if (!panel) {
      panel = createPanel();
      controls.prepend(panel);
      const openedPanel = panel;
      requestAnimationFrame(() => {
        if (openedPanel.isConnected && questState.getState().isPanelExpanded) {
          openedPanel.classList.add("dwaq-panel--open");
        }
      });
    } else {
      panel.classList.remove("dwaq-panel--closing");
      panel.classList.add("dwaq-panel--open");
      panel.removeAttribute("aria-hidden");
    }
    const list = panel.querySelector<HTMLElement>("#" + ELEMENT_IDS.questList);
    if (list) renderQuestList(list, questState.getQuests());
    const count = panel.querySelector<HTMLElement>("#" + ELEMENT_IDS.activeCountBadge);
    if (count) count.textContent = `${questState.activeCount} active`;
    const status = panel.querySelector<HTMLElement>(".dwaq-status-line");
    if (status) status.textContent = buttonState.mode === "loading" ? "Starting automation…" : "Quest progress updates appear here while automation runs.";
    return;
  }
  closePanel(false);
}

function handlePointerDown(event: PointerEvent): void {
  const controls = getQuestControls();
  if (!controls || !questState.getState().isPanelExpanded) return;
  const target = event.target;
  if (target instanceof Node && !controls.contains(target)) setPanelExpanded(false, false);
}

function handleDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && questState.getState().isPanelExpanded) {
    setPanelExpanded(false, true);
  }
}

export function setPanelExpanded(expanded: boolean, restoreFocus = false): void {
  if (questState.getState().isPanelExpanded === expanded) return;
  questState.setPanelExpanded(expanded);
  if (!expanded && restoreFocus) getExpandButton()?.focus();
}

export function togglePanel(): void {
  setPanelExpanded(!questState.getState().isPanelExpanded);
}

export function initPanel(): void {
  unsubscribe?.();
  unsubscribe = questState.subscribe(renderPanel);
  renderPanel();
}

export function destroyPanel(): void {
  cancelClose();
  unsubscribe?.();
  unsubscribe = null;
  removeOutsideListeners();
  getQuestPanel()?.remove();
  clearQuestList();
}
