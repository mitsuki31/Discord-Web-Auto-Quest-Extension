export const ELEMENT_IDS = {
  button: "DiscordQuestButton",
  panel: "DiscordQuestPanel",
  questList: "DiscordQuestList",
} as const;

export const STYLES = {
  button: `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    background: white;
    color: black;
    border: none;
    border-radius: 10px;
    padding: 8px 16px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 600;
    width: 180px;
  `,

  icon: `
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  `,

  text: `
    flex: 1;
    text-align: center;
  `,

  expandButton: `
    background: rgba(218, 218, 218, 0.1);
    border: 1px solid #eeeded;
    border-radius: 4px;
    color: black;
    cursor: pointer;
    font-size: 12px;
    padding: 4px;
    margin-left: 4px;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  expandIcon: `
    width: 10px;
    height: 10px;
    display: block;
    pointer-events: none;
  `,

  panel: `
    position: fixed;
    bottom: 65px;
    right: 20px;
    z-index: 9999;
    background: black;
    color: white;
    border-radius: 10px;
    padding: 16px;
    width: 250px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `,

  questList: `
    margin-bottom: 5px;
    max-height: 200px;
    overflow-y: auto;
  `,

  questItem: `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
  `,

  questName: `
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
    color: #eee;
  `,

  questProgress: `
    flex-shrink: 0;
    font-family: monospace;
    color: #aaa;
    font-size: 12px;
  `,

  panelTitle: `
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: bold;
    border-top: 1px solid #333;
    padding-top: 12px;
  `,

  credit: `
    margin: 0;
    font-size: 14px;
    color: #ccc;
  `,
} as const;
