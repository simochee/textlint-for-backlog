import { describe, it, expect, beforeEach, vi } from "vitest";
import { PresetSettingsManager } from "./settings";
import { DEFAULT_PRESET_SETTINGS, PRESETS } from "./types";

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
      browser.storage.local.get = vi
        .fn()
        .mockResolvedValue({ "textlint-preset-settings": mockSettings });

      manager = PresetSettingsManager.getInstance();
      const settings = await manager.load();

      expect(settings).toEqual(mockSettings);
      expect(browser.storage.local.get).toHaveBeenCalledWith(
        "textlint-preset-settings",
      );
    });

    it("バリデーションエラー時はデフォルト設定を使用", async () => {
      // 不正なデータをモック
      browser.storage.local.get = vi
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

      browser.storage.local.get = vi
        .fn()
        .mockResolvedValue({ "textlint-preset-settings": mockSettings });

      manager = PresetSettingsManager.getInstance();
      await manager.load();

      expect(manager.getCurrent()).toEqual(mockSettings);
    });
  });

  describe("set", () => {
    it("特定のプリセット設定を更新する", async () => {
      browser.storage.local.get = vi.fn().mockResolvedValue({
        "textlint-preset-settings": DEFAULT_PRESET_SETTINGS,
      });
      browser.storage.local.set = vi.fn().mockResolvedValue(undefined);

      manager = PresetSettingsManager.getInstance();
      await manager.load();
      await manager.set(PRESETS.JA_SPACING, false);

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        "textlint-preset-settings": {
          ...DEFAULT_PRESET_SETTINGS,
          [PRESETS.JA_SPACING]: false,
        },
      });
    });
  });

  describe("reset", () => {
    it("設定をデフォルトにリセットする", async () => {
      browser.storage.local.set = vi.fn().mockResolvedValue(undefined);

      manager = PresetSettingsManager.getInstance();
      await manager.reset();

      expect(browser.storage.local.set).toHaveBeenCalledWith({
        "textlint-preset-settings": DEFAULT_PRESET_SETTINGS,
      });
    });
  });

  describe("addListener / removeListener", () => {
    it("リスナーを追加し、設定変更時に呼び出される", async () => {
      // browser.storage.onChanged.addListener のスパイを設定
      const addListenerSpy = vi.spyOn(browser.storage.onChanged, "addListener");

      manager = PresetSettingsManager.getInstance();

      // モックリスナーを作成
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.addListener(listener1);
      manager.addListener(listener2);

      // ストレージ変更をシミュレート
      const newSettings = {
        [PRESETS.JA_TECHNICAL_WRITING]: false,
        [PRESETS.JA_SPACING]: true,
        [PRESETS.JAPANESE]: false,
      };

      // addListener で登録されたコールバックを取得して実行
      const storageChangeHandler = addListenerSpy.mock.calls[0]?.[0];
      expect(storageChangeHandler).toBeDefined();

      await storageChangeHandler!(
        {
          "textlint-preset-settings": {
            newValue: newSettings,
            oldValue: DEFAULT_PRESET_SETTINGS,
          },
        },
        "local",
      );

      // 両方のリスナーが呼び出されることを確認
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledWith(newSettings);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledWith(newSettings);
    });

    it("削除されたリスナーは呼び出されない", async () => {
      const addListenerSpy = vi.spyOn(browser.storage.onChanged, "addListener");

      manager = PresetSettingsManager.getInstance();

      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.addListener(listener1);
      manager.addListener(listener2);
      manager.removeListener(listener1);

      // ストレージ変更をシミュレート
      const newSettings = {
        [PRESETS.JA_TECHNICAL_WRITING]: false,
        [PRESETS.JA_SPACING]: false,
        [PRESETS.JAPANESE]: false,
      };

      const storageChangeHandler = addListenerSpy.mock.calls[0]?.[0];
      expect(storageChangeHandler).toBeDefined();

      await storageChangeHandler!(
        {
          "textlint-preset-settings": {
            newValue: newSettings,
            oldValue: DEFAULT_PRESET_SETTINGS,
          },
        },
        "local",
      );

      // listener1は削除されているため呼び出されない
      expect(listener1).not.toHaveBeenCalled();
      // listener2は呼び出される
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledWith(newSettings);
    });

    it("バリデーション失敗時はデフォルト設定でリスナーを呼び出す", async () => {
      const addListenerSpy = vi.spyOn(browser.storage.onChanged, "addListener");

      manager = PresetSettingsManager.getInstance();

      const listener = vi.fn();
      manager.addListener(listener);

      // 不正なデータでストレージ変更をシミュレート
      const storageChangeHandler = addListenerSpy.mock.calls[0]?.[0];
      expect(storageChangeHandler).toBeDefined();

      await storageChangeHandler!(
        {
          "textlint-preset-settings": {
            newValue: "invalid-data",
            oldValue: DEFAULT_PRESET_SETTINGS,
          },
        },
        "local",
      );

      // デフォルト設定で呼び出される
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(DEFAULT_PRESET_SETTINGS);
    });

    it("異なるストレージエリアの変更では呼び出されない", async () => {
      const addListenerSpy = vi.spyOn(browser.storage.onChanged, "addListener");

      manager = PresetSettingsManager.getInstance();

      const listener = vi.fn();
      manager.addListener(listener);

      const storageChangeHandler = addListenerSpy.mock.calls[0]?.[0];
      expect(storageChangeHandler).toBeDefined();

      // syncストレージの変更（localではない）
      await storageChangeHandler!(
        {
          "textlint-preset-settings": {
            newValue: { [PRESETS.JA_SPACING]: false },
            oldValue: DEFAULT_PRESET_SETTINGS,
          },
        },
        "sync",
      );

      // リスナーは呼び出されない
      expect(listener).not.toHaveBeenCalled();
    });

    it("異なるキーの変更では呼び出されない", async () => {
      const addListenerSpy = vi.spyOn(browser.storage.onChanged, "addListener");

      manager = PresetSettingsManager.getInstance();

      const listener = vi.fn();
      manager.addListener(listener);

      const storageChangeHandler = addListenerSpy.mock.calls[0]?.[0];
      expect(storageChangeHandler).toBeDefined();

      // 別のキーの変更
      await storageChangeHandler!(
        {
          "other-key": {
            newValue: "some-value",
            oldValue: null,
          },
        },
        "local",
      );

      // リスナーは呼び出されない
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
