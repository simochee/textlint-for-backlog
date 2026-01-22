import * as v from "valibot";

/**
 * 利用可能なプリセット名の定義
 */
export const PRESETS = {
  JA_TECHNICAL_WRITING: "ja-technical-writing",
  JA_SPACING: "ja-spacing",
  JAPANESE: "japanese",
} as const;

/**
 * プリセット名の型
 */
export type PresetName = (typeof PRESETS)[keyof typeof PRESETS];

/**
 * プリセット設定のスキーマ
 */
export const PresetSettingsSchema = v.record(v.string(), v.boolean());

/**
 * プリセット設定の型
 */
export type PresetSettings = v.InferOutput<typeof PresetSettingsSchema>;

/**
 * デフォルトのプリセット設定（すべて有効）
 */
export const DEFAULT_PRESET_SETTINGS: PresetSettings = {
  [PRESETS.JA_TECHNICAL_WRITING]: true,
  [PRESETS.JA_SPACING]: true,
  [PRESETS.JAPANESE]: true,
};

/**
 * プリセット表示名のマップ
 */
export const PRESET_LABELS: Record<PresetName, string> = {
  [PRESETS.JA_TECHNICAL_WRITING]: "技術文書向けルール (ja-technical-writing)",
  [PRESETS.JA_SPACING]: "日本語スペーシングルール (ja-spacing)",
  [PRESETS.JAPANESE]: "日本語ルール (japanese)",
};

/**
 * ruleIdからプリセット名を抽出
 * @example "preset-ja-spacing/rule-name" → "ja-spacing"
 */
export function extractPresetName(ruleId: string): PresetName | null {
  const match = ruleId.match(/^preset-([^/]+)/);
  if (!match) return null;

  const presetName = match[1];
  return Object.values(PRESETS).includes(presetName as PresetName)
    ? (presetName as PresetName)
    : null;
}
