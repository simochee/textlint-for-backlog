import * as v from "valibot";
import type { LintResultMessage } from "@/types/textlint";
import { MessageDataSchema } from "@/types/textlint";
export class TextlintWorker {
  private _worker: Worker | undefined;

  private _listeners = new Map<
    string,
    (results: LintResultMessage[] | null) => void
  >();

  constructor(private workerUrl: string) {}

  private get worker(): Worker {
    if (!this._worker) throw new Error("Worker is not loaded yet.");
    return this._worker;
  }

  /** Textlint Web Worker のスクリプトをロードする */
  public async load() {
    const res = await fetch(this.workerUrl);
    this._worker = new Worker(URL.createObjectURL(await res.blob()));

    this.worker.onmessage = async (event) => {
      try {
        const { id, result } = await v.parseAsync(
          MessageDataSchema,
          event.data,
        );

        this._listeners.get(id)?.(result.messages);
      } catch {
        // ignored
      }
    };
  }

  /** チェックを実行する */
  async lint(id: string, text: string) {
    const { promise, resolve, reject } =
      Promise.withResolvers<LintResultMessage[]>();

    // 実行中のハンドラー関数をキャンセル
    this._listeners.get(id)?.(null);
    this._listeners.delete(id);

    const timer = setTimeout(() => {
      this._listeners.delete(id);
      reject(new Error("TextlintWorker: Linting timed out"));
    }, 60_000);

    this._listeners.set(id, (results) => {
      clearTimeout(timer);
      this._listeners.delete(id);

      if (results != null) {
        resolve(results);
      }
    });

    this.worker.postMessage({
      id,
      command: "lint",
      text,
      ext: ".txt",
    });

    return await promise;
  }
}
