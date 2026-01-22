import type { LintResultMessage } from "@/features/textlint/types";
import { extractPresetName } from "./types";
import { PresetSettingsManager } from "./settings";

/**
 * プリセット設定に基づいてlint結果をフィルタリングする関数
 */
export function filterMessages(
  messages: LintResultMessage[],
): LintResultMessage[] {
  const settings = PresetSettingsManager.getInstance().getCurrent();

  return messages.filter((message) => {
    const presetName = extractPresetName(message.ruleId);

    // プリセットが判別できない場合は表示する（安全側に倒す）
    if (!presetName) return true;

    // プリセットが有効な場合のみ表示
    return settings[presetName] !== false;
  });
}
