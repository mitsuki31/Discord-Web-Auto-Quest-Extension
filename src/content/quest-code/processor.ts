import type {
  ChannelStore,
  DiscordApi,
  GuildChannelStore,
  QuestStores,
  QuestScoreI,
  WebpackRequire,
  QuestStateI,
} from "../../types";
import { findModule } from "../../discord/modules";
import { notifyUI } from "../../shared/messaging";
import { questUrl } from "../../utils";
import { getChannelId } from "./state";

export function loadStores(webpackRequire: WebpackRequire): QuestStores | null {
  try {
    const questsStore = findModule<QuestScoreI>(
      webpackRequire, (value): value is QuestScoreI =>
        typeof value === "object" &&
        value !== null &&
        "getQuest" in value,
    );

    const channelStore = findModule<ChannelStore>(
      webpackRequire, (value): value is ChannelStore =>
        typeof value === "object" &&
        value !== null &&
        "getSortedPrivateChannels" in value,
    );

    const guildChannelStore = findModule<GuildChannelStore>(
      webpackRequire, (value): value is GuildChannelStore =>
        typeof value === "object" &&
        value !== null &&
        "getAllGuilds" in value,
    );

    const apiModule = findModule<Record<string, unknown>>(
      webpackRequire, (value): value is Record<string, unknown> =>
        typeof value === "object" &&
        value !== null &&
        ("Bo" in value || "tn" in value),
    );

    if (!questsStore || !apiModule) return null;

    const api = (
      apiModule.Bo
        ?? apiModule.tn
        ?? apiModule
    ) as DiscordApi;

    if (
      typeof api !== "object"
      || api === null
      || typeof api.post !== "function"
    ) {
      return null;
    }

    return {
      questsStore,
      channelStore: channelStore ?? undefined,
      guildChannelStore: guildChannelStore ?? undefined,
      api: api,
    } satisfies QuestStores;
  } catch (error) {
    console.error(
      "Discord Auto Quest: Failed to load Discord modules.",
      error,
    );

    return null;
  }
}

export async function processVideoStep(
  state: QuestStateI,
  api: DiscordApi,
): Promise<boolean> {
  const { quest, secondsNeeded, currentProgress } = state;

  const nextTime = Math.min(
    secondsNeeded,
    currentProgress + 1 + Math.random(),
  );

  try {
    const response = await api.post({
      url: questUrl("video_progress", quest.id),
      body: { timestamp: nextTime },
    });

    state.currentProgress = nextTime;

    const completed = response.body?.completed_at != null
      || state.currentProgress >= secondsNeeded;

    notifyUI(
      quest,
      Math.floor(state.currentProgress),
      secondsNeeded,
      completed,
    );

    if (!completed) return true;

    state.currentProgress = secondsNeeded;
    state.completed = true;

    await api.post({
      url: questUrl("video_progress", quest.id),
      body: { timestamp: secondsNeeded },
    });

    notifyUI(quest, secondsNeeded, secondsNeeded, true);
    return true;
  } catch (error) {
    console.error(
      `Discord Auto Quest: Video progress failed for ${quest.id}.`,
      error,
    );

    return false;
  }
}

export async function processHeartbeatStep(
  state: QuestStateI,
  stores: QuestStores,
): Promise<boolean> {
  const { api, channelStore, guildChannelStore } = stores;
  const { quest, taskType, secondsNeeded } = state;

  const channelId = getChannelId(
    quest,
    channelStore,
    guildChannelStore,
  );

  const streamKey = `call:${channelId}:1`;

  try {
    const response = await api.post({
      url: questUrl("heartbeat", quest.id),
      body: {
        stream_key: streamKey,
        terminal: false,
      },
    });

    const serverProgress =
      response.body?.progress?.[taskType]?.value ?? 0;

    state.currentProgress = Number(serverProgress);

    const completed =
      state.currentProgress >= secondsNeeded;

    notifyUI(
      quest,
      Math.floor(state.currentProgress),
      secondsNeeded,
      completed,
    );

    if (!completed) return true;

    await api.post({
      url: questUrl("heartbeat", quest.id),
      body: {
        stream_key: streamKey,
        terminal: true,
      },
    });

    state.currentProgress = secondsNeeded;
    state.completed = true;

    notifyUI(
      quest,
      secondsNeeded,
      secondsNeeded,
      true,
    );

    return true;
  } catch (error) {
    console.error(
      `Discord Auto Quest: Heartbeat failed for ${quest.id}.`,
      error,
    );

    return false;
  }
}
