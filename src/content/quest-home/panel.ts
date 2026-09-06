import { GH_REPO_URL } from "../../constants";
import { ELEMENT_IDS, STYLES } from "./constants";
import { createElement, getQuestPanel } from "./dom";
import { isQuestHome } from "./navigation";
import { updateQuestItemUI } from "./quest";
import {
  questStateCache,
  isPanelExpanded,
  expandButtonReference,
  setIsPanelExpanded
} from "./state";

export function createExpandedPanel(): void {
  if (!isQuestHome()) return;
  if (getQuestPanel()) return;

  const panel = createElement("div", STYLES.panel);
  panel.id = ELEMENT_IDS.panel;

  const questListContainer = createElement("div", STYLES.questList);
  questListContainer.id = ELEMENT_IDS.questList;

  for (const quest of questStateCache.values()) {
    updateQuestItemUI(questListContainer, quest);
  }

  panel.appendChild(questListContainer);

  const title = createElement("h3", STYLES.panelTitle);
  title.textContent = "Discord ID | Auto Quest";

  panel.appendChild(title);

  const credit = createElement("p", STYLES.credit);
  credit.append("Credits by ");

  const authorLink = createElement("a");
  authorLink.href = GH_REPO_URL;

  authorLink.target = "_blank";
  authorLink.rel = "noopener noreferrer";
  authorLink.style.cssText = "color: #fff; font-weight: bold; text-decoration: none;";
  authorLink.textContent = "6Together9";

  credit.appendChild(authorLink);
  panel.appendChild(credit);

  document.body.appendChild(panel);
}

export function togglePanel(): void {
  setIsPanelExpanded(!isPanelExpanded);

  if (expandButtonReference) {
    expandButtonReference.style.transform = isPanelExpanded
      ? "rotate(180deg)"
      : "rotate(0deg)";
  }

  if (isPanelExpanded) {
    createExpandedPanel();
    return;
  }

  getQuestPanel()?.remove();
}
