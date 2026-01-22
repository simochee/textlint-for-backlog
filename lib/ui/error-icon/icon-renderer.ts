import styles from "@/entrypoints/content/style.module.css";

export interface IconPosition {
  left: number;
  top: number;
  visible: boolean;
}

/**
 * エラーアイコンの描画とレイアウトを担当するクラス
 */
export class IconRenderer {
  /**
   * エラーアイコン要素を作成
   */
  createIcon(errorCount: number, id: string): HTMLElement {
    const icon = document.createElement("div");
    icon.id = id;
    icon.className = styles.errorIcon;
    this.updateIconContent(icon, errorCount);
    return icon;
  }

  /**
   * アイコン用のユニークIDを生成
   */
  generateIconId(): string {
    return `textlint-icon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * アイコンの内容を更新
   */
  updateIconContent(icon: HTMLElement, errorCount: number): void {
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" fill="#FF4444" stroke="white" stroke-width="1"/>
        <text x="10" y="14" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${errorCount}</text>
      </svg>
    `;
  }

  /**
   * アイコンの位置を計算して設定する
   */
  calculateIconPosition(
    element: Element,
    icon: HTMLElement,
    container: HTMLElement | null,
  ): void {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    // line-heightを取得（normalの場合はfont-sizeの約1.2倍）
    let lineHeight = parseFloat(computedStyle.lineHeight);
    if (isNaN(lineHeight) || computedStyle.lineHeight === "normal") {
      const fontSize = parseFloat(computedStyle.fontSize);
      lineHeight = fontSize * 1.2;
    }

    // アイコンのサイズ（20px）
    const iconSize = 20;

    // 要素の右側に配置（右に8pxのオフセット）
    const left = rect.right + 8;

    // 1行目の中央に配置（要素の上端 + 1行目の高さの半分 - アイコンの高さの半分）
    const top = rect.top + lineHeight / 2 - iconSize / 2;

    icon.style.cssText = `
      position: fixed;
      left: ${left}px;
      top: ${top}px;
      pointer-events: auto;
      cursor: pointer;
      transition: opacity 0.2s;
    `;

    // topbarとの重なりをチェック
    const isOverlappingTopbar = this.isOverlappingWithTopbar(rect);

    // 画面外に出ている場合、またはtopbarと重なる場合は非表示
    const isOutOfViewport =
      top < 0 ||
      left < 0 ||
      top > window.innerHeight ||
      left > window.innerWidth;

    if (isOutOfViewport || isOverlappingTopbar) {
      icon.style.opacity = "0";
      icon.style.pointerEvents = "none";
    } else {
      icon.style.opacity = "1";
      icon.style.pointerEvents = "auto";
    }
  }

  /**
   * topbarと重なっているかチェック
   */
  private isOverlappingWithTopbar(rect: DOMRect): boolean {
    const topbar = document.querySelector(".topbar");
    const topbarRect = topbar?.getBoundingClientRect();

    if (!topbarRect) return false;

    return rect.top < topbarRect.bottom;
  }
}
