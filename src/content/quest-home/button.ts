import { ELEMENT_IDS, STYLES } from "./constants";
import { getQuestButton, createElement } from "./dom";
import type { ButtonElements, ButtonState } from "../../types";
import { QUEST_ICON_URL, EXPAND_ICON_URL } from "../../constants";
import { isQuestHome } from "./navigation";
import { togglePanel, createExpandedPanel } from "./panel";
import { removeElements } from "./lifecycle";
import { isPanelExpanded } from "./state";

export function createQuestButton(): void {
  if (!isQuestHome()) {
    removeElements();
    return;
  }

  if (getQuestButton()) return;

  const button = createElement("button", STYLES.button);
  button.id = ELEMENT_IDS.button;
  button.type = "button";

  const icon = createElement("img", STYLES.icon);
  icon.src = QUEST_ICON_URL;
  icon.alt = "Quest Icon";

  const textLabel = createElement("span", STYLES.text);
  textLabel.textContent = "Running Quests";

  const expandButton = createElement("button", STYLES.expandButton);
  expandButton.type = "button";
  expandButton.ariaLabel = "Toggle quest panel";

  const arrowIcon = createElement("img", STYLES.expandIcon);
  arrowIcon.src = EXPAND_ICON_URL;
  arrowIcon.alt = "";

  expandButton.appendChild(arrowIcon);

  button.appendChild(icon);
  button.appendChild(textLabel);
  button.appendChild(expandButton);

  expandButton.addEventListener("click", event => {
    event.stopPropagation();
    togglePanel();
  });

  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
  });

  button.addEventListener("click", () => {
    void handleButtonClick({
      button,
      icon,
      textLabel,
      expandButton,
    });
  });

  document.body.appendChild(button);

  // If panel should be expanded, create it now that the button exists
  if (isPanelExpanded) {
    createExpandedPanel();
  }
}

export async function handleButtonClick(
  elements: ButtonElements,
): Promise<void> {
  if (
    typeof chrome === "undefined" ||
    !chrome.runtime?.sendMessage
  ) {
    updateButtonState(elements, {
      message: "Extension Error",
      backgroundColor: "#ff4444",
      textColor: "white",
      invertIcons: true,
    });

    return;
  }

  try {
    const response = await chrome.runtime.sendMessage<{
      action: "executeQuestCode";
    }>({
      action: "executeQuestCode",
    });

    if (response?.success) {
      updateButtonState(elements, {
        message: "Code Executed",
        backgroundColor: "black",
        textColor: "white",
        invertIcons: true,
      });

      return;
    }

    updateButtonState(elements, {
      message: "Error",
      backgroundColor: "black",
      textColor: "white",
      invertIcons: true,
    });
  } catch (error) {
    console.error("Discord Auto Quest Error:", error);

    updateButtonState(elements, {
      message: "Error",
      backgroundColor: "black",
      textColor: "white",
      invertIcons: true,
    });
  }
}

export function updateButtonState(
  elements: ButtonElements,
  state: ButtonState,
): void {
  const {
    button,
    textLabel,
    icon,
    expandButton,
  } = elements;

  textLabel.textContent = state.message;
  button.style.background = state.backgroundColor;
  button.style.color = state.textColor;

  const iconFilter = state.invertIcons
    ? "brightness(0) invert(1)"
    : "";

  icon.style.filter = iconFilter;
  expandButton.style.filter = iconFilter;

  window.setTimeout(() => {
    if (!button.isConnected) return;

    textLabel.textContent = "Running Quests";
    button.style.background = "white";
    button.style.color = "black";
    icon.style.filter = "";
    expandButton.style.filter = "";
  }, 2000);
}
