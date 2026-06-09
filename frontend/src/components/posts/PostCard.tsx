'use client';

/**
 * 投稿カードコンポーネント
 *
 * Requirements 3, 4 に対応
 * - 投稿情報（本文・ユーザー名・日時・コメント数・いいね数）を表示
 * - 200文字超の本文は省略表示
 * - 投稿者本人のみ削除ボタンを表示（削除確認ダイアログあり）
 * - いいねボタンのアクティブ/非アクティブ状態表示
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { formatPostDate } from '@/lib/format';
import { formatLikeCount } from '@/lib/format';
import type { Post, User } from '@/types';

const MAX_PREVIEW_LENGTH = 200;

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 自分の投稿かどうか
  const isOwner = currentUser !== null && post.user.id === currentUser.id;

  // 本文の省略処理（Requirement 4.2: 200文字超は省略）
  const isLongBody = [...post.body].length > MAX_PREVIEW_LENGTH;
  const displayBody = isLongBody
    ? [...post.body].slice(0, MAX_PREVIEW_LENGTH).join('') + '...'
    : post.body;

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onDelete?.(post.id);
  };

  return (
    <article className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      {/* ヘッダー: ユーザー名・日時・削除ボタン */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* ユーザー名 */}
          <span className="font-semibold text-gray-900">{post.user.username}</span>
          {/* 投稿日時（Requirement 4.2: 相対/絶対表記） */}
          <time
            dateTime={post.created_at}
            className="text-sm text-gray-500"
          >
            {formatPostDate(post.created_at)}
          </time>
        </div>

        {/* 削除ボタン（投稿者本人のみ表示: Requirement 3.5） */}
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            aria-label="削除"
            className="text-red-500 hover:text-red-700"
          >
            削除
          </Button>
        )}
      </div>

      {/* 投稿本文（Requirement 4.2: 200文字超は省略） */}
      <p
        data-testid="post-body"
        className="text-gray-800 whitespace-pre-wrap mb-3"
      >
        {displayBody}
      </p>

      {/* フッター: コメント数・いいねボタン */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {/* コメント数 */}
        <span className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {post.comments_count}
        </span>

        {/* いいねボタン（Requirements 6.1, 6.4） */}
        <button
          onClick={() => onLikeToggle?.(post.id)}
          aria-label="いいね"
          aria-pressed={post.liked_by_current_user}
          className={`flex items-center gap-1 transition-colors ${
            post.liked_by_current_user
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-500 hover:text-red-400'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={post.liked_by_current_user ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {formatLikeCount(post.likes_count)}
        </button>
      </div>

      {/* 削除確認ダイアログ（Requirement 3.6） */}
      {showDeleteDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="削除確認"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              投稿を削除しますか？
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteDialog(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
              >
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
