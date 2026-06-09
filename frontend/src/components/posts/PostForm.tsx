'use client';

/**
 * 投稿フォームコンポーネント（スタブ）
 *
 * タスク 4.4 で詳細実装予定
 * Requirements 3
 */

export interface PostFormProps {
  /** 投稿成功時のコールバック */
  onSuccess?: () => void;
  /** 投稿中かどうか */
  isLoading?: boolean;
}

/**
 * 投稿フォームコンポーネント
 * 新しい旅行記録を投稿する
 */
export default function PostForm({ onSuccess, isLoading }: PostFormProps) {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}
