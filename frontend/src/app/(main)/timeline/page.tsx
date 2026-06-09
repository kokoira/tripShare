'use client';

/**
 * タイムラインページ
 *
 * Requirements 3, 4, 8 に対応
 * - 全体 / フォロー中のタブ切り替え
 * - 投稿一覧（無限スクロール、カーソルベースページネーション）
 * - 投稿作成フォーム
 * - 投稿削除
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePosts, type TimelineTab } from '@/hooks/usePosts';
import { useRouter, useSearchParams } from 'next/navigation';
import PostCard from '@/components/posts/PostCard';
import PostForm from '@/components/posts/PostForm';
import { Loading } from '@/components/ui';
import { apiClient, ApiClientError } from '@/lib/api-client';
import type { Post } from '@/types';

export default function TimelinePage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const tab          = (searchParams.get('tab') as TimelineTab) ?? 'all';

  const { user, isLoading: authLoading } = useAuth();

  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadPosts,
    loadMore,
    removePost,
    prependPost,
    updatePostLike,
  } = usePosts({ tab });

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // 初回ロード
  useEffect(() => {
    if (user) {
      void loadPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab]);

  // 無限スクロール用 IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreCallback = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      void loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreCallback();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreCallback]);

  // 投稿削除ハンドラ
  const handleDelete = async (postId: number) => {
    try {
      await apiClient.delete(`/api/v1/posts/${postId}`);
      removePost(postId);
    } catch (err) {
      console.error('削除に失敗しました:', err);
    }
  };

  // いいねトグルハンドラ
  const handleLikeToggle = async (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    try {
      if (post.liked_by_current_user) {
        await apiClient.delete(`/api/v1/posts/${postId}/likes`);
        updatePostLike(postId, false, post.likes_count - 1);
      } else {
        await apiClient.post(`/api/v1/posts/${postId}/likes`);
        updatePostLike(postId, true, post.likes_count + 1);
      }
    } catch (err) {
      console.error('いいね操作に失敗しました:', err);
    }
  };

  // 投稿成功ハンドラ
  const handlePostSuccess = (newPost: Post) => {
    prependPost(newPost);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* タブ切り替え（Requirement 8.7, 8.8） */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => router.push('/timeline?tab=all')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            tab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-selected={tab === 'all'}
        >
          全体
        </button>
        <button
          onClick={() => router.push('/timeline?tab=following')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            tab === 'following'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-selected={tab === 'following'}
        >
          フォロー中
        </button>
      </div>

      {/* 投稿フォーム */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <PostForm onSuccess={handlePostSuccess} />
      </div>

      {/* 投稿一覧 */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loading size="md" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-3">{error}</p>
          <button
            onClick={() => void loadPosts()}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            再読み込み
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {tab === 'following'
            ? 'フォロー中のユーザーの投稿がありません'
            : 'まだ投稿がありません'}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onDelete={handleDelete}
              onLikeToggle={handleLikeToggle}
            />
          ))}

          {/* 無限スクロール センチネル */}
          <div ref={sentinelRef} className="h-4" aria-hidden="true" />

          {/* 追加ロード中 */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <Loading size="sm" />
            </div>
          )}

          {/* 全件読み込み済み（Requirement 4.4） */}
          {!hasMore && posts.length > 0 && (
            <p className="text-center text-gray-400 text-sm py-4">
              すべての投稿を読み込みました
            </p>
          )}
        </div>
      )}
    </div>
  );
}
