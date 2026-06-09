/**
 * 投稿バリデーション関数
 *
 * Requirements 3 に対応した投稿バリデーションロジック
 * Property 5: 1文字以上280文字以内かつ空白文字のみでない場合はバリデーション通過
 */

export interface PostValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_BODY_LENGTH = 280;

/**
 * 投稿本文のバリデーション
 *
 * @param body - 投稿本文
 * @returns バリデーション結果
 */
export function validatePostBody(body: string): PostValidationResult {
  if (!body || body.length === 0) {
    return { valid: false, error: '本文を入力してください' };
  }

  if (body.trim().length === 0) {
    return { valid: false, error: '空白のみの投稿は保存できません' };
  }

  if (body.length > MAX_BODY_LENGTH) {
    return {
      valid: false,
      error: `${MAX_BODY_LENGTH}文字以内で入力してください（現在${body.length}文字）`,
    };
  }

  return { valid: true };
}

/**
 * 投稿本文の文字数をカウントする
 * マルチバイト文字（絵文字等）も1文字としてカウント
 *
 * @param body - 投稿本文
 * @returns 文字数
 */
export function countPostBodyLength(body: string): number {
  // スプレッド演算子でUnicodeコードポイント単位に分割（絵文字等も1文字）
  return [...body].length;
}

/**
 * 投稿本文の残り文字数を返す
 *
 * @param body - 投稿本文
 * @param maxLength - 最大文字数（デフォルト: 280）
 * @returns 残り文字数（マイナスになる場合あり）
 */
export function getRemainingChars(body: string, maxLength = MAX_BODY_LENGTH): number {
  return maxLength - countPostBodyLength(body);
}
