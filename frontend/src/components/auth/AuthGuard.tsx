'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/ui';

interface AuthGuardProps {
  children: React.ReactNode;
  /** リダイレクト先（デフォルト: /login） */
  redirectTo?: string;
}

/**
 * 認証ガードコンポーネント
 *
 * 未認証ユーザーをログイン画面へリダイレクトする。
 *
 * Requirements:
 * - Requirement 2.5: 未認証状態でのタイムライン・投稿画面へのアクセス拒否
 * - Requirement 2.6: セッション期限切れ時の再ログイン要求
 */
export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 認証状態の確認が完了し、未認証の場合はリダイレクト
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // 認証確認中はローディング表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" label="認証確認中..." />
      </div>
    );
  }

  // 未認証の場合は何も表示しない（useEffectでリダイレクトされる）
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
