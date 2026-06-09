/**
 * 投稿バリデーション関数
 *
 * Requirements 3 に対応した投稿バリデーションロジック
 */

export interface PostValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 投稿本文のバリデーション
 *
 * Property 5: 1文字以上280文字以内かつ空白文字のみでない場合はバリデーション通過
 *
 * @param body - 投稿本文
 * @returns バリデーション結果
 */
export function validatePostBody(body: string): PostValidationResult {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}

/**
 * 投稿本文の文字数をカウントする
 *
 * @param body - 投稿本文
 * @returns 文字数
 */
export function countPostBodyLength(body: string): number {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}

/**
 * 投稿本文の残り文字数を返す
 *
 * @param body - 投稿本文
 * @param maxLength - 最大文字数（デフォルト: 280）
 * @returns 残り文字数
 */
export function getRemainingChars(body: string, maxLength = 280): number {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}
