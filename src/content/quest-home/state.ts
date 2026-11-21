import type { ButtonState, QuestListItem } from "../../types";

interface QuestStateData {
  quests: Map<string, QuestListItem>;
  isPanelExpanded: boolean;
  buttonState: ButtonState;
}

type Subscriber = () => void;

class QuestState {
  private data: QuestStateData = {
    quests: new Map(),
    isPanelExpanded: false,
    buttonState: { mode: "idle", message: "" },
  };

  private subscribers = new Set<Subscriber>();

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getState(): Readonly<QuestStateData> {
    return this.data;
  }

  getQuests(): QuestListItem[] {
    return Array.from(this.data.quests.values());
  }

  replaceQuests(quests: QuestListItem[]): void {
    this.data.quests = new Map(quests.map(quest => [quest.id, quest]));
    this.notify();
  }

  upsertQuest(quest: QuestListItem): void {
    this.data.quests.set(quest.id, quest);
    this.notify();
  }

  setPanelExpanded(expanded: boolean): void {
    if (this.data.isPanelExpanded === expanded) return;
    this.data.isPanelExpanded = expanded;
    this.notify();
  }

  setButtonState(mode: ButtonState["mode"], message = ""): void {
    if (
      this.data.buttonState.mode === mode
      && this.data.buttonState.message === message
    ) return;

    this.data.buttonState = { mode, message };
    this.notify();
  }

  get activeCount(): number {
    return this.data.quests.size;
  }

  private notify(): void {
    for (const callback of this.subscribers) {
      callback();
    }
  }
}

export const questState = new QuestState();
