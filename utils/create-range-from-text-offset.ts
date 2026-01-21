/**
 * テキストオフセットから DOM の Range を作成する
 * @param element ルート要素
 * @param startOffset 開始オフセット
 * @param endOffset 終了オフセット
 * @returns Range オブジェクト
 */
export function createRangeFromTextOffset(
  element: Element,
  startOffset: number,
  endOffset: number,
): Range {
  const range = new Range();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let currentOffset = 0;
  let startNode: Node | null = null;
  let startNodeOffset = 0;
  let endNode: Node | null = null;
  let endNodeOffset = 0;

  // TreeWalker でテキストノードを順番に走査
  let node: Node | null = walker.nextNode();
  while (node) {
    const textLength = node.textContent?.length ?? 0;
    const nextOffset = currentOffset + textLength;

    // 開始位置を探す
    if (
      startNode === null &&
      startOffset >= currentOffset &&
      startOffset <= nextOffset
    ) {
      startNode = node;
      startNodeOffset = startOffset - currentOffset;
    }

    // 終了位置を探す
    if (
      endNode === null &&
      endOffset >= currentOffset &&
      endOffset <= nextOffset
    ) {
      endNode = node;
      endNodeOffset = endOffset - currentOffset;
    }

    // 両方見つかったら終了
    if (startNode !== null && endNode !== null) {
      break;
    }

    currentOffset = nextOffset;
    node = walker.nextNode();
  }

  // 見つからなかった場合のフォールバック
  if (startNode === null) {
    startNode = element.firstChild ?? element;
    startNodeOffset = 0;
  }
  if (endNode === null) {
    endNode = element.lastChild ?? element;
    endNodeOffset = endNode.textContent?.length ?? 0;
  }

  range.setStart(startNode, startNodeOffset);
  range.setEnd(endNode, endNodeOffset);

  return range;
}
