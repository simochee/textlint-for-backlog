import { fakeBrowser } from "@webext-core/fake-browser";

// WebExtension APIのモックをグローバルに設定
global.browser = fakeBrowser;
