'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ルートページ
 * 認証状態に応じてタイムラインまたはログイン画面へリダイレクト
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // TODO: 認証状態を確認し、適切なページへリダイレクト
    // 認証済み → /timeline
    // 未認証   → /login
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">読み込み中...</p>
    </div>
  );
}
