import { defineContentScript } from 'wxt/utils/define-content-script';

export default defineContentScript({
  matches: ['https://*.backlog.com/*', "https://*.backlog.jp/*"],
  allFrames: true,
  async main() {
    console.log('Content script for Backlog loaded');
  }
})
