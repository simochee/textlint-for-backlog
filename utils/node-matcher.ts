/**
 * 指定したノードの子孫要素の中から、セレクターにマッチする要素をすべて取得する
 */
export const nodeMatcher = <T extends HTMLElement>(
  selector: string,
  node: Node,
  elementType = HTMLElement,
): T[] => {
  if (!(node instanceof HTMLElement)) {
    return [];
  }

  return Array.from(node.ownerDocument.querySelectorAll(selector))
    .filter((el): el is T => el instanceof elementType)
    .filter((el) => node.contains(el));
};
