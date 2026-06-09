import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('デフォルトのprimary/mdスタイルで描画される', () => {
    render(<Button>送信</Button>);
    const button = screen.getByRole('button', { name: '送信' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600');
    expect(button).toHaveClass('px-4');
  });

  it('variant="danger"を指定すると赤系スタイルが適用される', () => {
    render(<Button variant="danger">削除</Button>);
    const button = screen.getByRole('button', { name: '削除' });
    expect(button).toHaveClass('bg-red-600');
  });

  it('variant="secondary"を指定するとグレー系スタイルが適用される', () => {
    render(<Button variant="secondary">キャンセル</Button>);
    const button = screen.getByRole('button', { name: 'キャンセル' });
    expect(button).toHaveClass('bg-gray-200');
  });

  it('variant="ghost"を指定すると透明背景スタイルが適用される', () => {
    render(<Button variant="ghost">その他</Button>);
    const button = screen.getByRole('button', { name: 'その他' });
    expect(button).toHaveClass('bg-transparent');
  });

  it('size="sm"で小さいパディングが適用される', () => {
    render(<Button size="sm">小</Button>);
    const button = screen.getByRole('button', { name: '小' });
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('text-sm');
  });

  it('size="lg"で大きいパディングが適用される', () => {
    render(<Button size="lg">大</Button>);
    const button = screen.getByRole('button', { name: '大' });
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('text-lg');
  });

  it('disabled状態ではクリックイベントが発火しない', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>無効</Button>);
    const button = screen.getByRole('button', { name: '無効' });
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('loading=trueのときスピナーが表示されボタンが無効化される', () => {
    render(<Button loading>送信中</Button>);
    const button = screen.getByRole('button', { name: '送信中' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    // スピナーSVGが存在する
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('クリックイベントが正しくハンドルされる', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>クリック</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'クリック' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
