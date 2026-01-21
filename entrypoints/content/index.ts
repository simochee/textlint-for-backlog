import { observeQuerySelector } from "@/utils/observe-query-selector";
import { createRangeFromTextOffset } from "@/utils/create-range-from-text-offset";
import { TextlintWorker } from "./worker";
import debounce from "debounce";
import "./style.css";

export default defineContentScript({
  matches: ["https://*.backlog.com/*", "https://*.backlog.jp/*"],
  allFrames: true,
  async main() {
    const { textlintWorkerUrl } = useAppConfig();
    const textlint = new TextlintWorker(textlintWorkerUrl);

    const rangesMap = new Map<string, Range[]>();

    const renderRange = debounce(() => {
      const highlight = new Highlight(...[...rangesMap.values()].flat());
      CSS.highlights.set("textlint-error", highlight);
    }, 100);

    await textlint.load();

    observeQuerySelector('[contenteditable="true"] > p', (el) => {
      const id = crypto.randomUUID();

      const lint = async () => {
        const results = await textlint.lint(id, el.innerHTML);

        const ranges = results.map((result) => {
          return createRangeFromTextOffset(
            el,
            result.range[0],
            result.range[1],
          );
        });

        rangesMap.set(id, ranges);
        renderRange();
      };

      void lint();

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

      return () => {
        observer.disconnect();
        rangesMap.delete(id);
        renderRange();
      };
    });
  },
});
