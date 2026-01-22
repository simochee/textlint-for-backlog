import debounce from "debounce";

/**
 * CSS Highlights APIを使用してハイライトを管理するクラス
 */
export class HighlightManager {
  private rangesMap = new Map<string, Range[]>();
  private highlightName: string;
  private debounceDelay: number;

  /**
   * レンダリング処理をdebounceでラップした関数
   */
  private renderRange: () => void;

  /**
   * @param highlightName - CSS.highlightsに設定するハイライト名
   * @param debounceDelay - レンダリングのdebounce遅延時間(ミリ秒)
   */
  constructor(
    highlightName: string = "textlint-error",
    debounceDelay: number = 100,
  ) {
    this.highlightName = highlightName;
    this.debounceDelay = debounceDelay;
    this.renderRange = debounce(this.render.bind(this), debounceDelay);
  }

  /**
   * 指定されたIDに紐づくRangeを設定し、ハイライトを更新する
   */
  public setRanges(id: string, ranges: Range[]): void {
    this.rangesMap.set(id, ranges);
    this.renderRange();
  }

  /**
   * 指定されたIDに紐づくRangeを削除し、ハイライトを更新する
   */
  public deleteRanges(id: string): void {
    this.rangesMap.delete(id);
    this.renderRange();
  }

  /**
   * すべてのRangeをクリアする
   */
  public clearAll(): void {
    this.rangesMap.clear();
    this.render();
  }

  /**
   * 現在のRangeからHighlightを生成してCSS.highlightsに設定する
   */
  private render(): void {
    const allRanges = [...this.rangesMap.values()].flat();
    const highlight = new Highlight(...allRanges);
    CSS.highlights.set(this.highlightName, highlight);
  }

  /**
   * 管理しているRange数を取得する
   */
  public getRangeCount(): number {
    return [...this.rangesMap.values()].reduce(
      (sum, ranges) => sum + ranges.length,
      0,
    );
  }

  /**
   * 管理しているID数を取得する
   */
  public getIdCount(): number {
    return this.rangesMap.size;
  }
}
