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

  it("スラッシュが複数ある場合は最初のスラッシュまでを抽出", () => {
    expect(extractPresetName("preset-ja-spacing/sub/rule-name")).toBe(
      PRESETS.JA_SPACING,
    );
    expect(
      extractPresetName("preset-ja-technical-writing/category/sub/rule"),
    ).toBe(PRESETS.JA_TECHNICAL_WRITING);
  });

  it("スラッシュがない場合でもプリセット名を抽出（ruleIdとしては不正だが正規表現はマッチ）", () => {
    // 実際のtextlintではruleIdにスラッシュが必須だが、正規表現的にはマッチする
    expect(extractPresetName("preset-ja-spacing")).toBe(PRESETS.JA_SPACING);
    expect(extractPresetName("preset-japanese")).toBe(PRESETS.JAPANESE);
  });

  it("プリセットプレフィックスの直後がスラッシュの場合はnullを返す", () => {
    // [^/]+ が1文字以上必要なので、"preset-/" はマッチしない
    expect(extractPresetName("preset-/rule-name")).toBeNull();
  });

  it("プリセット名にハイフンが含まれる場合も正しく抽出", () => {
    // ja-technical-writing のようにハイフンが複数ある場合
    expect(
      extractPresetName("preset-ja-technical-writing/some-rule-name"),
    ).toBe(PRESETS.JA_TECHNICAL_WRITING);
  });

  it("大文字小文字が異なる場合はnullを返す", () => {
    // プリセット名は厳密にマッチする必要がある
    expect(extractPresetName("preset-JA-SPACING/rule-name")).toBeNull();
    expect(extractPresetName("preset-Japanese/rule-name")).toBeNull();
    expect(extractPresetName("PRESET-ja-spacing/rule-name")).toBeNull();
  });

  it("プリセットプレフィックスが途中にある場合はnullを返す", () => {
    expect(extractPresetName("some-preset-ja-spacing/rule")).toBeNull();
    expect(extractPresetName(" preset-ja-spacing/rule")).toBeNull();
  });
});
