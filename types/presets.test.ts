import { describe, it, expect } from "vitest";
import { extractPresetName, PRESETS } from "./presets";

describe("extractPresetName", () => {
  it("正しいruleIdからプリセット名を抽出する", () => {
    expect(extractPresetName("preset-ja-spacing/rule-name")).toBe(
      PRESETS.JA_SPACING,
    );
    expect(extractPresetName("preset-ja-technical-writing/some-rule")).toBe(
      PRESETS.JA_TECHNICAL_WRITING,
    );
    expect(extractPresetName("preset-japanese/another-rule")).toBe(
      PRESETS.JAPANESE,
    );
  });

  it("プリセットプレフィックスがない場合はnullを返す", () => {
    expect(extractPresetName("some-rule-name")).toBeNull();
    expect(extractPresetName("rule-without-preset")).toBeNull();
  });

  it("未知のプリセット名の場合はnullを返す", () => {
    expect(extractPresetName("preset-unknown/rule-name")).toBeNull();
    expect(extractPresetName("preset-invalid/some-rule")).toBeNull();
  });

  it("空文字列の場合はnullを返す", () => {
    expect(extractPresetName("")).toBeNull();
  });
});
