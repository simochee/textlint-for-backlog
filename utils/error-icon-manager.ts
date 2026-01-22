import type { LintResultMessage } from "@/types/textlint";
import styles from "@/entrypoints/content/style.module.css";
import { createRangeFromTextOffset } from "./create-range-from-text-offset";

/**
 * エラーアイコンの表示位置を管理し、要素の位置に追従させるクラス
 */
export class ErrorIconManager {
  private icons = new WeakMap<Element, HTMLElement>();
  private errors = new WeakMap<Element, LintResultMessage[]>(); // エラー情報を保存
  private popovers = new WeakMap<Element, HTMLElement>(); // Popover要素を保存
  private elements = new Set<Element>(); // アクティブな要素を追跡
  private openElements = new Set<Element>(); // ツールチップが開いている要素を追跡
  private container: HTMLElement | null = null;
  private resizeObserver: ResizeObserver;
  private scrollHandler: () => void;
  private globalClickHandler: (e: MouseEvent) => void;

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

    // グローバルクリックハンドラ（ツールチップ以外をクリックしたら閉じる）
    this.globalClickHandler = this.handleGlobalClick.bind(this);
    document.addEventListener("click", this.globalClickHandler, true);
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
  showIcon(element: Element, errors: LintResultMessage[]): void {
    // コンテナが未初期化の場合は初期化
    this.initializeContainer();

    // エラー情報を保存
    this.errors.set(element, errors);

    if (this.icons.has(element)) {
      // 既存のアイコンを更新
      const icon = this.icons.get(element)!;
      this.updateIconContent(icon, errors.length);
      this.updateIconPosition(element);
      icon.style.display = "block";
      return;
    }

    // 新しいアイコンを作成
    const iconId = this.generateIconId();
    const icon = this.createIcon(errors.length, iconId);
    this.icons.set(element, icon);
    this.elements.add(element); // 要素を追跡

    // クリックイベントを設定
    icon.addEventListener("click", () => this.handleIconClick(element, icon));

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
    const popover = this.popovers.get(element);

    if (icon) {
      icon.remove();
      this.icons.delete(element);
      this.elements.delete(element); // 要素の追跡を停止
      this.resizeObserver.unobserve(element);
    }

    if (popover) {
      popover.remove();
      this.popovers.delete(element);
    }

    this.errors.delete(element);
  }

  /**
   * すべてのアイコンを削除してクリーンアップ
   */
  destroy(): void {
    this.container?.remove();
    this.resizeObserver.disconnect();
    window.removeEventListener("scroll", this.scrollHandler, true);
    window.removeEventListener("resize", this.scrollHandler);
    document.removeEventListener("click", this.globalClickHandler, true);
  }

  /**
   * エラーアイコン要素を作成
   */
  private createIcon(errorCount: number, id: string): HTMLElement {
    const icon = document.createElement("div");
    icon.id = id;
    icon.className = styles.errorIcon;
    this.updateIconContent(icon, errorCount);
    return icon;
  }

  /**
   * アイコン用のユニークIDを生成
   */
  private generateIconId(): string {
    return `textlint-icon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
   * アイコンの位置を要素の1行目の上下中央に更新
   */
  private updateIconPosition(element: Element): void {
    const icon = this.icons.get(element);
    if (!icon) return;

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

      // 開いているPopoverの位置も更新
      const popover = this.popovers.get(element);
      const icon = this.icons.get(element);
      if (popover && icon && popover.style.opacity !== "0") {
        this.updatePopoverPosition(popover, icon, element);
      }
    });
  }

  /**
   * アイコンクリック時の処理
   */
  private handleIconClick(element: Element, icon: HTMLElement): void {
    const errors = this.errors.get(element);
    if (!errors) return;

    // 既存のPopoverがあればトグル
    let popover = this.popovers.get(element);
    if (popover) {
      if (popover.style.opacity === "0") {
        this.updatePopoverPosition(popover, icon, element);
        popover.style.opacity = "1";
        popover.style.pointerEvents = "auto";
        this.setActiveHighlight(element, true);
      } else {
        popover.style.opacity = "0";
        popover.style.pointerEvents = "none";
        this.setActiveHighlight(element, false);
      }
      return;
    }

    // 新しいPopoverを作成
    popover = this.createPopover(errors, element);
    this.popovers.set(element, popover);

    // ツールチップはbodyに直接追加して独立したz-indexを持たせる
    document.body.appendChild(popover);
    this.updatePopoverPosition(popover, icon, element);
    popover.style.opacity = "1";
    popover.style.pointerEvents = "auto";
    this.setActiveHighlight(element, true);
  }

  /**
   * グローバルクリックハンドラー（ツールチップ以外をクリックしたら閉じる）
   */
  private handleGlobalClick(e: MouseEvent): void {
    const target = e.target as Node;

    // すべての開いているツールチップをチェック
    this.elements.forEach((element) => {
      const popover = this.popovers.get(element);
      const icon = this.icons.get(element);

      // ツールチップが開いている場合
      if (popover && popover.style.opacity !== "0") {
        // クリックされた場所がツールチップまたはアイコンの内部でない場合、閉じる
        if (!popover.contains(target) && icon && !icon.contains(target)) {
          popover.style.opacity = "0";
          popover.style.pointerEvents = "none";
          this.setActiveHighlight(element, false);
        }
      }
    });
  }

  /**
   * 要素全体のアクティブハイライトを設定/解除
   */
  private setActiveHighlight(element: Element, active: boolean): void {
    if (active) {
      // 要素全体をハイライト
      const range = document.createRange();
      range.selectNodeContents(element);

      const highlight = new Highlight(range);
      CSS.highlights.set("textlint-error-active", highlight);
      this.openElements.add(element);
    } else {
      // ハイライトを削除
      CSS.highlights.delete("textlint-error-active");
      this.openElements.delete(element);
    }
  }

  /**
   * Popover要素を作成
   */
  private createPopover(
    errors: LintResultMessage[],
    element: Element,
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

      const errorLink = document.createElement("a");
      errorLink.href = `http://localhost/rules/${error.ruleId}`;
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

      const errorMessage = document.createElement("div");
      errorMessage.className = styles.errorMessage;
      errorMessage.textContent = error.message;

      errorItem.appendChild(errorHeader);
      errorItem.appendChild(errorMessage);

      // ホバー時にハイライトを表示
      errorItem.addEventListener("mouseenter", () => {
        this.setFocusHighlight(element, error.range);
      });

      errorItem.addEventListener("mouseleave", () => {
        this.clearFocusHighlight();
      });

      popover.appendChild(errorItem);
    });

    return popover;
  }

  /**
   * 特定のエラー範囲にフォーカスハイライトを設定
   */
  private setFocusHighlight(element: Element, range: [number, number]): void {
    const [start, end] = range;
    const domRange = createRangeFromTextOffset(element, start, end);
    const highlight = new Highlight(domRange);
    CSS.highlights.set("textlint-error-focus", highlight);
  }

  /**
   * フォーカスハイライトをクリア
   */
  private clearFocusHighlight(): void {
    CSS.highlights.delete("textlint-error-focus");
  }

  /**
   * Popoverの位置をアイコンの位置に基づいて更新
   */
  private updatePopoverPosition(
    popover: HTMLElement,
    icon: HTMLElement,
    element: Element,
  ): void {
    // アイコンが非表示の場合はツールチップも非表示
    if (icon.style.opacity === "0" || icon.style.display === "none") {
      popover.style.opacity = "0";
      popover.style.pointerEvents = "none";
      this.setActiveHighlight(element, false);
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
}
