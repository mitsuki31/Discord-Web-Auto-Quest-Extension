export const GH_REPO_URL = "https://github.com/nvckai/Discord-Web-Auto-Quest-Extension";

/** Electron User-Agent */
export const ELECTRON_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Discord/1.0.0 Chrome/120.0.0.0 Electron/28.0.0 Safari/537.36';

export const QUEST_CHECK_INTERVAL = 100;
export const QUEST_MAX_ATTEMPTS = 100;
// Endpoint URLs
export const QUEST_VPROGRESS_URL = "/quests/{ID}/video-progress";  // replace the {ID}
export const QUEST_HEARTBEAT_URL = "/quests/{ID}/heartbeat";       // replace the {ID}

export const QUEST_HOME_PATH = "/quest-home";
export const QUEST_ICON_URL = "https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d8014ea898f3a4b2156c_Symbol.svg";

export const EXPAND_ICON_URL = "https://pic.onlinewebfonts.com/thumbnails/icons_378683.svg";

export const SUPPORTED_TASKS = [
  "WATCH_VIDEO",
  "PLAY_ON_DESKTOP",
  "STREAM_ON_DESKTOP",
  "PLAY_ACTIVITY",
  "WATCH_VIDEO_ON_MOBILE"
] as const;
