'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiClientError } from '@/lib/api-client';
import type { User, AuthResponse } from '@/types';

/**
 * 認証状態の型定義
 */
export interface AuthState {
  /** 現在ログイン中のユーザー（未認証時は null）*/
  user: User | null;
  /** 認証状態の読み込み中フラグ */
  isLoading: boolean;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
}

/**
 * 認証状態管理フック
 *
 * Requirements:
 * - Requirement 2.4: ログアウト時にセッション破棄とログイン画面への遷移
 * - Requirement 2.5: 未認証状態でのアクセス拒否
 * - Requirement 2.6: セッション24時間超過で無効化
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /**
   * 現在の認証状態を取得する（マウント時に実行）
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/api/v1/auth/me');
      setAuthState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (err) {
      // 401はセッション切れまたは未認証
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      // 開発環境でのログ
      if (process.env.NODE_ENV === 'development' && !(err instanceof ApiClientError && err.status === 401)) {
        console.error('[useAuth] ユーザー情報取得エラー:', err);
      }
    }
  }, []);

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  /**
   * ログイン処理
   *
   * @param email - メールアドレス
   * @param password - パスワード
   * @returns ログインしたユーザー情報
   */
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', {
      email,
      password,
    });

    setAuthState({
      user: response.user,
      isLoading: false,
      isAuthenticated: true,
    });

    return response.user;
  }, []);

  /**
   * ユーザー登録処理
   *
   * @param email - メールアドレス
   * @param password - パスワード
   * @param username - ユーザー名（省略可。省略時はemailのローカル部を使用）
   * @returns 登録したユーザー情報
   */
  const register = useCallback(async (
    email: string,
    password: string,
    username?: string,
  ): Promise<User> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', {
      email,
      password,
      ...(username ? { username } : {}),
    });

    setAuthState({
      user: response.user,
      isLoading: false,
      isAuthenticated: true,
    });

    return response.user;
  }, []);

  /**
   * ログアウト処理
   *
   * Requirement 2.4: セッションを破棄してログイン画面へ遷移
   */
  const logout = useCallback(async () => {
    try {
      await apiClient.delete('/api/v1/auth/logout');
    } catch (err) {
      // ログアウトAPIが失敗してもローカル状態はクリアする
      if (process.env.NODE_ENV === 'development') {
        console.error('[useAuth] ログアウトエラー:', err);
      }
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    refetch: fetchCurrentUser,
  };
}
