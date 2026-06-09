/**
 * RegisterForm コンポーネントテスト
 *
 * TDD Red フェーズ: コンポーネント実装（タスク2.4）に先行してテストを作成する。
 * RegisterForm コンポーネントはまだ存在しないため、このテストは初期状態でFAILする。
 *
 * Requirements:
 * - Requirement 1.1: アカウント作成とセッション開始
 * - Requirement 1.2: メールアドレス形式バリデーション
 * - Requirement 1.3: 既に登録済みのメールアドレスのエラー
 * - Requirement 1.4: パスワード長バリデーション（8〜128文字）
 * - Requirement 1.5: 未入力バリデーション
 * - Requirement 1.7: システムエラー時の処理
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// NOTE: RegisterForm はタスク2.4で実装予定。このimportは現時点でREDとなる。
import RegisterForm from '../RegisterForm';

// ===== モック設定 =====

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

describe('RegisterForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- レンダリング ----

  it('フォームが正しくレンダリングされる', () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    // メールアドレス入力フィールド
    expect(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
    ).toBeInTheDocument();

    // パスワード入力フィールド
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();

    // 登録ボタン
    expect(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    ).toBeInTheDocument();
  });

  it('ログインページへのリンクが表示される', () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    // ログインページへのリンクが存在する
    expect(
      screen.getByRole('link', { name: /ログイン|既にアカウントをお持ちの方/i }),
    ).toBeInTheDocument();
  });

  // ---- バリデーション: 空入力（Requirement 1.5） ----

  it('空のまま登録ボタンを押すとバリデーションエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    // メールアドレスのエラーメッセージ
    expect(
      await screen.findByText(/メールアドレスを入力してください/i),
    ).toBeInTheDocument();

    // パスワードのエラーメッセージ
    expect(
      await screen.findByText(/パスワードを入力してください/i),
    ).toBeInTheDocument();
  });

  // ---- バリデーション: メールアドレス形式（Requirement 1.2） ----

  it('不正なメール形式でエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'invalid-email',
    );
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    expect(
      await screen.findByText(/有効なメールアドレスを入力してください/i),
    ).toBeInTheDocument();
  });

  it('@なしのメールアドレスでエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'notanemail',
    );
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    expect(
      await screen.findByText(/有効なメールアドレスを入力してください/i),
    ).toBeInTheDocument();
  });

  // ---- バリデーション: パスワード長（Requirement 1.4） ----

  it('パスワードが7文字以下のときエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), '1234567');
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    expect(
      await screen.findByText(/パスワードは8文字以上/i),
    ).toBeInTheDocument();
  });

  it('パスワードが129文字以上のときエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'a'.repeat(129));
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    expect(
      await screen.findByText(/パスワードは128文字以下/i),
    ).toBeInTheDocument();
  });

  // ---- 送信処理 ----

  it('有効な入力でonSuccessが呼び出される（Requirement 1.1）', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockResolvedValue({
      user: {
        id: 2,
        email: 'newuser@example.com',
        username: 'newuser',
        avatar_key: null,
        following_count: 0,
        followers_count: 0,
        created_at: '2024-01-01T00:00:00Z',
      },
      message: 'アカウントを作成しました',
    });

    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'newuser@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'securepassword');
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  // ---- ローディング状態 ----

  it('ローディング中は登録ボタンが無効化される', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'password123');
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    // ボタンが無効化されている
    expect(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    ).toBeDisabled();
  });

  // ---- APIエラー ----

  it('既存メールアドレス（409）のエラーが適切に表示される（Requirement 1.3）', async () => {
    const { apiClient, ApiClientError } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValue(
      new ApiClientError({
        status: 409,
        errors: [
          {
            field: 'email',
            message: 'このメールアドレスは既に使用されています',
          },
        ],
      }),
    );

    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'existing@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'password123');
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    expect(
      await screen.findByText(/このメールアドレスは既に使用されています/i),
    ).toBeInTheDocument();
  });

  it('サーバーエラー（500）のとき汎用エラーメッセージが表示される（Requirement 1.7）', async () => {
    const { apiClient, ApiClientError } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValue(
      new ApiClientError({
        status: 500,
        error: '登録が完了しませんでした。しばらく経ってからお試しください',
      }),
    );

    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'user@example.com',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'password123');
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    expect(
      await screen.findByText(/登録が完了しませんでした/i),
    ).toBeInTheDocument();
  });

  it('バリデーションエラーのフィールドが正しく表示される', async () => {
    const { apiClient, ApiClientError } = await import('@/lib/api-client');
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValue(
      new ApiClientError({
        status: 422,
        errors: [
          { field: 'email', message: 'メールアドレスの形式が不正です' },
        ],
      }),
    );

    const user = userEvent.setup();
    render(<RegisterForm onSuccess={mockOnSuccess} />);

    await user.type(
      screen.getByRole('textbox', { name: /メールアドレス/i }),
      'bad-format',
    );
    await user.type(screen.getByLabelText(/パスワード/i), 'password123');
    await user.click(
      screen.getByRole('button', { name: /新規登録|アカウント登録|登録する/i }),
    );

    // クライアントサイドのバリデーションで先に弾かれる
    expect(
      await screen.findByText(/有効なメールアドレスを入力してください/i),
    ).toBeInTheDocument();
  });
});
