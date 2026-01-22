/**
 * textlintルールIDからドキュメントURLへのマッピング
 */

type RuleMapping = Record<string, string>;

/**
 * preset-japanese のルールマッピング
 */
const PRESET_JAPANESE_RULES: RuleMapping = {
  "max-ten": "https://github.com/textlint-ja/textlint-rule-max-ten#readme",
  "no-doubled-conjunctive-particle-ga":
    "https://github.com/takahashim/textlint-rule-no-doubled-conjunctive-particle-ga#readme",
  "no-doubled-conjunction":
    "https://github.com/takahashim/textlint-rule-no-doubled-conjunction#readme",
  "no-double-negative-ja":
    "https://github.com/textlint-ja/textlint-rule-no-double-negative-ja#readme",
  "no-doubled-joshi":
    "https://github.com/textlint-ja/textlint-rule-no-doubled-joshi#readme",
  "sentence-length":
    "https://github.com/azu/textlint-rule-sentence-length#readme",
  "no-dropping-the-ra":
    "https://github.com/azu/textlint-rule-no-dropping-the-ra#readme",
  "no-mix-dearu-desumasu":
    "https://github.com/textlint-ja/textlint-rule-no-mix-dearu-desumasu#readme",
  "no-nfd": "https://github.com/azu/textlint-rule-no-nfd#readme",
  "no-invalid-control-character":
    "https://github.com/textlint-rule/textlint-rule-no-invalid-control-character#readme",
  "no-zero-width-spaces":
    "https://github.com/textlint-rule/textlint-rule-no-zero-width-spaces#readme",
  "no-kangxi-radicals":
    "https://github.com/xl1/textlint-rule-no-kangxi-radicals#readme",
};

/**
 * preset-ja-spacing のルールマッピング
 * monorepo形式なので、ベースURLに各ルール名を追加
 */
const PRESET_JA_SPACING_BASE_URL =
  "https://github.com/textlint-ja/textlint-rule-preset-ja-spacing/tree/master/packages";

const PRESET_JA_SPACING_RULES: RuleMapping = {
  "ja-space-between-half-and-full-width": `${PRESET_JA_SPACING_BASE_URL}/textlint-rule-ja-space-between-half-and-full-width#readme`,
  "ja-no-space-between-full-width": `${PRESET_JA_SPACING_BASE_URL}/textlint-rule-ja-no-space-between-full-width#readme`,
  "ja-nakaguro-or-halfwidth-space-between-katakana": `${PRESET_JA_SPACING_BASE_URL}/textlint-rule-ja-nakaguro-or-halfwidth-space-between-katakana#readme`,
  "ja-no-space-around-parentheses": `${PRESET_JA_SPACING_BASE_URL}/textlint-rule-ja-no-space-around-parentheses#readme`,
  "ja-space-after-exclamation": `${PRESET_JA_SPACING_BASE_URL}/textlint-rule-ja-space-after-exclamation#readme`,
  "ja-space-after-question": `${PRESET_JA_SPACING_BASE_URL}/textlint-rule-ja-space-after-question#readme`,
  "ja-space-around-code": `${PRESET_JA_SPACING_BASE_URL}/textlint-rule-ja-space-around-code#readme`,
  "ja-space-around-link": `${PRESET_JA_SPACING_BASE_URL}/textlint-rule-ja-space-around-link#readme`,
};

/**
 * preset-ja-technical-writing のルールマッピング
 */
const PRESET_JA_TECHNICAL_WRITING_RULES: RuleMapping = {
  "sentence-length":
    "https://github.com/textlint-rule/textlint-rule-sentence-length#readme",
  "max-comma":
    "https://github.com/textlint-rule/textlint-rule-max-comma#readme",
  "max-ten": "https://github.com/textlint-ja/textlint-rule-max-ten#readme",
  "max-kanji-continuous-len":
    "https://github.com/textlint-ja/textlint-rule-max-kanji-continuous-len#readme",
  "arabic-kanji-numbers":
    "https://github.com/textlint-ja/textlint-rule-preset-JTF-style#readme",
  "no-mix-dearu-desumasu":
    "https://github.com/textlint-ja/textlint-rule-no-mix-dearu-desumasu#readme",
  "ja-no-mixed-period":
    "https://github.com/textlint-ja/textlint-rule-ja-no-mixed-period#readme",
  "no-double-negative-ja":
    "https://github.com/textlint-ja/textlint-rule-no-double-negative-ja#readme",
  "no-dropping-the-ra":
    "https://github.com/textlint-ja/textlint-rule-no-dropping-the-ra#readme",
  "no-doubled-conjunctive-particle-ga":
    "https://github.com/textlint-ja/textlint-rule-no-doubled-conjunctive-particle-ga#readme",
  "no-doubled-conjunction":
    "https://github.com/textlint-ja/textlint-rule-no-doubled-conjunction#readme",
  "no-doubled-joshi":
    "https://github.com/textlint-ja/textlint-rule-no-doubled-joshi#readme",
  "no-nfd": "https://github.com/textlint-ja/textlint-rule-no-nfd#readme",
  "no-invalid-control-character":
    "https://github.com/textlint-rule/textlint-rule-no-invalid-control-character#readme",
  "no-zero-width-spaces":
    "https://github.com/textlint-rule/textlint-rule-no-zero-width-spaces#readme",
  "no-exclamation-question-mark":
    "https://github.com/textlint-rule/textlint-rule-no-exclamation-question-mark#readme",
  "no-hankaku-kana":
    "https://github.com/textlint-ja/textlint-rule-no-hankaku-kana#readme",
  "ja-no-weak-phrase":
    "https://github.com/textlint-ja/textlint-rule-ja-no-weak-phrase#readme",
  "ja-no-successive-word":
    "https://github.com/textlint-ja/textlint-rule-ja-no-successive-word#readme",
  "ja-no-abusage":
    "https://github.com/textlint-ja/textlint-rule-ja-no-abusage#readme",
  "ja-no-redundant-expression":
    "https://github.com/textlint-ja/textlint-rule-ja-no-redundant-expression#readme",
  "ja-unnatural-alphabet":
    "https://github.com/textlint-ja/textlint-rule-ja-unnatural-alphabet#readme",
  "no-unmatched-pair":
    "https://github.com/textlint-rule/textlint-rule-no-unmatched-pair#readme",
};

/**
 * ルールIDからドキュメントURLを取得する
 * @param ruleId - textlintのルールID（例: "japanese/max-ten" または "preset-japanese/max-ten"）
 * @returns ドキュメントURL、または見つからない場合はnull
 */
export function getRuleDocUrl(ruleId: string): string | null {
  // プリセット名とルール名に分割
  const parts = ruleId.split("/");

  if (parts.length !== 2) {
    // プリセット形式でない場合はnullを返す
    return null;
  }

  let [presetName, ruleName] = parts;

  // "preset-" プレフィックスを削除（存在する場合）
  // 実際のエラーでは "japanese/max-ten" のような形式で返される
  if (presetName.startsWith("preset-")) {
    presetName = presetName.substring(7); // "preset-".length === 7
  }

  switch (presetName) {
    case "japanese":
      return PRESET_JAPANESE_RULES[ruleName] || null;

    case "ja-spacing":
      return PRESET_JA_SPACING_RULES[ruleName] || null;

    case "ja-technical-writing":
      return PRESET_JA_TECHNICAL_WRITING_RULES[ruleName] || null;

    default:
      return null;
  }
}
