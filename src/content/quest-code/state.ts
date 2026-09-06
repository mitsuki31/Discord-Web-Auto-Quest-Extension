import { SUPPORTED_TASKS } from "../../constants";
import type {
  ChannelStore,
  GuildChannelStore,
  QuestScoreI,
  QuestI,
  QuestStateI,
} from "../../types";

export function getActiveQuests(questsStore: QuestScoreI): QuestI[] {
  return [...questsStore.quests.values()].filter(quest => {
    const { config, userStatus } = quest;

    const isExpired = new Date(config.expiresAt).getTime() <= Date.now();

    const isCompleted = userStatus?.completedAt != null;
    const isEnrolled = userStatus?.enrolledAt != null;

    const taskConfig = config.taskConfig ?? config.taskConfigV2;
    if (!taskConfig) return false;

    const hasSupportedTask = SUPPORTED_TASKS.some(
      type => taskConfig.tasks[type] != null,
    );

    return (
      isEnrolled
        && !isCompleted
        && !isExpired
        && hasSupportedTask
    );
  });
}

export function getChannelId(
  quest: QuestI,
  channelStore?: ChannelStore,
  guildChannelStore?: GuildChannelStore,
): string {
  const privateChannel = channelStore?.getSortedPrivateChannels()?.[0];

  if (privateChannel?.id) {
    return privateChannel.id;
  }

  if (guildChannelStore) {
    const guilds = Object.values(
      guildChannelStore.getAllGuilds(),
    );

    for (const guild of guilds) {
      const voiceChannel = guild.VOCAL?.[0]?.channel;
      if (voiceChannel?.id) return voiceChannel.id;
    }
  }

  return quest.id;
}


export function initializeQuestState(quest: QuestI): QuestStateI {
  const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
  if (!taskConfig) {
    throw new Error(`Quest ${quest.id} has no task configuration.`);
  }

  const taskType = SUPPORTED_TASKS.find(
    type => taskConfig.tasks[type] != null,
  );

  if (!taskType) {
    throw new Error(`Quest ${quest.id} has no supported task.`);
  }

  const taskData = taskConfig.tasks[taskType];
  const secondsNeeded = Number(taskData?.target ?? 0);
  const currentProgress = Number(
    quest.userStatus?.progress?.[taskType]?.value
      ?? quest.userStatus?.streamProgressSeconds
      ?? 0,
  );

  return {
    quest,
    taskType,
    secondsNeeded,
    currentProgress,
    completed: currentProgress >= secondsNeeded,
    enrolledAt: new Date(
      quest.userStatus?.enrolledAt ?? Date.now(),
    ).getTime(),
    questName: quest.config.messages.questName,
  } satisfies QuestStateI;
}
