/**
 * PostFormコンポーネントのテスト
 *
 * TDD Red フェーズ: テストを先に書く（タスク 4.3）
 * Requirements 3.1, 3.2, 3.3 に対応
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostForm from '../PostForm';

describe('PostForm', () => {
  // ---- フォーム表示のテスト ----

  describe('フォームの表示', () => {
    it('テキストエリアが表示される', () => {
      render(<PostForm />);
      expect(
        screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ }),
      ).toBeInTheDocument();
    });

    it('投稿ボタンが表示される', () => {
      render(<PostForm />);
      expect(
        screen.getByRole('button', { name: /投稿/ }),
      ).toBeInTheDocument();
    });

    it('文字数カウンターが表示される', () => {
      render(<PostForm />);
      // 「280」または「0/280」のような文字数表示
      expect(screen.getByText(/280/)).toBeInTheDocument();
    });
  });

  // ---- 文字数カウンターのテスト ----

  describe('文字数カウンター（Requirement 3.3）', () => {
    it('入力に応じてカウンターが更新される', async () => {
      const user = userEvent.setup();
      render(<PostForm />);
      const textarea = screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ });

      await user.type(textarea, 'あいう');

      // 残り277文字または「3/280」のような表示
      expect(screen.getByText(/277|3\/280/)).toBeInTheDocument();
    });

    it('280文字入力時にカウンターが0または「280/280」を表示する', async () => {
      const user = userEvent.setup();
      render(<PostForm />);
      const textarea = screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ });

      await user.type(textarea, 'a'.repeat(280));

      // 残り0文字または「280/280」を表示
      expect(screen.getByText(/^0$|280\/280/)).toBeInTheDocument();
    });

    it('280文字を超えた場合にカウンターが赤くなる（または警告表示）', async () => {
      render(<PostForm />);
      const textarea = screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ });

      fireEvent.change(textarea, { target: { value: 'a'.repeat(281) } });

      // カウンターが警告状態: data-exceeded="true" または赤いクラスが付与される
      const counter = screen.getByTestId('char-counter');
      // data-exceeded属性またはtext-red-500クラスで警告状態を確認
      const isExceeded =
        counter.getAttribute('data-exceeded') === 'true' ||
        counter.className.includes('text-red');
      expect(isExceeded).toBe(true);
    });
  });

  // ---- バリデーションのテスト ----

  describe('クライアントサイドバリデーション（Requirement 3.2, 3.3）', () => {
    it('空の状態で投稿ボタンを押すとエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<PostForm />);
      const submitButton = screen.getByRole('button', { name: /投稿/ });

      await user.click(submitButton);

      expect(
        screen.getByText(/入力|必須|本文/),
      ).toBeInTheDocument();
    });

    it('空白のみの内容で投稿ボタンを押すとエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<PostForm />);
      const textarea = screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ });

      await user.type(textarea, '   ');
      await user.click(screen.getByRole('button', { name: /投稿/ }));

      expect(
        screen.getByRole('alert'),
      ).toBeInTheDocument();
    });

    it('281文字以上の内容で投稿ボタンを押すとエラーメッセージが表示される（またはボタンが無効化される）', async () => {
      render(<PostForm />);
      const textarea = screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ });

      fireEvent.change(textarea, { target: { value: 'a'.repeat(281) } });

      // 281文字以上の場合、ボタンが無効化されるか、送信時にエラーが表示される
      // いずれかの方法でユーザーに通知されていれば良い
      const submitButton = screen.getByRole('button', { name: /投稿/ });
      // ボタン無効化 OR カウンターの警告表示 のどちらかで防御される
      const counter = screen.getByTestId('char-counter');
      const isProtected =
        submitButton.hasAttribute('disabled') ||
        counter.getAttribute('data-exceeded') === 'true';
      expect(isProtected).toBe(true);
    });

    it('281文字以上のとき投稿ボタンが無効化される', async () => {
      render(<PostForm />);
      const textarea = screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ });

      fireEvent.change(textarea, { target: { value: 'a'.repeat(281) } });

      const submitButton = screen.getByRole('button', { name: /投稿/ });
      expect(submitButton).toBeDisabled();
    });
  });

  // ---- 投稿成功のテスト ----

  describe('投稿成功時の動作（Requirement 3.1）', () => {
    it('有効な内容で投稿するとonSuccessが呼ばれる', async () => {
      // APIクライアントをモック
      vi.mock('@/lib/api-client', () => ({
        apiClient: {
          post: vi.fn().mockResolvedValue({ post: { id: 1, body: 'テスト投稿' } }),
        },
        ApiClientError: class ApiClientError extends Error {},
      }));

      const mockOnSuccess = vi.fn();
      const user = userEvent.setup();
      render(<PostForm onSuccess={mockOnSuccess} />);

      const textarea = screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ });
      await user.type(textarea, '京都旅行の記録です！');
      await user.click(screen.getByRole('button', { name: /投稿/ }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('投稿成功後にテキストエリアがクリアされる', async () => {
      vi.mock('@/lib/api-client', () => ({
        apiClient: {
          post: vi.fn().mockResolvedValue({ post: { id: 1, body: 'テスト投稿' } }),
        },
        ApiClientError: class ApiClientError extends Error {},
      }));

      const user = userEvent.setup();
      render(<PostForm />);

      const textarea = screen.getByRole('textbox', { name: /本文|旅行記録|投稿/ });
      await user.type(textarea, '京都旅行の記録です！');
      await user.click(screen.getByRole('button', { name: /投稿/ }));

      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });
  });

  // ---- ローディング状態のテスト ----

  describe('ローディング状態', () => {
    it('isLoadingがtrueのとき投稿ボタンが無効化される', () => {
      render(<PostForm isLoading={true} />);
      const submitButton = screen.getByRole('button', { name: /投稿/ });
      expect(submitButton).toBeDisabled();
    });
  });

  // ---- アクセシビリティ ----

  describe('アクセシビリティ', () => {
    it('フォームにariaラベルが付与されている', () => {
      render(<PostForm />);
      expect(
        screen.getByRole('form', { name: /投稿フォーム|旅行記録/ }),
      ).toBeInTheDocument();
    });
  });
});
