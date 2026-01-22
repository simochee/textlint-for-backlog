import { defineConfig } from "wxt";
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  manifest: {
    name: "Textlint for Backlog",
    description: pkg.description,
    version: pkg.version,
    permissions: ["storage"],
  },
});
