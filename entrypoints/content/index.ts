import { observeQuerySelector } from "@/lib/dom/observe-query-selector";
import { TextlintWorker } from "@/features/textlint/worker";
import { HighlightManager } from "@/lib/ui/highlight-manager";
import { LintExecutor } from "@/features/textlint/executor";
import { ElementWatcher } from "@/lib/ui/element-watcher";
import { ErrorIconManager } from "@/lib/ui/error-icon/manager";
import { PresetSettingsManager } from "@/features/preset/settings";
import "./global.css";

export default defineContentScript({
  matches: ["https://*.backlog.com/*", "https://*.backlog.jp/*"],
  allFrames: true,
  async main() {
    const { textlintWorkerUrl } = useAppConfig();
    const textlint = new TextlintWorker(textlintWorkerUrl);

    // プリセット設定を初期化
    const settingsManager = PresetSettingsManager.getInstance();
    await settingsManager.load();

    await textlint.load();

    // ハイライト管理とLint実行のインスタンスを作成
    const highlightManager = new HighlightManager("textlint-error", 100);
    const lintExecutor = new LintExecutor(textlint);
    const errorIconManager = new ErrorIconManager();

    // アクティブな要素ウォッチャーを保存
    const activeWatchers = new Map<string, ElementWatcher>();

    // プリセット設定変更時に全要素を再チェック
    settingsManager.addListener(() => {
      activeWatchers.forEach((watcher) => watcher.rerun());
    });

    // 要素の監視を開始
    observeQuerySelector('[contenteditable="true"] > p', (el) => {
      const id = crypto.randomUUID();
      const watcher = new ElementWatcher(
        el,
        id,
        lintExecutor,
        highlightManager,
        errorIconManager,
      );

      watcher.start();
      activeWatchers.set(id, watcher);

      return () => {
        watcher.stop();
        activeWatchers.delete(id);
      };
    });
  },
});
