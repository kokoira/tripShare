'use client';

/**
 * 投稿一覧取得フック（無限スクロール）
 *
 * Requirements 4.1, 4.3, 4.4, 4.5, 4.6 に対応
 */

import { useState, useCallback, useRef } from 'react';
import { apiClient, ApiClientError } from '@/lib/api-client';
import type { Post, TimelineResponse } from '@/types';

export type TimelineTab = 'all' | 'following';

export interface UsePostsOptions {
  /** タイムラインのタブ種別 */
  tab?: TimelineTab;
}

export interface UsePostsResult {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  /** 初回ロード */
  loadPosts: () => Promise<void>;
  /** 追加ロード（無限スクロール用） */
  loadMore: () => Promise<void>;
  /** 特定投稿をリストから除去（削除後の更新用） */
  removePost: (postId: number) => void;
  /** 投稿をリスト先頭に追加（投稿後の更新用） */
  prependPost: (post: Post) => void;
  /** いいね状態を更新する */
  updatePostLike: (postId: number, liked: boolean, likesCount: number) => void;
}

/**
 * タイムライン投稿一覧を管理するフック
 *
 * @param options - フックのオプション
 */
export function usePosts(options: UsePostsOptions = {}): UsePostsResult {
  const { tab = 'all' } = options;

  const [posts, setPosts]               = useState<Post[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [hasMore, setHasMore]           = useState(false);
  const cursorRef                       = useRef<string | null>(null);

  const getEndpoint = useCallback(() => {
    return tab === 'following'
      ? '/api/v1/timeline/following'
      : '/api/v1/posts';
  }, [tab]);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    cursorRef.current = null;

    try {
      const data = await apiClient.get<TimelineResponse>(getEndpoint());
      setPosts(data.posts);
      setHasMore(data.pagination.has_more);
      cursorRef.current = data.pagination.next_cursor;
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : '投稿の読み込みに失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getEndpoint]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !cursorRef.current) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const endpoint = `${getEndpoint()}?cursor=${encodeURIComponent(cursorRef.current)}`;
      const data = await apiClient.get<TimelineResponse>(endpoint);
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.pagination.has_more);
      cursorRef.current = data.pagination.next_cursor;
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : '追加の投稿読み込みに失敗しました';
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, getEndpoint]);

  const removePost = useCallback((postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const prependPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const updatePostLike = useCallback(
    (postId: number, liked: boolean, likesCount: number) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked_by_current_user: liked, likes_count: likesCount }
            : p,
        ),
      );
    },
    [],
  );

  return {
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
  };
}
