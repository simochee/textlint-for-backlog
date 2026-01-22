/**
 * エラーアイコンの表示位置を管理し、要素の位置に追従させるクラス
 */
export class ErrorIconManager {
  private icons = new WeakMap<Element, HTMLElement>();
  private elements = new Set<Element>(); // アクティブな要素を追跡
  private container: HTMLElement | null = null;
  private resizeObserver: ResizeObserver;
  private scrollHandler: () => void;

  constructor() {
    // コンテナ要素を作成（遅延初期化）
    this.initializeContainer();

    // ResizeObserverを設定
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.updateIconPosition(entry.target as HTMLElement);
      }
    });

    // スクロールイベントハンドラ
    this.scrollHandler = this.handleScroll.bind(this);
    window.addEventListener("scroll", this.scrollHandler, true);
    window.addEventListener("resize", this.scrollHandler);
  }

  /**
   * コンテナを初期化（適切な親要素に配置）
   */
  private initializeContainer(): void {
    if (this.container) return;

    // Backlogの構造に合わせて適切な親要素を探す
    const targetParent =
      document.querySelector(".content-container") ||
      document.querySelector(".doc-container") ||
      document.querySelector(".main-container") ||
      document.body;

    this.container = document.createElement("div");
    this.container.id = "textlint-error-icons-container";
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    `;
    targetParent.appendChild(this.container);
  }

  /**
   * 要素にエラーアイコンを表示
   */
  showIcon(element: Element, errorCount: number = 1): void {
    // コンテナが未初期化の場合は初期化
    this.initializeContainer();

    if (this.icons.has(element)) {
      // 既存のアイコンを更新
      const icon = this.icons.get(element)!;
      this.updateIconContent(icon, errorCount);
      this.updateIconPosition(element);
      icon.style.display = "block";
      return;
    }

    // 新しいアイコンを作成
    const icon = this.createIcon(errorCount);
    this.icons.set(element, icon);
    this.elements.add(element); // 要素を追跡
    this.container?.appendChild(icon);

    // 位置を更新
    this.updateIconPosition(element);

    // ResizeObserverで監視
    this.resizeObserver.observe(element);
  }

  /**
   * 要素のエラーアイコンを非表示
   */
  hideIcon(element: Element): void {
    const icon = this.icons.get(element);
    if (icon) {
      icon.style.display = "none";
    }
  }

  /**
   * 要素のエラーアイコンを削除
   */
  removeIcon(element: Element): void {
    const icon = this.icons.get(element);
    if (icon) {
      icon.remove();
      this.icons.delete(element);
      this.elements.delete(element); // 要素の追跡を停止
      this.resizeObserver.unobserve(element);
    }
  }

  /**
   * すべてのアイコンを削除してクリーンアップ
   */
  destroy(): void {
    this.container?.remove();
    this.resizeObserver.disconnect();
    window.removeEventListener("scroll", this.scrollHandler, true);
    window.removeEventListener("resize", this.scrollHandler);
  }

  /**
   * エラーアイコン要素を作成
   */
  private createIcon(errorCount: number): HTMLElement {
    const icon = document.createElement("div");
    icon.className = "textlint-error-icon";
    this.updateIconContent(icon, errorCount);
    return icon;
  }

  /**
   * アイコンの内容を更新
   */
  private updateIconContent(icon: HTMLElement, errorCount: number): void {
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" fill="#FF4444" stroke="white" stroke-width="1"/>
        <text x="10" y="14" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${errorCount}</text>
      </svg>
    `;
  }

  /**
   * アイコンの位置を要素の右上外側に更新
   */
  private updateIconPosition(element: Element): void {
    const icon = this.icons.get(element);
    if (!icon) return;

    const rect = element.getBoundingClientRect();

    // 要素の右上外側に配置（右に8px、上に8pxのオフセット）
    const left = rect.right + 8;
    const top = rect.top - 8;

    icon.style.cssText = `
      position: fixed;
      left: ${left}px;
      top: ${top}px;
      pointer-events: auto;
      cursor: pointer;
      transition: opacity 0.2s;
    `;

    // topbarとの重なりをチェック
    const topbar = document.querySelector(".topbar");
    const topbarRect = topbar?.getBoundingClientRect();

    // 画面外に出ている場合、またはtopbarと重なる場合は非表示
    const isOutOfViewport =
      top < 0 ||
      left < 0 ||
      top > window.innerHeight ||
      left > window.innerWidth;
    const isOverlappingTopbar = topbarRect && top < topbarRect.bottom;

    if (isOutOfViewport || isOverlappingTopbar) {
      icon.style.opacity = "0";
      icon.style.pointerEvents = "none";
    } else {
      icon.style.opacity = "1";
      icon.style.pointerEvents = "auto";
    }
  }

  /**
   * スクロール時に全アイコンの位置を更新
   */
  private handleScroll(): void {
    // アクティブな要素の位置を更新
    this.elements.forEach((element) => {
      this.updateIconPosition(element);
    });
  }
}
