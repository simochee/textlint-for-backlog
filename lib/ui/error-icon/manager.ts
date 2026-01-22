import type { LintResultMessage } from "@/features/textlint/types";
import { IconRenderer } from "./icon-renderer";
import { PopoverRenderer } from "./popover-renderer";

/**
 * エラーアイコンの表示位置を管理し、要素の位置に追従させるクラス
 */
export class ErrorIconManager {
  private iconRenderer = new IconRenderer();
  private popoverRenderer = new PopoverRenderer();

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
      this.iconRenderer.updateIconContent(icon, errors.length);
      this.updateIconPosition(element);
      icon.style.display = "block";
      return;
    }

    // 新しいアイコンを作成
    const iconId = this.iconRenderer.generateIconId();
    const icon = this.iconRenderer.createIcon(errors.length, iconId);
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
   * アイコンの位置を更新
   */
  private updateIconPosition(element: Element): void {
    const icon = this.icons.get(element);
    if (!icon) return;

    this.iconRenderer.calculateIconPosition(element, icon, this.container);
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
        this.popoverRenderer.updatePopoverPosition(popover, icon, element, () =>
          this.setActiveHighlight(element, false),
        );
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
        this.popoverRenderer.updatePopoverPosition(popover, icon, element, () =>
          this.setActiveHighlight(element, false),
        );
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
    popover = this.popoverRenderer.createPopover(
      errors,
      element,
      (range) => this.popoverRenderer.setFocusHighlight(element, range),
      () => this.popoverRenderer.clearFocusHighlight(),
    );
    this.popovers.set(element, popover);

    // ツールチップはbodyに直接追加して独立したz-indexを持たせる
    document.body.appendChild(popover);
    this.popoverRenderer.updatePopoverPosition(popover, icon, element, () =>
      this.setActiveHighlight(element, false),
    );
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
}
