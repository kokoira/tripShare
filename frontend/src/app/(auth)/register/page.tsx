'use client';

import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

/**
 * ユーザー登録ページ
 *
 * Requirements:
 * - Requirement 1.1: アカウント作成 → セッション開始 → ホーム画面へ遷移
 * - Requirement 1.2: メールアドレス形式バリデーション
 * - Requirement 1.3: 既存メールアドレスのエラー表示
 * - Requirement 1.4: パスワード長バリデーション
 * - Requirement 1.5: 未入力バリデーション
 */
export default function RegisterPage() {
  const router = useRouter();

  /**
   * 登録成功時にタイムライン画面へ遷移する
   */
  const handleRegisterSuccess = () => {
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

        <h2 className="text-xl font-semibold text-gray-800 mb-6">アカウント登録</h2>

        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
}
