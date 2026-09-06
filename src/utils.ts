import { QUEST_HEARTBEAT_URL, QUEST_VPROGRESS_URL } from "./constants";

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


type QuestUrlType = "video_progress" | "heartbeat"

export function questUrl(type: QuestUrlType, id: string): string {
  let url: string | undefined;
  switch (type) {
    case "video_progress": url = QUEST_VPROGRESS_URL; break;
    case "heartbeat": url = QUEST_HEARTBEAT_URL; break;
    default: throw Error(`Value error for type: ${type}`);
  }

  return url.replace("{ID}", id);
}
