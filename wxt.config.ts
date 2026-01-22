import { defineConfig } from "wxt";
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  modules: ["@wxt-dev/auto-icons"],
  manifest: {
    name: "Textlint for Backlog",
    description: pkg.description,
    version: pkg.version,
    permissions: ["storage"],
  },
});
