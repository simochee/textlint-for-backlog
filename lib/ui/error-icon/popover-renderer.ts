import type { LintResultMessage } from "@/features/textlint/types";
import styles from "@/entrypoints/content/style.module.css";
import { createRangeFromTextOffset } from "@/lib/dom/create-range-from-text-offset";
import { getRuleDocUrl } from "@/features/preset/rule-doc-links";

/**
 * Popoverの描画とレイアウトを担当するクラス
 */
export class PopoverRenderer {
  /**
   * Popover要素を作成
   */
  createPopover(
    errors: LintResultMessage[],
    element: Element,
    onMouseEnter: (range: [number, number]) => void,
    onMouseLeave: () => void,
  ): HTMLElement {
    const popover = document.createElement("div");
    popover.className = styles.errorPopover;
    popover.style.opacity = "0";
    popover.style.pointerEvents = "none";

    errors.forEach((error) => {
      const errorItem = document.createElement("div");
      errorItem.className = styles.errorItem;

      const errorHeader = document.createElement("div");
      errorHeader.className = styles.errorHeader;

      // ルールIDからドキュメントURLを取得
      const docUrl = getRuleDocUrl(error.ruleId);

      if (docUrl) {
        // ドキュメントURLが存在する場合はリンクを作成
        const errorLink = document.createElement("a");
        errorLink.href = docUrl;
        errorLink.className = styles.errorRule;
        errorLink.target = "_blank";
        errorLink.rel = "noopener noreferrer";
        errorLink.textContent = error.ruleId;

        const linkIcon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        linkIcon.setAttribute("class", styles.linkIcon);
        linkIcon.setAttribute("viewBox", "0 0 16 16");
        linkIcon.setAttribute("fill", "none");

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("d", "M14 9v5H2V2h5M9 2h5v5M8 8l6-6");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");

        linkIcon.appendChild(path);
        errorLink.appendChild(linkIcon);
        errorHeader.appendChild(errorLink);
      } else {
        // ドキュメントURLが存在しない場合はテキストのみ表示
        const errorRule = document.createElement("span");
        errorRule.className = styles.errorRule;
        errorRule.textContent = error.ruleId;
        errorHeader.appendChild(errorRule);
      }

      const errorMessage = document.createElement("div");
      errorMessage.className = styles.errorMessage;
      this.setMessageWithLinks(errorMessage, error.message);

      errorItem.appendChild(errorHeader);
      errorItem.appendChild(errorMessage);

      // ホバー時にハイライトを表示
      errorItem.addEventListener("mouseenter", () => {
        onMouseEnter(error.range);
      });

      errorItem.addEventListener("mouseleave", () => {
        onMouseLeave();
      });

      popover.appendChild(errorItem);
    });

    return popover;
  }

  /**
   * Popoverの位置をアイコンの位置に基づいて更新
   */
  updatePopoverPosition(
    popover: HTMLElement,
    icon: HTMLElement,
    element: Element,
    onHide: () => void,
  ): void {
    // アイコンが非表示の場合はツールチップも非表示
    if (icon.style.opacity === "0" || icon.style.display === "none") {
      popover.style.opacity = "0";
      popover.style.pointerEvents = "none";
      onHide();
      return;
    }

    const iconRect = icon.getBoundingClientRect();

    // アイコンの右端を基準に、ツールチップを上側・左側に配置
    // ツールチップの右端がアイコンの中央あたりに来るように調整
    const right = window.innerWidth - iconRect.right + iconRect.width / 2;
    const bottom = window.innerHeight - iconRect.top + 8;

    popover.style.right = `${right}px`;
    popover.style.bottom = `${bottom}px`;
    popover.style.left = "auto";
    popover.style.top = "auto";
    popover.style.transform = "none";
  }

  /**
   * 特定のエラー範囲にフォーカスハイライトを設定
   */
  setFocusHighlight(element: Element, range: [number, number]): void {
    const [start, end] = range;
    const domRange = createRangeFromTextOffset(element, start, end);
    const highlight = new Highlight(domRange);
    CSS.highlights.set("textlint-error-focus", highlight);
  }

  /**
   * フォーカスハイライトをクリア
   */
  clearFocusHighlight(): void {
    CSS.highlights.delete("textlint-error-focus");
  }

  /**
   * メッセージ内のURLをリンクに変換して要素に設定
   */
  private setMessageWithLinks(element: HTMLElement, message: string): void {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = message.split(urlPattern);

    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        // 通常のテキスト
        if (part) {
          element.appendChild(document.createTextNode(part));
        }
      } else {
        // URL
        const link = document.createElement("a");
        link.href = part;
        link.textContent = part;
        link.className = styles.errorLink;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        element.appendChild(link);
      }
    });
  }
}
