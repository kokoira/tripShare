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

interface RegisterFormProps {
  /** 登録成功時のコールバック */
  onSuccess: () => void;
}

/**
 * ユーザー登録フォームコンポーネント
 *
 * Requirements:
 * - Requirement 1.1: アカウント作成とセッション開始
 * - Requirement 1.2: メールアドレス形式バリデーション
 * - Requirement 1.3: 既に登録済みのメールアドレスのエラー
 * - Requirement 1.4: パスワード長バリデーション（8〜128文字）
 * - Requirement 1.5: 未入力バリデーション
 * - Requirement 1.7: システムエラー時の処理
 */
export default function RegisterForm({ onSuccess }: RegisterFormProps) {
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

    // パスワードの検証（登録コンテキスト: 8〜128文字）
    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    } else {
      const passwordResult = validatePassword(password, 'register');
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
      await apiClient.post<AuthResponse>('/api/v1/auth/register', {
        email,
        password,
      });

      onSuccess();
    } catch (err) {
      if (err instanceof ApiClientError) {
        // フィールドエラーがある場合は対応するフィールドに表示
        if (err.errors && err.errors.length > 0) {
          const newErrors: FormErrors = {};
          for (const fieldError of err.errors) {
            if (fieldError.field === 'email') {
              newErrors.email = fieldError.message;
            } else if (fieldError.field === 'password') {
              newErrors.password = fieldError.message;
            } else {
              newErrors.general = fieldError.message;
            }
          }
          setErrors(newErrors);
        } else {
          // 汎用エラーメッセージを表示
          setErrors({
            general: err.message || '登録が完了しませんでした。しばらく経ってからお試しください',
          });
        }
      } else {
        setErrors({ general: '登録が完了しませんでした。しばらく経ってからお試しください' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="ユーザー登録フォーム">
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
          autoComplete="new-password"
          disabled={isLoading}
          required
        />
      </div>

      {/* 登録ボタン */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        新規登録
      </Button>

      {/* ログインページへのリンク */}
      <p className="mt-4 text-center text-sm text-gray-600">
        既にアカウントをお持ちの方は{' '}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ログイン
        </Link>
      </p>
    </form>
  );
}
