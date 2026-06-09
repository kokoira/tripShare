'use client';

/**
 * 投稿詳細ページ
 *
 * Requirements 3, 4 に対応
 * - 投稿本文・画像・コメント一覧を表示
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PostCard from '@/components/posts/PostCard';
import { Loading } from '@/components/ui';
import { apiClient, ApiClientError } from '@/lib/api-client';
import type { Post } from '@/types';

export default function PostDetailPage() {
  const params   = useParams<{ id: string }>();
  const router   = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [post, setPost]           = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // 投稿詳細取得
  useEffect(() => {
    if (!user || !params.id) return;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.get<{ post: Post }>(`/api/v1/posts/${params.id}`);
        setPost(data.post);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          setError('投稿が見つかりません');
        } else {
          setError('投稿の読み込みに失敗しました');
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPost();
  }, [user, params.id]);

  // 削除ハンドラ
  const handleDelete = async (postId: number) => {
    try {
      await apiClient.delete(`/api/v1/posts/${postId}`);
      router.push('/timeline');
    } catch (err) {
      console.error('削除に失敗しました:', err);
    }
  };

  // いいねトグルハンドラ
  const handleLikeToggle = async (postId: number) => {
    if (!post) return;
    try {
      if (post.liked_by_current_user) {
        await apiClient.delete(`/api/v1/posts/${postId}/likes`);
        setPost((prev) =>
          prev ? { ...prev, liked_by_current_user: false, likes_count: prev.likes_count - 1 } : prev,
        );
      } else {
        await apiClient.post(`/api/v1/posts/${postId}/likes`);
        setPost((prev) =>
          prev ? { ...prev, liked_by_current_user: true, likes_count: prev.likes_count + 1 } : prev,
        );
      }
    } catch (err) {
      console.error('いいね操作に失敗しました:', err);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-red-500 mb-4">{error ?? '投稿が見つかりません'}</p>
        <button
          onClick={() => router.push('/timeline')}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          タイムラインに戻る
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        戻る
      </button>

      {/* 投稿カード */}
      <PostCard
        post={post}
        currentUser={user}
        onDelete={handleDelete}
        onLikeToggle={handleLikeToggle}
      />
    </div>
  );
}
