import { defineAppConfig } from "#imports";

declare module "wxt/utils/define-app-config" {
  export interface WxtAppConfig {
    textlintWorkerUrl: string;
  }
}

export default defineAppConfig({
  textlintWorkerUrl:
    "https://cdn.jsdelivr.net/gh/simochee/textlint-for-backlog/vendor/textlint-worker.js",
});
