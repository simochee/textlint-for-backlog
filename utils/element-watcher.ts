import type { LintExecutor } from "./lint-executor";
import type { HighlightManager } from "./highlight-manager";

/**
 * 要素の変更を監視し、テキスト変更時にlintを実行するクラス
 */
export class ElementWatcher {
  private observer: MutationObserver;
  private previousText: string;

  /**
   * @param element - 監視対象の要素
   * @param id - 要素の一意なID
   * @param lintExecutor - Lint実行を担当するインスタンス
   * @param highlightManager - ハイライト管理を担当するインスタンス
   */
  constructor(
    private element: HTMLElement,
    private id: string,
    private lintExecutor: LintExecutor,
    private highlightManager: HighlightManager,
  ) {
    this.previousText = element.innerText;
    this.observer = this.createObserver();
  }

  /**
   * 監視を開始する
   */
  public start(): void {
    this.observer.observe(this.element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // 初回のlint実行
    void this.runLint();
  }

  /**
   * 監視を停止し、リソースをクリーンアップする
   */
  public stop(): void {
    this.observer.disconnect();
    this.highlightManager.deleteRanges(this.id);
  }

  /**
   * MutationObserverを作成する
   */
  private createObserver(): MutationObserver {
    return new MutationObserver(async () => {
      const currentText = this.element.innerText;
      if (this.previousText !== currentText) {
        this.previousText = currentText;
        await this.runLint();
      }
    });
  }

  /**
   * Lintを実行してハイライトを更新する
   */
  private async runLint(): Promise<void> {
    const ranges = await this.lintExecutor.execute(this.id, this.element);
    this.highlightManager.setRanges(this.id, ranges);
  }
}
