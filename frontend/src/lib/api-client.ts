/**
 * API クライアント層（スケルトン）
 * タスク 1.4 で詳細実装予定
 */

import type { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * カスタム API エラークラス
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errors?: { field: string; message: string }[];

  constructor(apiError: ApiError) {
    super(apiError.error ?? 'API エラーが発生しました');
    this.name = 'ApiClientError';
    this.status = apiError.status;
    this.errors = apiError.errors;
  }
}

/**
 * fetch ラッパー（Cookie送信・エラーハンドリング付き）
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Cookie を含める
  };

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      let errorBody: ApiError;
      try {
        errorBody = await response.json();
        errorBody.status = response.status;
      } catch {
        errorBody = {
          status: response.status,
          error: `HTTP ${response.status} エラー`,
        };
      }

      // 構造化エラーログ出力（開発環境）
      if (process.env.NODE_ENV === 'development') {
        console.error('[API Error]', {
          url,
          status: response.status,
          error: errorBody,
        });
      }

      throw new ApiClientError(errorBody);
    }

    // 204 No Content の場合は空オブジェクトを返す
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw err;
    }

    // ネットワークエラー等
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Network Error]', { url, error: err });
    }
    throw new ApiClientError({
      status: 0,
      error: 'ネットワークエラーが発生しました',
    });
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
