<img width=100% src="./assets/banner.png" alt="header"/> 

# Discord Web Auto Quest Extension (Reimagined)

<img align="right" src="./assets/icon.png" width=200 alt="Discord Auto Quest Extension logo">

Chromium extension that automatically completes Discord quests. No more manually watching videos or playing games — just click a button and let it run all selected quests at the same time automatically and work for all devices.

<table>
  <thead>
    <tr>
      <th colspan="3">PROJECT HISTORY</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Founder</strong></td>
      <td><a href="https://github.com/aamiaa"><strong>aamiaa</strong></a> 🌸</td>
      <td><a href="https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb">Source (Gist)</a></td>
    </tr>
    <tr>
      <td><strong>Previous Successor</strong></td>
      <td><a href="https://github.com/nvckai"><strong>nvckai</strong></a></td>
      <td><a href="https://github.com/nvckai/Discord-Web-Auto-Quest-Extension">Source (Repo)</a></td>
    </tr>
  </tbody>
</table>

> [!WARNING]  
> **USE THIS EXTENSION AT YOUR OWN RISK!**  
> Before use this Chrome extension, please consider to [read the author notes](#author-notes--support-author) first.

---

## Reimagined Features

- Entirely rewritten in TypeScript while preserving the original extension's core behavior
- Quest processor now supports concurrent processing, allowing multiple quests to run simultaneously
- Improved code logic, error handling, and overall processing reliability
- Expanded and reorganized project structure to separate responsibilities and make future development easier

## What It Does

This extension hooks into Discord's quest system and automatically completes the requirements for all active quests sequentially. It works with:

- Video watching quests (`WATCH_VIDEO`, `WATCH_VIDEO_ON_MOBILE`)
- Desktop game playing (`PLAY_ON_DESKTOP`)
- Desktop streaming (`STREAM_ON_DESKTOP`)
- Activity playing (`PLAY_ACTIVITY`)

The extension spoofs your user-agent to make Discord think you're using the desktop app, which is required for some quest types to work properly. It processes quests sequentially to ensure stability and proper completion, handling each quest's requirements one at a time.

## Installation

The extension can be installed in two ways:

### From GitHub Releases (Recommended)

1. Download the latest release ZIP from the **"Assets"** section
    - [**Go to the latest release**](https://github.com/mitsuki31/Discord-Web-Auto-Quest-Extension/releases/latest)
2. Extract the ZIP file
3. In your Chromium browser, go to `chrome://extensions/`
4. Enable **"Developer mode"**
5. Click **"Load unpacked"** and select the extracted folder

### From Source

> [!NOTE]  
> This method requires Node.js v20+, make sure you've installed it.

1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to generate the extension in the `dist/` directory
4. Load the `dist/` folder as an unpacked extension in Chrome/Edge

## How to Use

1. Go to <https://discord.com/quest-home> in your browser
    - If redirected to Discord app, use this link instead: <https://discord.com/channels/@me>
    - After that, go to **Quests**
2. Accept some quests if you haven't already
3. Look for the **"Run Quests"** button in the bottom right corner with an icon
4. Click it and check the progress quests
5. Expand the panel to see the details (running quests and credits)

The extension will automatically detect all your active quests and start processing them simultaneously.

## Requirements

- Chrome or any Chromium-based browser (Edge, Brave, etc.)
- A Discord account with quests available
- Accepted quests on the `quest-home` page

## How It Works

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

- The console might show warnings about user-agent detection, this is normal
- The extension uses multiple methods to override it, so it should still working

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
> Join Discord ID Server: <https://discord.gg/HbZEEuj4KJ>

> [!IMPORTANT]  
> **April 25, 2026**  
> Extension is now working normally. Thank you~ 💝

> [!CAUTION]  
> **August 26, 2026**  
> Discord has started suspending quest access of people caught automating quest completion.
> Some users have received the following system message:
> 
> <img width="1500" height="272" alt="image" src="https://i.imgur.com/XVvjcvD.png" />
> 
> Use the script at your own risk.

---

## About This Project

**Discord Web Auto Quest Extension (Reimagined)** is a heavily modified continuation of the original [**Discord Web Auto Quest Extension**](https://github.com/nvckai/Discord-Web-Auto-Quest-Extension).

The project was originally created by [**nvckai**](https://github.com/nvckai) and released under
the [GNU General Public License v3.0](./LICENSE).

This version has been substantially rewritten and reworked,
including a TypeScript migration, concurrent quest processing,
improved error handling, and a reorganized project structure.

The original copyright and license notices are retained where
applicable.

> [!WARNING]  
> This is a tool for automating Discord quests. Use at your own risk and be aware of Discord's Terms of Service. I'm not responsible if your account gets flagged or banned.

> [!IMPORTANT]  
> This repository is strictly for educational purposes and security research only. It is designed to demonstrate how web APIs and user-agent spoofing work in a browser environment. Any misuse of this tool is the sole responsibility of the user. The author does not condone any actions that violate third-party Terms of Service.
