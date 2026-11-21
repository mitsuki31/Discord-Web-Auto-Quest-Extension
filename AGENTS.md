# AGENTS.md

This file provides guidance for AI agents working with the Discord Web Auto Quest Extension codebase.

## Project Overview

**Discord Web Auto Quest Extension (Reimagined)** — Manifest V3 browser extension (Chromium/Firefox) that automates Discord quest completion. Injects code into Discord's web client, hooks internal webpack modules, spoofs User-Agent to mimic Discord desktop client, processes quests concurrently.

**Key capabilities:**
- Video watching quests (`WATCH_VIDEO`, `WATCH_VIDEO_ON_MOBILE`)
- Desktop game playing (`PLAY_ON_DESKTOP`)
- Desktop streaming (`STREAM_ON_DESKTOP`)
- Activity playing (`PLAY_ACTIVITY`)

## Architecture

### Source Structure

```
src/
├── background/           # Service worker (background.js)
│   └── index.ts          # Message handling, quest-code injection via chrome.scripting
├── content/
│   ├── quest-home/       # UI on quest-home page (quest-home.js)
│   │   ├── button.ts     # "Run Quests" button creation & click handling
│   │   ├── panel.ts      # Expandable quest progress panel
│   │   ├── lifecycle.ts  # Initialization, cleanup, route watching
│   │   ├── route-watcher.ts  # SPA navigation detection
│   │   ├── messages.ts   # postMessage bridge from quest-code
│   │   ├── quest.ts      # Quest list item UI updates
│   │   ├── state.ts      # In-memory quest state cache
│   │   ├── dom.ts        # DOM helpers
│   │   ├── constants.ts  # Element and stylesheet IDs
│   │   ├── styles.ts     # Runtime-injected, prefixed UI stylesheet
│   │   └── navigation.ts # URL checks
│   └── quest-code/       # Injected into MAIN world (quest-code.js)
│       ├── runner.ts     # Entry point, parallel quest orchestration
│       ├── processor.ts  # Video/heartbeat API calls, progress tracking
│       └── state.ts      # Quest filtering, channel resolution, state init
├── discord/
│   ├── modules.ts        # Webpack module finder (findModule)
│   └── webpack.ts        # Extracts webpackRequire from Discord
├── shared/
│   └── messaging.ts      # postMessage bridge quest-code ↔ quest-home
├── userscript/           # Runs at document_start in MAIN world
│   ├── user-agent-override.ts  # Overrides navigator.userAgent/platform
│   └── user-agent-check.ts     # Duplicate (kept for compatibility)
├── constants.ts          # Shared constants (User-Agent, endpoints, SUPPORTED_TASKS)
├── types.ts              # All TypeScript interfaces
└── utils.ts              # sleep(), questUrl() helpers
```

### Build Outputs (`dist/`)

| File | Format | Purpose |
|------|--------|---------|
| `background.js` | ESM | Service worker |
| `quest-home.js` | IIFE | Content script on quest pages |
| `quest-code.js` | IIFE | Injected into MAIN world via `chrome.scripting` |
| `user-agent-override.js` | IIFE | Runs at `document_start` in MAIN world |
| `manifest.json` | JSON | Browser-specific (Chrome/Firefox) |
| `rules.json` | JSON | Declarative Net Request rules |

### Data Flow

1. **User visits `discord.com/quest-home`** → `quest-home.js` loads, creates "Run Quests" button
2. **User clicks button** → `background.js` receives `executeQuestCode` message
3. **Background injects `quest-code.js`** into the tab's MAIN world via `chrome.scripting.executeScript`
4. **`quest-code.js` waits for Discord's webpack runtime**, extracts `webpackRequire`
5. **Finds Discord internal modules** (`QuestsStore`, `ChannelStore`, `GuildChannelStore`, API module)
6. **Filters active, uncompleted, supported quests** → initializes `QuestStateI[]`
7. **Runs all quests in parallel** via `Promise.all` → each quest loops calling API until complete
8. **Progress updates (including task type) sent via `window.postMessage`** → received by `quest-home.js` → updates UI panel

## Development Commands

```bash
# Type checking
npm run typecheck           # One-off
npm run typecheck:watch     # Watch mode

# Development builds (sourcemaps, no minify)
npm run build               # Build all entry points
npm run build:watch         # Watch mode rebuild

# Production builds (minified, no sourcemaps)
npm run build:prod          # Both browsers
npm run build:chrome:prod   # Chrome only
npm run build:firefox:prod  # Firefox only

# Manifest generation (run after build)
npm run build:manifest -- --use chrome [--minify]
npm run build:manifest -- --use firefox [--minify]

# Packaging (creates ZIP in dist/)
npm run package             # Standard (with base directory) — for Chromium
npm run package:flat        # Flat (contents at ZIP root) — for Firefox
```

