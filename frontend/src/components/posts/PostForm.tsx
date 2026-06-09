'use client';

/**
 * 投稿フォームコンポーネント
 *
 * Requirements 3 に対応
 * - 1〜280文字の本文を入力して投稿できる
 * - 文字数カウンターを表示
 * - バリデーション（空・空白のみ・280文字超）
 * - 投稿成功後にフォームをクリア
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { validatePostBody, countPostBodyLength, getRemainingChars } from '@/lib/post-validation';
import type { Post } from '@/types';

const MAX_BODY_LENGTH = 280;

export interface PostFormProps {
  /** 投稿成功時のコールバック */
  onSuccess?: (post: Post) => void;
  /** 投稿中かどうか（外部から制御する場合） */
  isLoading?: boolean;
}

/**
 * 投稿フォームコンポーネント
 * 新しい旅行記録を投稿する
 */
export default function PostForm({ onSuccess, isLoading: externalLoading }: PostFormProps) {
  const [body, setBody]       = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = externalLoading ?? isSubmitting;
  const remaining = getRemainingChars(body);
  const charCount = countPostBodyLength(body);
  const isExceeded = remaining < 0;
  const isDisabled = isLoading || isExceeded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // クライアントサイドバリデーション
    const validation = validatePostBody(body);
    if (!validation.valid) {
      setError(validation.error ?? '入力内容を確認してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiClient.post<{ post: Post }>('/api/v1/posts', { body });
      setBody('');
      setError(null);
      onSuccess?.(data.post);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('投稿に失敗しました。しばらく経ってからお試しください');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="投稿フォーム"
    >
      {/* エラーメッセージ */}
      {error && (
        <div
          role="alert"
          className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* テキストエリア */}
      <div className="mb-2">
        <textarea
          id="post-body"
          aria-label="本文"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(null);
          }}
          placeholder="旅行記録を入力してください..."
          rows={4}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* フッター: 文字数カウンター + 投稿ボタン */}
      <div className="flex items-center justify-between">
        {/* 文字数カウンター（Requirement 3.3） */}
        <span
          data-testid="char-counter"
          data-exceeded={isExceeded ? 'true' : 'false'}
          className={`text-sm ${isExceeded ? 'text-red-500 font-semibold' : 'text-gray-500'}`}
        >
          {remaining}
        </span>

        {/* 投稿ボタン */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isDisabled}
          loading={isSubmitting}
        >
          投稿
        </Button>
      </div>
    </form>
  );
}
