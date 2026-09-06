import { ELEMENT_IDS } from "./constants";

export function getQuestButton(): HTMLButtonElement | null {
  const element = document.getElementById(ELEMENT_IDS.button);

  return element instanceof HTMLButtonElement
    ? element
    : null;
}

export function getQuestPanel(): HTMLDivElement | null {
  const element = document.getElementById(ELEMENT_IDS.panel);

  return element instanceof HTMLDivElement
    ? element
    : null;
}

export function getQuestListContainer(): HTMLDivElement | null {
  const element = document.getElementById(
    ELEMENT_IDS.questList,
  );

  return element instanceof HTMLDivElement
    ? element
    : null;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  style?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  if (style) element.style.cssText = style;

  return element;
}
