'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { validateEmail, validatePassword } from '@/lib/auth-validation';
import { Button, Input } from '@/components/ui';
import type { AuthResponse } from '@/types';

// フォームのバリデーションエラー
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginFormProps {
  /** ログイン成功時のコールバック */
  onSuccess: () => void;
}

/**
 * ログインフォームコンポーネント
 *
 * Requirements:
 * - Requirement 2.2: 認証情報が正しくない場合にエラーメッセージを表示
 * - Requirement 2.3: 5分間10回連続失敗で30分ロック
 * - Requirement 2.7: メールアドレス・パスワードのフォームバリデーション
 */
export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * クライアントサイドのバリデーションを実行する
   * @returns バリデーションが通過した場合 true
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // メールアドレスの検証
    if (!email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!validateEmail(email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    // パスワードの検証（ログインコンテキスト: 8〜72文字）
    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    } else {
      const passwordResult = validatePassword(password, 'login');
      if (!passwordResult.valid) {
        newErrors.password = passwordResult.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * フォーム送信ハンドラ
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション失敗時は処理中断
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await apiClient.post<AuthResponse>('/api/v1/auth/login', {
        email,
        password,
      });

      onSuccess();
    } catch (err) {
      if (err instanceof ApiClientError) {
        // APIエラーをUIに反映（メールアドレスは保持する）
        if (err.status === 401) {
          setErrors({
            general: err.message || 'メールアドレスまたはパスワードが正しくありません',
          });
        } else if (err.status === 429) {
          setErrors({
            general: err.message || 'アカウントがロックされています。しばらく経ってからお試しください',
          });
        } else {
          setErrors({
            general: err.message || 'ログインに失敗しました。しばらく経ってからお試しください',
          });
        }
      } else {
        setErrors({ general: 'ログインに失敗しました。しばらく経ってからお試しください' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="ログインフォーム">
      {/* 汎用エラーメッセージ */}
      {errors.general && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600"
        >
          {errors.general}
        </div>
      )}

      {/* メールアドレス入力 */}
      <div className="mb-4">
        <Input
          id="email"
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          disabled={isLoading}
          required
        />
      </div>

      {/* パスワード入力 */}
      <div className="mb-6">
        <Input
          id="password"
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          disabled={isLoading}
          required
        />
      </div>

      {/* ログインボタン */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        ログイン
      </Button>

      {/* 登録ページへのリンク */}
      <p className="mt-4 text-center text-sm text-gray-600">
        アカウントをお持ちでない方は{' '}
        <Link
          href="/register"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          新規登録
        </Link>
      </p>
    </form>
  );
}
