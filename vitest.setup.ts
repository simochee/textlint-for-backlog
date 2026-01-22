import { fakeBrowser } from "@webext-core/fake-browser";

// WebExtension APIのモックをグローバルに設定
(globalThis as any).browser = fakeBrowser;
