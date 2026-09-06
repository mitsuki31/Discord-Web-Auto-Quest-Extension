import { waitForWebpack } from "../discord/webpack";
import { runQuestCode } from "./quest-code/runner";

(async function () {
  const webpack = await waitForWebpack();
  if (!webpack) return;

  await runQuestCode(webpack);
})();
