/**
 * プリセットの有効・無効設定を管理するクラス
 */
export class PresetSettings {
  private static readonly STORAGE_KEY = "textlint-preset-settings";

  /**
   * デフォルト設定(すべて有効)
   */
  private static readonly DEFAULT_SETTINGS: Record<string, boolean> = {
    "ja-technical-writing": true,
    "ja-spacing": true,
    japanese: true,
  };

  /**
   * 設定を読み込む
   */
  async load(): Promise<Record<string, boolean>> {
    const result = await browser.storage.local.get(PresetSettings.STORAGE_KEY);
    const settings = result[PresetSettings.STORAGE_KEY];
    return (
      (settings as Record<string, boolean> | undefined) ??
      PresetSettings.DEFAULT_SETTINGS
    );
  }

  /**
   * 特定のプリセットの設定を更新する
   */
  async set(presetKey: string, enabled: boolean): Promise<void> {
    const settings = await this.load();
    settings[presetKey] = enabled;
    await browser.storage.local.set({
      [PresetSettings.STORAGE_KEY]: settings,
    });
  }

  /**
   * すべての設定をリセットする
   */
  async reset(): Promise<void> {
    await browser.storage.local.set({
      [PresetSettings.STORAGE_KEY]: PresetSettings.DEFAULT_SETTINGS,
    });
  }
}
