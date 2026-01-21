import { observeQuerySelector } from "@/utils/observe-query-selector";
import { TextlintWorker } from "./worker";
import { HighlightManager } from "@/utils/highlight-manager";
import { LintExecutor } from "@/utils/lint-executor";
import { ElementWatcher } from "@/utils/element-watcher";
import "./style.css";

export default defineContentScript({
  matches: ["https://*.backlog.com/*", "https://*.backlog.jp/*"],
  allFrames: true,
  async main() {
    const { textlintWorkerUrl } = useAppConfig();
    const textlint = new TextlintWorker(textlintWorkerUrl);

    await textlint.load();

    // ハイライト管理とLint実行のインスタンスを作成
    const highlightManager = new HighlightManager("textlint-error", 100);
    const lintExecutor = new LintExecutor(textlint);

    // 要素の監視を開始
    observeQuerySelector('[contenteditable="true"] > p', (el) => {
      const id = crypto.randomUUID();
      const watcher = new ElementWatcher(
        el,
        id,
        lintExecutor,
        highlightManager,
      );

      watcher.start();

      return () => {
        watcher.stop();
      };
    });
  },
});
