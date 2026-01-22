import type { LintResultMessage } from "@/types/textlint";
import { PresetSettings } from "./preset-settings";

/**
 * プリセット設定に基づいてlint結果をフィルタリングするクラス
 */
export class PresetFilter {
  private presetSettings = new PresetSettings();

  /**
   * ruleIdからプリセット名を抽出する
   * 例: "preset-ja-technical-writing/no-exclamation-question-mark" -> "ja-technical-writing"
   */
  private extractPresetName(ruleId: string): string | null {
    const match = ruleId.match(/^([^/]+)/);
    return match ? match[1] : null;
  }

  /**
   * プリセット設定に基づいてエラーをフィルタリングする
   */
  async filter(messages: LintResultMessage[]): Promise<LintResultMessage[]> {
    const settings = await this.presetSettings.load();

    return messages.filter((message) => {
      const presetName = this.extractPresetName(message.ruleId);

      console.log(presetName, message.ruleId);

      // プリセットが判別できない場合は表示する(安全側に倒す)
      if (!presetName) {
        return true;
      }

      // プリセットが無効化されている場合はフィルタリング
      return settings[presetName] !== false;
    });
  }
}
