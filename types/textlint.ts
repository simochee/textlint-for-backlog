import * as v from "valibot";

/**
 * Textlintのlint結果メッセージのスキーマ
 */
export const LintResultMessageSchema = v.object({
  column: v.number(),
  index: v.number(),
  line: v.number(),
  loc: v.object({
    start: v.object({
      line: v.number(),
      column: v.number(),
    }),
    end: v.object({
      line: v.number(),
      column: v.number(),
    }),
  }),
  message: v.string(),
  range: v.tuple([v.number(), v.number()]),
  ruleId: v.string(),
  severity: v.number(),
});

/**
 * Textlintのlint結果メッセージの型
 */
export type LintResultMessage = v.InferOutput<typeof LintResultMessageSchema>;

/**
 * Workerからのメッセージデータのスキーマ
 */
export const MessageDataSchema = v.object({
  command: v.literal("lint:result"),
  id: v.string(),
  result: v.object({
    filePath: v.string(),
    messages: v.array(LintResultMessageSchema),
  }),
});

/**
 * Workerからのメッセージデータの型
 */
export type MessageData = v.InferOutput<typeof MessageDataSchema>;
