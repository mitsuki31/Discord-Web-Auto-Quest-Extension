import type { NewWindowI } from "../types";

chrome.runtime.onInstalled.addListener(() => {
  console.info("Discord Auto Quest extension installed");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const manifest = chrome.runtime.getManifest();

  // :: getVersion
  if (request.action === "getVersion") {
    sendResponse({ version: manifest.version });
    return true;  // Success
  }

  // :: executeQuestCode
  if (request.action === "executeQuestCode") {
    if (sender.tab?.id != null) {
      const tabId = sender.tab.id;

      chrome.scripting.executeScript({
        target: { tabId },
        func: function (version) {
          (window as NewWindowI).__QUEST_VERSION = version;
        },
        args: [manifest.version],
        world: "MAIN"
      })
        .then(function () {
          return chrome.scripting.executeScript({
            target: { tabId },
            files: ["quest-code.js"],
            world: "MAIN"
          });
        })
        .then(function () {
          sendResponse({ success: true });
        })
        .catch(function (error) {
          console.error("Error injecting quest code:", error);
          sendResponse({ success: false, error: error.message });
        })
      ;
    } else {
      console.error("No tab ID found:", sender);
      sendResponse({ success: false, error: "No tab ID found" });

      return false;  // Error
    }
  }

  return true;  // Success
});
