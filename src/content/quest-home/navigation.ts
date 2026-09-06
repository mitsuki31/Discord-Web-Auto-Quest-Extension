import { QUEST_HOME_PATH } from "../../constants";

export function isQuestHome(): boolean {
  return window.location.pathname === QUEST_HOME_PATH;
}
