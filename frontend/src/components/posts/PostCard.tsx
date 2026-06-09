'use client';

/**
 * 投稿カードコンポーネント（スタブ）
 *
 * タスク 4.4 で詳細実装予定
 * Requirements 3, 4
 */

import type { Post, User } from '@/types';

export interface PostCardProps {
  /** 投稿データ */
  post: Post;
  /** ログイン中のユーザー（削除ボタン表示判定に使用） */
  currentUser: Pick<User, 'id' | 'username'> | null;
  /** いいねボタンクリック時のコールバック */
  onLikeToggle?: (postId: number) => void;
  /** 削除ボタンクリック時のコールバック */
  onDelete?: (postId: number) => void;
}

/**
 * 投稿カードコンポーネント
 * タイムラインの各投稿を表示する
 */
export default function PostCard({
  post,
  currentUser,
  onLikeToggle,
  onDelete,
}: PostCardProps) {
  // タスク 4.4 で実装予定
  throw new Error('Not implemented');
}
