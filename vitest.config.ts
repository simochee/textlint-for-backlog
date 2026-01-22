import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    // DOM環境を有効化（happy-domを使用）
    environment: "happy-dom",

    // グローバルAPIを有効化（describe, it, expect などをimportなしで使用可能）
    globals: true,

    // テストファイルのパターン
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    // カバレッジ設定
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".wxt/",
        ".output/",
        "**/*.config.*",
        "**/*.d.ts",
        "**/types/**",
        "vendor/",
      ],
    },

    // セットアップファイル
    setupFiles: ["./vitest.setup.ts"],
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "~": resolve(__dirname, "."),
      "@@": resolve(__dirname, "."),
      "~~": resolve(__dirname, "."),
    },
  },
});
