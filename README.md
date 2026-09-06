<img width=100% src="./assets/banner.png" alt="header"/> 

# Discord Web Auto Quest Extension (Rewrite)

<img align="right" src="./assets/icon.png" width=200 alt="Discord Auto Quest Extension logo">

Extension that automatically completes Discord quests. No more manually watching videos or playing games - just click a button and let it run quests one by one automatically and work for all devices.

This project is a complete rewrite of the codebase into TypeScript while maintaining the original behavior.

Original Source from [**aamiaa**](https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb)  🌸

## What it does

This extension hooks into Discord's quest system and automatically completes the requirements for all active quests sequentially. It works with:

- Video watching quests (`WATCH_VIDEO`, `WATCH_VIDEO_ON_MOBILE`)
- Desktop game playing (`PLAY_ON_DESKTOP`)
- Desktop streaming (`STREAM_ON_DESKTOP`)
- Activity playing (`PLAY_ACTIVITY`)

The extension spoofs your user-agent to make Discord think you're using the desktop app, which is required for some quest types to work properly. It processes quests sequentially to ensure stability and proper completion, handling each quest's requirements one at a time.

## Installation

> [!NOTE]  
> If you want a simple one, install it from [**Chrome Web Store**](https://chromewebstore.google.com/detail/discord-web-auto-quest-ex/dmldiapigcibgkdohbdhojhipgcgcmhl) instead.
>
> It was published by the author themselves and the code are not optimized unlike this project.

The extension can be installed in two ways:

### From GitHub Releases (Recommended)

1. Download the latest release ZIP from the "Assets" section
2. Extract the ZIP file
3. In Chrome/Edge, go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder

### From Source

> [!NOTE]  
> This method requires Node.js and npm, make sure you've installed it.

1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to generate the extension in the `dist/` directory
4. Load the `dist/` folder as an unpacked extension in Chrome/Edge

## How to use

1. Go to <https://discord.com/quest-home> in your browser
    - If redirected to Discord app, use this link instead: <https://discord.com/channels/@me>
    - After that, go to **Quests**
2. Accept some quests if you haven't already
3. Look for the **"Run Quests"** button in the bottom right corner with an icon
4. Click it and check the progress quests
5. Expand the panel to see the details (running quests and credits)

The extension will automatically detect all your active quests and start completing them one by one.

## Requirements

- Chrome or any Chromium-based browser (Edge, Brave, etc.)
- A Discord account with quests available
- Accepted quests on the `quest-home` page

## How it works

The extension uses advanced techniques:

- **User-Agent override**: Modifies HTTP headers and navigator properties to mimic Discord desktop
- **Webpack module injection**: Hooks into Discord's internal stores (`QuestsStore`, `RunningGameStore`, etc.)
- **Sequest processing**: Handles quests sequentially to ensure stability, completing each quest's requirements before moving to the next
- **API spoofing**: Intercepts quest progress updates and sends fake data
- **Smart detection**: Filters quests by expiration and completion status

For streaming quests, you still need at least one other person in the voice channel - the extension can't fake that part.

## Mobile Version Supported (Android)

To use this extension on Android:

1. **Download this Extension** - Get the ZIP file from the latest release
2. **Download Lemur Browser** - [Get it on Google Play](https://play.google.com/store/apps/details?id=com.lemurbrowser.exts)
3. **Open Lemur Browser** and tap the **4 Squares Icon** (on the right side) → select **"Extensions"**
4. **Enable Developer mode**, then tap **`+ (from .zip/crx/.user.js)`** and upload the extension file you downloaded
5. **Open the Discord Quests Page**: [Quest](https://discord.com/quest-home)
   - Accept at least one quest
   - Select **"Playing on Desktop"**
   - Then **REFRESH** the page
6. A **`Running Quests`** button should appear - tap it and you're all set!
   - If the button doesn't appear, try refreshing the quest page again

> **Notes**: This setup is optimized for mobile via Lemur Browser because of its Chrome extension support.

---

## Troubleshooting

### Button doesn't appear

- Make sure you're on `discord.com/quest-home`
- Refresh the page
- Check that the extension is enabled in `chrome://extensions/`

### Quest not completing

- Open the console (F12) and check for error messages
- Make sure you've accepted the quests first
- Some quest types work better in the actual Discord desktop app
- Try refreshing and running the code again

### User-Agent warnings

- The console might show warnings about user-agent detection - this is normal
- The extension uses multiple methods to override it, so it should still work

## Technical Details

- **Manifest Version**: V3
- **Build Tool**: ESBuild with TypeScript support
- **Bundling**: All source files bundled into single IIFE modules
- **Target Browser**: Chrome 120+ (manifest target)
- **File Size**: Optimized production builds with no source maps (&lt;500kB)

## Development Scripts

- `npm run typecheck` - TypeScript type checking
- `npm run build` - Build extension for development
- `npm run build:watch` - Watch mode for development
- `npm run build:prod` - Production build
- `npm run package` - Create production-ready ZIP archive
  - This script is automatically called by the GitHub workflow when releases are published

---

## Author Notes & Support Author

> [!NOTE]  
> Join Discord ID Server Support: https://discord.gg/HbZEEuj4KJ

> [!IMPORTANT]  
> **April 25, 2026**  
> Extension is now working normally. Thank you~ 💝

> [!CAUTION]  
> As of April 7, 2026, Discord has expressed their intent to crack down on automating quest completion.
> Some users have received the following system message:
> 
> <img width="836" height="272" alt="image" src="https://i.postimg.cc/1XqDrjc1/quest.webp" />
> 
> Use the script at your own risk.

---

> [!WARNING]
> This is a tool for automating Discord quests. Use at your own risk and be aware of Discord's Terms of Service. I'm not responsible if your account gets flagged or banned.

> [!IMPORTANT]
> This repository is strictly for educational purposes and security research only. It is designed to demonstrate how web APIs and user-agent spoofing work in a browser environment. Any misuse of this tool is the sole responsibility of the user. The author does not condone any actions that violate third-party Terms of Service.

