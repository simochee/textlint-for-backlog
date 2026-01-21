import { loadTextlint } from "./worker";

export default defineContentScript({
  matches: ["https://*.backlog.com/*", "https://*.backlog.jp/*"],
  allFrames: true,
  async main() {
    const worker = await loadTextlint();

    worker.onmessage = console.log;

    for (const p of document.querySelectorAll('[contenteditable="true"] p')) {
      if (p instanceof HTMLParagraphElement) {
        const text = p.innerText;

        const id = crypto.randomUUID();
        worker.postMessage({
          id,
          command: "lint",
          text,
          ext: ".md",
        });
      }
    }
  },
});
