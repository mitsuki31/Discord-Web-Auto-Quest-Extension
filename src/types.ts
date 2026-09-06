export type NewWindowI = typeof window & {
	$?: Record<string, any> | undefined;
	__QUEST_VERSION?: string | undefined;
	webpackChunkdiscord_app?: WebpackChunk | undefined;
};

export type TaskType = typeof import("./constants").SUPPORTED_TASKS[number];

export type ModuleFilter<T> = (exports: unknown) => exports is T;

export interface DiscordApi {
  post: (options: { url: string; body?: unknown; }) => Promise<DiscordApiResponse>;
}

export interface DiscordApiResponse {
  body?: {
    completed_at?: string | null;
    progress?: Record<string, { value?: number } | undefined>;
  };
}

export interface QuestScoreI {
	quests: Map<string, QuestI>;
}

export interface QuestStateI {
  quest: QuestI;
  taskType: TaskType;
  secondsNeeded: number;
  currentProgress: number;
  completed: boolean;
  enrolledAt: number;
  questName: string;
}

export interface QuestI {
	id: string;
	config: {
		expiresAt: Date;
		messages: {
			questName: string;
		};
		taskConfig?: {
			tasks: Record<TaskType, any>;

			[props: PropertyKey]: unknown;
		}
		taskConfigV2?: {
			tasks: Record<TaskType, string>;

			[props: PropertyKey]: unknown;
		}

		[props: PropertyKey]: unknown;
	};
	userStatus?: {
		// We do not know what exactly type for these
		completedAt: Date | string;
		enrolledAt: Date | string;
		progress: Record<string, any>;

		[props: PropertyKey]: unknown;
	}
}


export interface Channel {
  id: string;
}

export interface ChannelStore {
  getSortedPrivateChannels: () => Channel[];
}

export interface GuildVoiceChannel {
  channel: Channel;
}

export interface Guild {
  VOCAL?: GuildVoiceChannel[];
}

export interface GuildChannelStore {
  getAllGuilds: () => Record<string, Guild>;
}

export interface QuestStores {
  questsStore: QuestScoreI;
  channelStore?: ChannelStore | undefined;
  guildChannelStore?: GuildChannelStore | undefined;
  api: DiscordApi;
}

export interface WebpackRequire {
	c: Record<string, WebpackModule>;

	[props: PropertyKey]: unknown;
}

export interface WebpackChunk {
	push: (
		chunk: [unknown[], Record<string, unknown>, (require: unknown) => unknown]
	) => WebpackRequire;
	pop: (index?: number | undefined) => unknown;
}

export interface WebpackModule {
  exports?: unknown;
}


// ================================
// QUEST HOME
// ================================

export type SupportedQuestMessage =
  | QuestListMessage
  | QuestUpdateMessage;

export interface ButtonElements {
  button: HTMLButtonElement;
  icon: HTMLImageElement;
  textLabel: HTMLSpanElement;
  expandButton: HTMLButtonElement;
}

export interface ButtonState {
  message: string;
  backgroundColor: string;
  textColor: string;
  invertIcons?: boolean;
}

export interface QuestListItem {
  id: string;
  name: string;
  progress: number;
  target: number;
  completed: boolean;
}

export interface QuestUpdateMessage {
  id: string;
  name: string;
  progress: number;
  target: number;
  completed: boolean;
}

export interface QuestMessage {
  prefix: "DISCORD_QUEST_COMPLETER";
  type: "QUEST_LIST" | "QUEST_UPDATE";
  data: unknown;
}

export interface QuestListMessage extends QuestMessage {
  type: "QUEST_LIST";
  data: QuestListItem[];
}

export interface QuestUpdateMessage extends QuestMessage {
  type: "QUEST_UPDATE";
  data: QuestUpdateMessage;
}
