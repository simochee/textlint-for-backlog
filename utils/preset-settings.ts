import * as v from "valibot";
import {
  PresetSettingsSchema,
  DEFAULT_PRESET_SETTINGS,
  type PresetSettings as PresetSettingsType,
  type PresetName,
} from "@/types/presets";

const STORAGE_KEY = "textlint-preset-settings";

/**
 * プリセット設定の変更を監視するコールバック型
 */
type SettingsChangeCallback = (settings: PresetSettingsType) => void;

/**
 * プリセットの有効・無効設定を管理するクラス（シングルトン）
 */
export class PresetSettingsManager {
  private static instance: PresetSettingsManager | null = null;
  private listeners = new Set<SettingsChangeCallback>();
  private currentSettings: PresetSettingsType = DEFAULT_PRESET_SETTINGS;

  private constructor() {
    // storage.onChanged リスナーを設定
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes[STORAGE_KEY]) {
        void this.handleStorageChange(changes[STORAGE_KEY].newValue);
      }
    });
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): PresetSettingsManager {
    if (!PresetSettingsManager.instance) {
      PresetSettingsManager.instance = new PresetSettingsManager();
    }
    return PresetSettingsManager.instance;
  }

  /**
   * 設定を読み込む
   */
  async load(): Promise<PresetSettingsType> {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const rawSettings = result[STORAGE_KEY];

    try {
      this.currentSettings = v.parse(PresetSettingsSchema, rawSettings);
    } catch {
      // バリデーション失敗時はデフォルト設定を使用
      this.currentSettings = DEFAULT_PRESET_SETTINGS;
    }

    return this.currentSettings;
  }

  /**
   * 現在の設定を取得（キャッシュ）
   */
  getCurrent(): PresetSettingsType {
    return this.currentSettings;
  }

  /**
   * 特定のプリセットの設定を更新
   */
  async set(presetName: PresetName, enabled: boolean): Promise<void> {
    const settings = { ...this.currentSettings, [presetName]: enabled };
    await browser.storage.local.set({ [STORAGE_KEY]: settings });
  }

  /**
   * すべての設定をリセット
   */
  async reset(): Promise<void> {
    await browser.storage.local.set({ [STORAGE_KEY]: DEFAULT_PRESET_SETTINGS });
  }

  /**
   * 設定変更を監視するリスナーを追加
   */
  addListener(callback: SettingsChangeCallback): void {
    this.listeners.add(callback);
  }

  /**
   * リスナーを削除
   */
  removeListener(callback: SettingsChangeCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * ストレージ変更時の処理
   */
  private async handleStorageChange(newValue: unknown): Promise<void> {
    try {
      this.currentSettings = v.parse(PresetSettingsSchema, newValue);
    } catch {
      this.currentSettings = DEFAULT_PRESET_SETTINGS;
    }

    // すべてのリスナーに通知
    this.listeners.forEach((callback) => callback(this.currentSettings));
  }
}
