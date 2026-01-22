import { describe, it, expect, beforeEach, vi } from "vitest";
import { PresetSettingsManager } from "./preset-settings";
import { DEFAULT_PRESET_SETTINGS, PRESETS } from "@/types/presets";

describe("PresetSettingsManager", () => {
  let manager: PresetSettingsManager;

  beforeEach(() => {
    // 各テストの前にシングルトンインスタンスをリセット
    // @ts-expect-error - プライベートプロパティへのアクセス（テスト用）
    PresetSettingsManager.instance = null;

    // browser.storage APIのモックをリセット
    vi.clearAllMocks();
  });

  describe("getInstance", () => {
    it("シングルトンインスタンスを返す", () => {
      const instance1 = PresetSettingsManager.getInstance();
      const instance2 = PresetSettingsManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("load", () => {
    it("ストレージから設定を読み込む", async () => {
      const mockSettings = {
        [PRESETS.JA_TECHNICAL_WRITING]: true,
        [PRESETS.JA_SPACING]: false,
        [PRESETS.JAPANESE]: true,
      };

      // browser.storage.local.getのモック
      global.browser.storage.local.get = vi
        .fn()
        .mockResolvedValue({ "textlint-preset-settings": mockSettings });

      manager = PresetSettingsManager.getInstance();
      const settings = await manager.load();

      expect(settings).toEqual(mockSettings);
      expect(global.browser.storage.local.get).toHaveBeenCalledWith(
        "textlint-preset-settings",
      );
    });

    it("バリデーションエラー時はデフォルト設定を使用", async () => {
      // 不正なデータをモック
      global.browser.storage.local.get = vi
        .fn()
        .mockResolvedValue({ "textlint-preset-settings": "invalid-data" });

      manager = PresetSettingsManager.getInstance();
      const settings = await manager.load();

      expect(settings).toEqual(DEFAULT_PRESET_SETTINGS);
    });
  });

  describe("getCurrent", () => {
    it("現在の設定を返す", async () => {
      const mockSettings = {
        [PRESETS.JA_TECHNICAL_WRITING]: false,
        [PRESETS.JA_SPACING]: true,
        [PRESETS.JAPANESE]: false,
      };

      global.browser.storage.local.get = vi
        .fn()
        .mockResolvedValue({ "textlint-preset-settings": mockSettings });

      manager = PresetSettingsManager.getInstance();
      await manager.load();

      expect(manager.getCurrent()).toEqual(mockSettings);
    });
  });

  describe("set", () => {
    it("特定のプリセット設定を更新する", async () => {
      global.browser.storage.local.get = vi
        .fn()
        .mockResolvedValue({
          "textlint-preset-settings": DEFAULT_PRESET_SETTINGS,
        });
      global.browser.storage.local.set = vi.fn().mockResolvedValue(undefined);

      manager = PresetSettingsManager.getInstance();
      await manager.load();
      await manager.set(PRESETS.JA_SPACING, false);

      expect(global.browser.storage.local.set).toHaveBeenCalledWith({
        "textlint-preset-settings": {
          ...DEFAULT_PRESET_SETTINGS,
          [PRESETS.JA_SPACING]: false,
        },
      });
    });
  });

  describe("reset", () => {
    it("設定をデフォルトにリセットする", async () => {
      global.browser.storage.local.set = vi.fn().mockResolvedValue(undefined);

      manager = PresetSettingsManager.getInstance();
      await manager.reset();

      expect(global.browser.storage.local.set).toHaveBeenCalledWith({
        "textlint-preset-settings": DEFAULT_PRESET_SETTINGS,
      });
    });
  });

  // TODO: リスナー機能のテストを追加してください
  // describe("addListener / removeListener", () => {
  //   it("リスナーを追加し、設定変更時に呼び出される", async () => {
  //     // ヒント: vi.fn()でモック関数を作成し、
  //     // browser.storage.onChangedイベントをシミュレートして、
  //     // リスナーが呼び出されることを確認してください
  //   });
  //
  //   it("削除されたリスナーは呼び出されない", async () => {
  //     // ヒント: リスナーを追加した後に削除し、
  //     // イベント発火時に呼び出されないことを確認してください
  //   });
  // });
});
