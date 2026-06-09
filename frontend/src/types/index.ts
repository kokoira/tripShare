/**
 * TripShare 共通型定義
 */

// ユーザー
export interface User {
  id: number;
  email: string;
  username: string;
  avatar_key: string | null;
  following_count: number;
  followers_count: number;
  created_at: string;
}

// 投稿
export interface Post {
  id: number;
  user: Pick<User, 'id' | 'username' | 'avatar_key'>;
  body: string;
  comments_count: number;
  likes_count: number;
  liked_by_current_user: boolean;
  images: PostImage[];
  created_at: string;
}

// 投稿画像
export interface PostImage {
  id: number;
  image_key: string;
  thumbnail_key: string | null;
  position: number;
}

// コメント
export interface Comment {
  id: number;
  user: Pick<User, 'id' | 'username' | 'avatar_key'>;
  body: string;
  created_at: string;
}

// いいね
export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}

// フォロー
export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

// 認証レスポンス
export interface AuthResponse {
  user: User;
  message: string;
}

// APIエラー
export interface ApiError {
  status: number;
  errors?: { field: string; message: string }[];
  error?: string;
}

// ページネーション（カーソルベース）
export interface Pagination {
  next_cursor: string | null;
  has_more: boolean;
}

// タイムラインレスポンス
export interface TimelineResponse {
  posts: Post[];
  pagination: Pagination;
}

// ユーザー検索レスポンス
export interface UserSearchResponse {
  users: User[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Presigned URL レスポンス
export interface PresignedUrlResponse {
  presigned_url: string;
  object_key: string;
}

// コメント一覧レスポンス
export interface CommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

// トースト通知の型
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
