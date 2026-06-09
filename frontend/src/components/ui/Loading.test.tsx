import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Loading } from './Loading';

describe('Loading', () => {
  it('デフォルトでrole="status"を持つ', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('デフォルトのラベルが「読み込み中」', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '読み込み中');
  });

  it('カスタムラベルが設定される', () => {
    render(<Loading label="投稿を取得中" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '投稿を取得中');
  });

  it('スクリーンリーダー用テキストが存在する', () => {
    render(<Loading label="データ取得中" />);
    expect(screen.getByText('データ取得中')).toHaveClass('sr-only');
  });

  it('size="sm"で小さいスピナーが表示される', () => {
    const { container } = render(<Loading size="sm" />);
    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toHaveClass('h-4');
    expect(spinner).toHaveClass('w-4');
  });

  it('size="lg"で大きいスピナーが表示される', () => {
    const { container } = render(<Loading size="lg" />);
    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });
});
