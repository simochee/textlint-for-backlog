import type { TextlintWorker } from "@/entrypoints/content/worker";
import type { LintResultMessage } from "@/types/textlint";
import { createRangeFromTextOffset } from "./create-range-from-text-offset";

/**
 * Lint実行とRange生成を担当するクラス
 */
export class LintExecutor {
  constructor(private textlint: TextlintWorker) {}

  /**
   * 指定された要素に対してlintを実行し、エラー箇所のRangeを生成する
   *
   * @param id - 要素の一意なID
   * @param element - lint対象のDOM要素
   * @returns エラー箇所を示すRangeの配列
   */
  public async execute(id: string, element: HTMLElement): Promise<Range[]> {
    try {
      const results = await this.textlint.lint(id, element.innerText);
      return this.createRangesFromResults(element, results);
    } catch (error) {
      console.error(`[LintExecutor] Lint failed for element ${id}:`, error);
      return [];
    }
  }

  /**
   * lint結果からRangeの配列を生成する
   *
   * @param element - 対象のDOM要素
   * @param results - lint結果のメッセージ配列
   * @returns エラー箇所を示すRangeの配列
   */
  private createRangesFromResults(
    element: HTMLElement,
    results: LintResultMessage[],
  ): Range[] {
    return results
      .map((result) => {
        try {
          return createRangeFromTextOffset(
            element,
            result.range[0],
            result.range[1],
          );
        } catch (error) {
          console.warn(
            `[LintExecutor] Failed to create range for result:`,
            result,
            error,
          );
          return null;
        }
      })
      .filter((range): range is Range => range !== null);
  }
}
