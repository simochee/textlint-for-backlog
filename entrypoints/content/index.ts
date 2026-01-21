import { observeQuerySelector } from "@/utils/observe-query-selector";
import { TextlintWorker } from "./worker";
import "./style.css";

export default defineContentScript({
  matches: ["https://*.backlog.com/*", "https://*.backlog.jp/*"],
  allFrames: true,
  async main() {
    const { textlintWorkerUrl } = useAppConfig();
    const textlint = new TextlintWorker(textlintWorkerUrl);

    await textlint.load();

    observeQuerySelector('[contenteditable="true"] p', async (el) => {
      const id = crypto.randomUUID();

      const lint = async () => {
        const results = await textlint.lint(id, el.innerText);

        const ranges = results.map((result) => {
          const range = new Range();
          range.setStart(el.firstChild ?? el, result.range[0]);
          range.setEnd(el.firstChild ?? el, result.range[1]);

          return range;
        });

        const highlight = new Highlight(...ranges);
        CSS.highlights.set("textlint-error", highlight);
      };

      await lint();

      let beforeText = el.innerText;

      const observer = new MutationObserver(async () => {
        if (beforeText !== el.innerText) {
          beforeText = el.innerText;
          await lint();
        }
      });

      observer.observe(el, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });
  },
});
