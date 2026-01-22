import "./style.css";
import { PresetSettings } from "@/utils/preset-settings";

const presetSettings = new PresetSettings();

// 初期設定を読み込み
const settings = await presetSettings.load();

// チェックボックスの初期状態を設定
const checkboxes = document.querySelectorAll<HTMLInputElement>(
  'input[type="checkbox"][data-preset]',
);

for (const checkbox of checkboxes) {
  const presetKey = checkbox.dataset.preset;
  if (presetKey) {
    checkbox.checked = settings[presetKey] ?? true;
  }

  // 変更イベントリスナーを追加
  checkbox.addEventListener("change", async () => {
    const presetKey = checkbox.dataset.preset;
    if (presetKey) {
      await presetSettings.set(presetKey, checkbox.checked);
    }
  });
}