**Production workflow:**
```bash
# Chromium (Chrome, Edge, Brave, etc.) — unflattened ZIP for folder import
npm run build:chrome:prod && npm run package

# Firefox (Zen Browser, etc.) — flat ZIP for direct .zip install
npm run build:firefox:prod && npm run package:flat
```

## Testing & Debugging

There's no unit tests implemented and will NEVER be implemented.

DO NOT and not need to implement a unit test.

DO NOT TRY to debugging this project in your own as AI agent, that will be clearly flagged as automated actions and have possibility to suspending the user Discord account.

## Key Technical Details

### Webpack Module Extraction (`src/discord/webpack.ts`)
`webpackChunkdiscord_app.push([[], {}, require => require])` → obtain `webpackRequire` → pop chunk → validate module count > 10.

### Module Finding (`src/discord/modules.ts`)
Iterate `webpackRequire.c`, check exports at `A`, `Ay`, `ZP`, root, apply type guard filters.

### Quest Processing (`src/content/quest-code/`)
- **Video**: POST `/quests/{id}/video-progress` with incremental timestamps
- **Heartbeat** (play/stream): POST `/quests/{id}/heartbeat` with `stream_key`, poll server progress
- **Retry**: Up to `QUEST_MAX_ATTEMPTS` (100) with `QUEST_CHECK_INTERVAL` (100ms) delay
- **Parallel**: `Promise.all` over all active quests
- **Progress target**: `QuestStateI.secondsNeeded` comes from `taskData.target` and is both the processor's completion target and the panel's progress denominator. It is not a reliable video-runtime or completion-time estimate; do not change it merely to alter presentation.

### User-Agent Spoofing (`src/userscript/user-agent-override.ts`)
Runs at `document_start` in MAIN world. `Object.defineProperty` on `navigator.userAgent` and `navigator.platform` → Electron-like UA string.

### About Merged Manifest V3

Since the manifest file is a merged version of Chromium Manifest V3 and Firefox Manifest V3, the parsed manifest file will be difference for both builds.

| Field | Chrome | Firefox |
|-------|--------|---------|
| `background` | `service_worker` | `scripts` array |
| `browser_specific_settings` | Dropped | Kept (gecko ID) |
| `version_name` | Dropped | Kept |

`scripts/build-manifest.ts` strips incompatible fields, replaces specific placeholders.

**Currently supported placeholders:**

| Name | Replace Value |
|------|---------------|
| `{name}` | `"Discord Web Auto Quest (Reimagined)"` |
| `{version}` | `version` value from `package.json` |
| `{description}` | `description` value from `package.json` |
| `{homepage_url}` | `homepage` value from `package.json` |

## Important Files

| File | Purpose |
|------|---------|
| `scripts/build.ts` | ESBuild config, 4 entry points |
| `scripts/build-manifest.ts` | Manifest parser, placeholder replacement, browser-specific field removal |
| `scripts/create-zip.ts` | Production ZIP creation (dist + LICENSE + PRIVACY.md) |
| `public/manifest.json` | Source manifest with placeholders & both browser fields |
| `src/constants.ts` | Central constants (User-Agent, endpoints, `SUPPORTED_TASKS`) |
| `src/types.ts` | All TypeScript interfaces (Discord internals, messages, state) |

## Common Development Tasks

### Add New Quest Type
1. Add to `SUPPORTED_TASKS` in `src/constants.ts`
2. Add processing logic in `src/content/quest-code/processor.ts`
3. Update `QuestI` config type in `src/types.ts` if needed
4. Run `npm run typecheck`

### Modify UI
- Button/panel: `src/content/quest-home/button.ts`, `panel.ts`
- Styles: `src/content/quest-home/styles.ts` (single runtime-injected stylesheet)
- Quest list rendering: `src/content/quest-home/quest.ts`
- The panel is non-modal: keep its two native sibling controls independent, preserve Escape/outside-pointer cleanup, and do not add a focus trap.

## CI/CD

`.github/workflows/release.yml` triggers on published GitHub releases:
1. Checkout, Node 24, `npm ci`
2. `.github/scripts/build.sh --minify` (builds both browsers, packages)
3. Validates exactly 2 ZIP files (`-chrome.min.zip`, `-firefox.min.zip`)
4. Uploads to release assets

## Gotchas

- **Firefox**: Requires `package:flat` and `xpinstall.signatures.required = false` in `about:config` for unsigned installs
- **Discord internals change frequently** — `modules.ts` may need updates when Discord updates
- **Account risk**: Discord has suspended accounts for quest automation
- **TypeScript strict**: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` enabled
- **ESM in background**: `background.js` uses `format: "esm"`; content scripts use IIFE
- **No unit test runner** — only Playwright E2E tests configured

## License

GPL-3.0-only — see `LICENSE` file.
