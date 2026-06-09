'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

/**
 * ログインページ
 *
 * Requirements:
 * - Requirement 2.1: 正しい認証情報でログイン → タイムライン画面へ遷移
 * - Requirement 2.2: 誤認証情報 → エラーメッセージ表示
 * - Requirement 2.7: フォームバリデーション
 */
export default function LoginPage() {
  const router = useRouter();

  /**
   * ログイン成功時にタイムライン画面へ遷移する
   */
  const handleLoginSuccess = () => {
    router.replace('/timeline');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-md">
        {/* アプリタイトル */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">TripShare</h1>
          <p className="mt-2 text-gray-500 text-sm">旅行記録を共有しよう</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">ログイン</h2>

        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
