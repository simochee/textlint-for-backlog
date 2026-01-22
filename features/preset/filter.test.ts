import { describe, it, expect, beforeEach, vi } from "vitest";
import { filterMessages } from "./filter";
import { PresetSettingsManager } from "./settings";
import { PRESETS } from "./types";
import type { LintResultMessage } from "@/features/textlint/types";

describe("filterMessages", () => {
  let mockGetCurrent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // シングルトンインスタンスをリセット
    // @ts-expect-error - プライベートプロパティへのアクセス（テスト用）
    PresetSettingsManager.instance = null;

    // getCurrent のスパイを設定
    const instance = PresetSettingsManager.getInstance();
    mockGetCurrent = vi
      .spyOn(instance, "getCurrent")
      .mockReturnValue({} as any);

    vi.clearAllMocks();
  });

  // テスト用のメッセージデータを生成するヘルパー関数
  function createMessage(
    ruleId: string,
    message: string,
    line = 1,
    column = 1,
    index = 0,
  ): LintResultMessage {
    return {
      ruleId,
      message,
      line,
      column,
      index,
      severity: 2,
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
      range: [index, index + 10] as [number, number],
    };
  }

  it("プリセットが有効な場合はメッセージを表示", () => {
    mockGetCurrent.mockReturnValue({
      [PRESETS.JA_TECHNICAL_WRITING]: true,
      [PRESETS.JA_SPACING]: true,
      [PRESETS.JAPANESE]: true,
    });

    const messages: LintResultMessage[] = [
      createMessage(
        "preset-ja-spacing/ja-space-between-half-and-full-width",
        "エラーメッセージ",
      ),
    ];

    const result = filterMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe(
      "preset-ja-spacing/ja-space-between-half-and-full-width",
    );
  });

  it("プリセットが無効（false）な場合はメッセージを非表示", () => {
    mockGetCurrent.mockReturnValue({
      [PRESETS.JA_TECHNICAL_WRITING]: true,
      [PRESETS.JA_SPACING]: false, // 無効
      [PRESETS.JAPANESE]: true,
    });

    const messages: LintResultMessage[] = [
      createMessage(
        "preset-ja-spacing/ja-space-between-half-and-full-width",
        "エラーメッセージ",
      ),
    ];

    const result = filterMessages(messages);
    expect(result).toHaveLength(0);
  });

  it("プリセット設定がundefinedの場合はメッセージを表示（デフォルト動作）", () => {
    // undefinedのプリセット設定
    mockGetCurrent.mockReturnValue({
      [PRESETS.JA_TECHNICAL_WRITING]: true,
      // JA_SPACINGはundefined
      [PRESETS.JAPANESE]: true,
    });

    const messages: LintResultMessage[] = [
      createMessage(
        "preset-ja-spacing/ja-space-between-half-and-full-width",
        "エラーメッセージ",
      ),
    ];

    const result = filterMessages(messages);
    // !== false なので、undefinedはtrueとして扱われる
    expect(result).toHaveLength(1);
  });

  it("プリセットが判別できないruleIdの場合は表示（安全側）", () => {
    mockGetCurrent.mockReturnValue({
      [PRESETS.JA_TECHNICAL_WRITING]: false,
      [PRESETS.JA_SPACING]: false,
      [PRESETS.JAPANESE]: false,
    });

    const messages: LintResultMessage[] = [
      createMessage("no-todo", "TODO残ってます"),
    ];

    const result = filterMessages(messages);
    // プリセットが判別できないので表示される
    expect(result).toHaveLength(1);
  });

  it("複数のプリセットが混在する場合、設定に基づいてフィルタリング", () => {
    mockGetCurrent.mockReturnValue({
      [PRESETS.JA_TECHNICAL_WRITING]: true,
      [PRESETS.JA_SPACING]: false,
      [PRESETS.JAPANESE]: true,
    });

    const messages: LintResultMessage[] = [
      createMessage(
        "preset-ja-technical-writing/no-exclamation-question-mark",
        "感嘆符を使わない",
        1,
        1,
        0,
      ),
      createMessage(
        "preset-ja-spacing/ja-space-between-half-and-full-width",
        "半角全角の間にスペース",
        2,
        1,
        10,
      ),
      createMessage("preset-japanese/no-doubled-joshi", "二重助詞", 3, 1, 20),
      createMessage("custom-rule/something", "カスタムルール", 4, 1, 30),
    ];

    const result = filterMessages(messages);

    // ja-technical-writing (true) → 表示
    // ja-spacing (false) → 非表示
    // japanese (true) → 表示
    // custom-rule（プリセットではない） → 表示
    expect(result).toHaveLength(3);
    expect(result[0].ruleId).toBe(
      "preset-ja-technical-writing/no-exclamation-question-mark",
    );
    expect(result[1].ruleId).toBe("preset-japanese/no-doubled-joshi");
    expect(result[2].ruleId).toBe("custom-rule/something");
  });

  it("空のメッセージ配列の場合は空配列を返す", () => {
    mockGetCurrent.mockReturnValue({
      [PRESETS.JA_TECHNICAL_WRITING]: true,
      [PRESETS.JA_SPACING]: true,
      [PRESETS.JAPANESE]: true,
    });

    const result = filterMessages([]);
    expect(result).toEqual([]);
  });

  it("すべてのプリセットが無効な場合、プリセット外のルールのみ表示", () => {
    mockGetCurrent.mockReturnValue({
      [PRESETS.JA_TECHNICAL_WRITING]: false,
      [PRESETS.JA_SPACING]: false,
      [PRESETS.JAPANESE]: false,
    });

    const messages: LintResultMessage[] = [
      createMessage("preset-ja-spacing/rule1", "エラー1", 1, 1, 0),
      createMessage("custom-rule/rule2", "エラー2", 2, 1, 10),
    ];

    const result = filterMessages(messages);

    // プリセット外のルールのみ表示
    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("custom-rule/rule2");
  });

  it("未知のプリセット名の場合は表示（安全側）", () => {
    mockGetCurrent.mockReturnValue({
      [PRESETS.JA_TECHNICAL_WRITING]: false,
      [PRESETS.JA_SPACING]: false,
      [PRESETS.JAPANESE]: false,
    });

    const messages: LintResultMessage[] = [
      createMessage("preset-unknown/some-rule", "未知のプリセット"),
    ];

    const result = filterMessages(messages);
    // extractPresetName が null を返すので、安全側で表示される
    expect(result).toHaveLength(1);
  });
});
