import { ELEMENT_IDS } from "./constants";
import { createElement, getQuestControls } from "./dom";
import { removeElements } from "./lifecycle";
import { isQuestHome } from "./navigation";
import { togglePanel } from "./panel";
import { questState } from "./state";

const ICONS = {
  play: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"></polygon></svg>`,
  chevron: `<svg class="dwaq-expand-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  spinner: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
};

let unsubscribe: (() => void) | null = null;
let successTimeout: ReturnType<typeof setTimeout> | null = null;

function clearSuccessTimeout(): void {
  if (!successTimeout) return;
  clearTimeout(successTimeout);
  successTimeout = null;
}

function renderButton(): void {
  const controls = getQuestControls();
  if (!controls) return;
  const button = controls.querySelector<HTMLButtonElement>("#" + ELEMENT_IDS.button);
  const expandButton = controls.querySelector<HTMLButtonElement>("#" + ELEMENT_IDS.expandButton);
  const icon = controls.querySelector<HTMLSpanElement>(".dwaq-button__icon");
  const text = controls.querySelector<HTMLSpanElement>(".dwaq-button__text");
  if (!button || !expandButton || !icon || !text) return;

  const { buttonState, isPanelExpanded } = questState.getState();
  const isLoading = buttonState.mode === "loading";
  button.disabled = isLoading;
  button.classList.toggle("dwaq-button--loading", isLoading);
  button.classList.toggle("dwaq-button--success", buttonState.mode === "success");
  button.classList.toggle("dwaq-button--error", buttonState.mode === "error");
  expandButton.setAttribute("aria-expanded", String(isPanelExpanded));
  expandButton.querySelector(".dwaq-expand-btn__icon")?.classList.toggle("dwaq-expand-btn__icon--open", isPanelExpanded);

  switch (buttonState.mode) {
    case "loading":
      text.textContent = buttonState.message || "Running Quests...";
      icon.innerHTML = ICONS.spinner;
      icon.classList.add("dwaq-button__spinner");
      break;
    case "success":
      text.textContent = buttonState.message || "Automation Started";
      icon.innerHTML = ICONS.check;
      icon.classList.remove("dwaq-button__spinner");
      break;
    case "error":
      text.textContent = buttonState.message || "Failed to Start";
      icon.innerHTML = ICONS.alert;
      icon.classList.remove("dwaq-button__spinner");
      break;
    default:
      text.textContent = "Run Quests";
      icon.innerHTML = ICONS.play;
      icon.classList.remove("dwaq-button__spinner");
  }
}

function setButtonState(mode: "idle" | "loading" | "success" | "error", message?: string): void {
  clearSuccessTimeout();
  questState.setButtonState(mode, message);
  if (mode === "success") {
    successTimeout = setTimeout(() => questState.setButtonState("idle"), 3000);
  }
}

export function createQuestButton(): void {
  if (!isQuestHome()) {
    removeElements();
    return;
  }
  if (getQuestControls()) return;

  const controls = createElement("div");
  controls.id = ELEMENT_IDS.controls;
  controls.className = "dwaq-controls";

  const button = createElement("button");
  button.id = ELEMENT_IDS.button;
  button.type = "button";
  button.className = "dwaq-button";
  button.setAttribute("aria-label", "Run quests");

  const icon = createElement("span");
  icon.className = "dwaq-button__icon";
  const text = createElement("span");
  text.className = "dwaq-button__text";
  button.append(icon, text);

  const expandButton = createElement("button");
  expandButton.id = ELEMENT_IDS.expandButton;
  expandButton.type = "button";
  expandButton.className = "dwaq-expand-btn";
  expandButton.setAttribute("aria-label", "Toggle quest panel");
  expandButton.setAttribute("aria-controls", ELEMENT_IDS.panel);
  expandButton.innerHTML = ICONS.chevron;

  button.addEventListener("click", () => { void handleButtonClick(); });
  expandButton.addEventListener("click", () => { void togglePanel(); });
  controls.append(button, expandButton);
  document.body.appendChild(controls);

  unsubscribe = questState.subscribe(renderButton);
  renderButton();
}

export function destroyQuestButton(): void {
  clearSuccessTimeout();
  unsubscribe?.();
  unsubscribe = null;
}

export async function handleButtonClick(): Promise<void> {
  const { mode } = questState.getState().buttonState;
  if (mode === "loading" || mode === "success") return;
  if (mode === "error") {
    setButtonState("idle");
    return;
  }
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    setButtonState("error", "Extension Error");
    return;
  }

  setButtonState("loading");
  try {
    chrome.runtime.sendMessage({ action: "executeQuestCode" }, response => {
      if (chrome.runtime.lastError || !response?.success) {
        setButtonState("error", "Failed to Start");
        return;
      }
      setButtonState("success", "Automation Started");
    });
  } catch {
    setButtonState("error", "Extension Error");
  }
}
