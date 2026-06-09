'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * ルートページ
 *
 * 認証状態に応じて適切なページへリダイレクトする:
 * - 認証済み → /timeline
 * - 未認証   → /login
 *
 * Requirement 2.5: 未認証ユーザーはタイムライン画面へのアクセスを拒否
 */
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/timeline');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 認証確認中はローディング表示
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">読み込み中...</p>
    </div>
  );
}
