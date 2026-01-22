import { minimatch } from "minimatch";
import { nodeMatcher } from "./node-matcher";

type InvalidateFunction = () => void;

export type Listener = (
  el: HTMLElement,
) => InvalidateFunction | void | Promise<void>;

// セレクタにマッチした要素に設定されているハンドラー関数のマップ
const handlersMap: Map<
  Listener,
  {
    selector: string;
    onInvalidate: InvalidateFunction;
    elementsMap: Map<HTMLElement, InvalidateFunction>;
    matches: string[] | undefined;
  }
> = new Map();

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      for (const [
        handler,
        { selector, elementsMap, matches = [] },
      ] of handlersMap) {
        const isMatched =
          matches.length === 0 ||
          matches.some((match) => minimatch(location.pathname, match));

        if (isMatched) {
          for (const node of mutation.addedNodes) {
            for (const el of nodeMatcher(selector, node)) {
              const invalidate = handler(el);

              if (typeof invalidate === "function") {
                elementsMap.set(el, invalidate);
              }
            }
          }
        }

        if (mutation.removedNodes.length > 0) {
          for (const [el, invalidate] of elementsMap) {
            if (!el.isConnected) {
              invalidate?.();
              elementsMap.delete(el);
            }
          }
        }
      }
    }
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

/**
 * セレクターにマッチする要素が出現したときにハンドラー関数を実行する
 * ハンドラー関数が返す関数は、要素がDOMから削除されたときに実行される
 *
 * @param selector 監視するセレクター
 * @param handler セレクターにマッチする要素が出現したときに実行される関数
 * @param matches この関数を有効にするパスのパターンの配列
 */
export const observeQuerySelector = (
  selector: string,
  handler: Listener,
  matches?: string[],
) => {
  const invalidateSet = new Set<InvalidateFunction>();

  const onInvalidate = () => {
    for (const invalidate of invalidateSet) {
      invalidate();
    }
    invalidateSet.clear();
  };

  handlersMap.set(handler, {
    selector,
    onInvalidate,
    matches,
    elementsMap: new Map(),
  });

  for (const el of nodeMatcher(selector, document.documentElement)) {
    const invalidate = handler(el);

    if (typeof invalidate === "function") {
      invalidateSet.add(invalidate);
    }
  }

  return () => {
    onInvalidate();
    handlersMap.delete(handler);
  };
};
