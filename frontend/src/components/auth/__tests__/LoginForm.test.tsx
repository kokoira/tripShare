/**
 * LoginForm コンポーネントテスト
 *
 * TDD Red フェーズ: コンポーネント実装（タスク2.4）に先行してテストを作成する。
 * LoginForm コンポーネントはまだ存在しないため、このテストは初期状態でFAILする。
 *
 * Requirements:
 * - Requirement 2.2: 認証情報が正しくない場合にエラーメッセージを表示
 * - Requirement 2.7: メールアドレス・パスワードのフォームバリデーション
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// NOTE: LoginForm はタスク2.4で実装予定。このimportは現時点でREDとなる。
import LoginForm from '../LoginForm';

// ===== モック設定 =====

// APIクライアントのモック
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    status: number;
    errors?: { field: string; message: string }[];
    constructor(apiError: { status: number; error?: string; errors?: { field: string; message: string }[] }) {
      super(apiError.error ?? 'API エラー');
      this.name = 'ApiClientError';
      this.status = apiError.status;
      this.errors = apiError.errors;
    }
  },
}));

// ===== テストスイート =====

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- レンダリング ----

  it('フォームが正しくレンダリングされる', () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    // メールアドレス入力フィールド
    expect(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
    ).toBeInTheDocument();

    // パスワード入力フィールド（type="password" は role="textbox" ではないので getByLabelText を使用）
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();

    // ログインボタン
    expect(
      screen.getByRole('button', { name: /ログイン/i }),
    ).toBeInTheDocument();
  });

  it('登録ページへのリンクが表示される', () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    // 新規登録リンクが存在する
    expect(screen.getByRole('link', { name: /新規登録/i })).toBeInTheDocument();
  });

  // ---- バリデーション: 空入力 ----

  it('空のままログインボタンを押すとバリデーションエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    // メールアドレスのエラーメッセージ
    expect(
      await screen.findByText(/メールアドレスを入力してください/i),
    ).toBeInTheDocument();

    // パスワードのエラーメッセージ
    expect(
      await screen.findByText(/パスワードを入力してください/i),
    ).toBeInTheDocument();
  });

  // ---- バリデーション: メールアドレス形式 ----

  it('不正なメール形式でエラーが表示される（Requirement 2.7）', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'invalid-email',
    );
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    expect(
      await screen.findByText(/有効なメールアドレスを入力してください/i),
    ).toBeInTheDocument();
  });

  it('@なしのメールアドレスでエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'userexample.com',
    );
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    expect(
      await screen.findByText(/有効なメールアドレスを入力してください/i),
    ).toBeInTheDocument();
  });

  // ---- バリデーション: パスワード長 ----

  it('パスワードが7文字以下のときエラーが表示される（Requirement 2.7）', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), '1234567');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    expect(
      await screen.findByText(/パスワードは8文字以上/i),
    ).toBeInTheDocument();
  });

  it('パスワードが73文字以上のときエラーが表示される（Requirement 2.7）', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'a'.repeat(73));
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    expect(
      await screen.findByText(/パスワードは72文字以下/i),
    ).toBeInTheDocument();
  });

  // ---- 送信処理 ----

  it('有効な入力でonSuccessが呼び出される', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockResolvedValue({
      user: {
        id: 1,
        email: 'user@example.com',
        username: 'testuser',
        avatar_key: null,
        following_count: 0,
        followers_count: 0,
        created_at: '2024-01-01T00:00:00Z',
      },
      message: 'ログインしました',
    });

    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  // ---- ローディング状態 ----

  it('ローディング中はログインボタンが無効化される', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    // 解決されない Promise でローディング状態を維持
    mockPost.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    // ボタンが無効化されている
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeDisabled();
  });

  // ---- APIエラー ----

  it('認証失敗（401）のとき適切なエラーメッセージが表示される（Requirement 2.2）', async () => {
    const { apiClient, ApiClientError } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValue(
      new ApiClientError({
        status: 401,
        error: 'メールアドレスまたはパスワードが正しくありません',
      }),
    );

    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    expect(
      await screen.findByText(/メールアドレスまたはパスワードが正しくありません/i),
    ).toBeInTheDocument();
  });

  it('アカウントロック（429）のとき適切なエラーメッセージが表示される（Requirement 2.3）', async () => {
    const { apiClient, ApiClientError } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValue(
      new ApiClientError({
        status: 429,
        error: 'アカウントがロックされています。しばらく経ってからお試しください',
      }),
    );

    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'locked@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    expect(
      await screen.findByText(/アカウントがロックされています/i),
    ).toBeInTheDocument();
  });

  it('エラー後にメールアドレスが保持される（Requirement 2.2）', async () => {
    const { apiClient, ApiClientError } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValue(
      new ApiClientError({
        status: 401,
        error: 'メールアドレスまたはパスワードが正しくありません',
      }),
    );

    const user = userEvent.setup();
    render(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByRole('textbox', { name: /メールアドレス/i });
    await user.type(emailInput, 'user@example.com');
    await user.type(screen.getByLabelText(/パスワード/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    // エラー後にメールアドレスが保持されている
    await waitFor(() => {
      expect(emailInput).toHaveValue('user@example.com');
    });
  });
});
