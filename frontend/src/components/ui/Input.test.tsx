import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('ラベルが正しく表示される', () => {
    render(<Input label="メールアドレス" />);
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
  });

  it('required指定時にアスタリスクが表示される', () => {
    render(<Input label="ユーザー名" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByLabelText(/ユーザー名/)).toHaveAttribute('required');
  });

  it('エラーメッセージが表示される', () => {
    render(<Input label="パスワード" error="8文字以上入力してください" />);
    expect(screen.getByRole('alert')).toHaveTextContent('8文字以上入力してください');
    expect(screen.getByLabelText('パスワード')).toHaveAttribute('aria-invalid', 'true');
  });

  it('エラーがない場合はaria-invalidが設定されない', () => {
    render(<Input label="名前" />);
    expect(screen.getByLabelText('名前')).toHaveAttribute('aria-invalid', 'false');
  });

  it('エラー時にボーダーが赤色になる', () => {
    render(<Input label="メール" error="無効なメールです" />);
    expect(screen.getByLabelText('メール')).toHaveClass('border-red-500');
  });

  it('テキスト入力が正しく動作する', async () => {
    render(<Input label="テスト" />);
    const input = screen.getByLabelText('テスト');
    await userEvent.type(input, 'こんにちは');
    expect(input).toHaveValue('こんにちは');
  });

  it('disabled状態ではカーソルが変わる', () => {
    render(<Input label="無効" disabled />);
    expect(screen.getByLabelText('無効')).toBeDisabled();
  });
});
