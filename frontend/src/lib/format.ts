/**
 * 日時フォーマット関数
 *
 * Requirements 4.2 に対応した日時表示ロジック
 * - 24時間以内: 「◯分前」「◯時間前」の相対表記
 * - 24時間以上: 「YYYY/MM/DD HH:mm」形式
 */

/**
 * 投稿日時を表示用フォーマットに変換する
 *
 * @param dateString - ISO 8601形式の日時文字列
 * @returns フォーマットされた日時文字列
 */
export function formatPostDate(dateString: string): string {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}

/**
 * 日時文字列を「YYYY/MM/DD HH:mm」形式にフォーマットする
 *
 * @param dateString - ISO 8601形式の日時文字列
 * @returns フォーマットされた日時文字列（例: 2024/01/15 14:30）
 */
export function formatAbsoluteDate(dateString: string): string {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}

/**
 * 日時文字列を相対表記にフォーマットする
 *
 * @param dateString - ISO 8601形式の日時文字列
 * @param now - 現在時刻（テスト用、省略時は Date.now()）
 * @returns 相対表記文字列（例: 「5分前」「3時間前」）
 */
export function formatRelativeDate(dateString: string, now?: Date): string {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}

/**
 * いいね数を短縮形式でフォーマットする
 *
 * @param count - いいね数
 * @returns フォーマットされた文字列（例: 1000以上は「1K」「10K」）
 */
export function formatLikeCount(count: number): string {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}
