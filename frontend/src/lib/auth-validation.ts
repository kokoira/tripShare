/**
 * 認証関連バリデーション関数
 *
 * Requirements 1, 2 に対応したバリデーションロジック
 */

/**
 * メールアドレスのバリデーション
 *
 * RFC 5322に準拠した形式かどうかを検証する。
 * Requirement 1.2: メールアドレスの形式が不正な場合は登録を拒否
 * Requirement 2.7: メールアドレスがRFC 5322形式でない場合はログイン試行を実行しない
 *
 * @param email - 検証するメールアドレス
 * @returns バリデーション結果（true: 有効, false: 無効）
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim().length === 0) {
    return false;
  }

  // RFC 5322に準拠した基本的なメールアドレス形式チェック
  // ローカル部@ドメイン部の構造で、ドメイン部にはTLDが必要
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * パスワードバリデーションの結果
 */
export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * パスワードのバリデーション
 *
 * コンテキスト（登録 / ログイン）によって異なる制限を適用する:
 * - 登録時: 8文字以上128文字以下（Requirement 1.4）
 * - ログイン時: 8文字以上72文字以下（Requirement 2.7）
 *
 * @param password - 検証するパスワード
 * @param context - 'register'（登録）または 'login'（ログイン）
 * @returns バリデーション結果オブジェクト
 */
export function validatePassword(
  password: string,
  context: 'register' | 'login',
): PasswordValidationResult {
  if (!password || password.length === 0) {
    return {
      valid: false,
      error: 'パスワードを入力してください',
    };
  }

  const MIN_LENGTH = 8;
  const MAX_LENGTH_REGISTER = 128;
  const MAX_LENGTH_LOGIN = 72;

  if (password.length < MIN_LENGTH) {
    return {
      valid: false,
      error: `パスワードは${MIN_LENGTH}文字以上で入力してください`,
    };
  }

  if (context === 'register' && password.length > MAX_LENGTH_REGISTER) {
    return {
      valid: false,
      error: `パスワードは${MAX_LENGTH_REGISTER}文字以下で入力してください`,
    };
  }

  if (context === 'login' && password.length > MAX_LENGTH_LOGIN) {
    return {
      valid: false,
      error: `パスワードは${MAX_LENGTH_LOGIN}文字以下で入力してください`,
    };
  }

  return { valid: true };
}
