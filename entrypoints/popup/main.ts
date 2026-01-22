import "./style.css";
import { PresetSettingsManager } from "@/utils/preset-settings";
import { PRESETS, PRESET_LABELS } from "@/types/presets";

const settingsManager = PresetSettingsManager.getInstance();

// 初期設定を読み込み
const settings = await settingsManager.load();

// プリセットリストを動的に生成
const container = document.querySelector(".preset-toggles");
if (container) {
  container.innerHTML = "";

  Object.values(PRESETS).forEach((presetName) => {
    const item = document.createElement("div");
    item.className = "preset-item";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = presetName;
    checkbox.dataset.preset = presetName;
    checkbox.checked = settings[presetName] ?? true;

    const span = document.createElement("span");
    span.textContent = PRESET_LABELS[presetName];

    label.appendChild(checkbox);
    label.appendChild(span);
    item.appendChild(label);
    container.appendChild(item);

    // 変更イベントリスナーを追加
    checkbox.addEventListener("change", async () => {
      await settingsManager.set(presetName, checkbox.checked);
    });
  });
}
