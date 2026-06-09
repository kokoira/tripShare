/**
 * 日時フォーマット関数
 *
 * Requirements 4.2 に対応した日時表示ロジック
 * - 24時間以内: 「◯分前」「◯時間前」の相対表記
 * - 24時間以上: 「YYYY/MM/DD HH:mm」形式
 */

/**
 * 日時文字列を「YYYY/MM/DD HH:mm」形式にフォーマットする
 *
 * @param dateString - ISO 8601形式の日時文字列
 * @returns フォーマットされた日時文字列（例: 2024/01/15 14:30）
 */
export function formatAbsoluteDate(dateString: string): string {
  const date = new Date(dateString);
  const year   = date.getFullYear();
  const month  = String(date.getMonth() + 1).padStart(2, '0');
  const day    = String(date.getDate()).padStart(2, '0');
  const hour   = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hour}:${minute}`;
}

/**
 * 日時文字列を相対表記にフォーマットする
 *
 * @param dateString - ISO 8601形式の日時文字列
 * @param now - 現在時刻（テスト用、省略時は new Date()）
 * @returns 相対表記文字列（例: 「5分前」「3時間前」）
 */
export function formatRelativeDate(dateString: string, now?: Date): string {
  const date    = new Date(dateString);
  const current = now ?? new Date();
  const diffMs  = current.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) {
    return '今';
  }
  if (diffMin < 60) {
    return `${diffMin}分前`;
  }
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}時間前`;
}

/**
 * 投稿日時を表示用フォーマットに変換する
 * - 24時間以内の投稿: 相対表記（◯分前・◯時間前）
 * - 24時間以上前の投稿: 「YYYY/MM/DD HH:mm」形式
 *
 * @param dateString - ISO 8601形式の日時文字列
 * @returns フォーマットされた日時文字列
 */
export function formatPostDate(dateString: string): string {
  const date   = new Date(dateString);
  const now    = new Date();
  const diffMs = now.getTime() - date.getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (diffMs < twentyFourHours) {
    return formatRelativeDate(dateString, now);
  }
  return formatAbsoluteDate(dateString);
}

/**
 * いいね数を短縮形式でフォーマットする
 * 1000以上は「1K」「1.5K」「10K」等の短縮形式
 *
 * Property 14: 1000以上の整数に対して短縮形式を返す
 *
 * @param count - いいね数
 * @returns フォーマットされた文字列
 */
export function formatLikeCount(count: number): string {
  if (count < 1000) {
    return String(count);
  }
  const k = count / 1000;
  // 小数点以下が不要な場合は省略（例: 1.0K → 1K）
  const formatted = k % 1 === 0 ? String(k) : k.toFixed(1);
  return `${formatted}K`;
}
