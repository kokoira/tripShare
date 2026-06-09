import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('画像がない場合はイニシャルを表示する', () => {
    render(<Avatar username="tanaka" />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('画像キーがある場合は画像を表示する', () => {
    render(<Avatar username="tanaka" imageKey="avatars/123.jpg" />);
    const img = screen.getByAltText('tanakaのアバター');
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe('IMG');
  });

  it('aria-labelにユーザー名が含まれる', () => {
    render(<Avatar username="suzuki" />);
    expect(screen.getByLabelText('suzukiのアバター')).toBeInTheDocument();
  });

  it('size="sm"で小さいアバターが表示される', () => {
    render(<Avatar username="test" size="sm" />);
    expect(screen.getByLabelText('testのアバター')).toHaveClass('h-8', 'w-8');
  });

  it('size="lg"で大きいアバターが表示される', () => {
    render(<Avatar username="test" size="lg" />);
    expect(screen.getByLabelText('testのアバター')).toHaveClass('h-16', 'w-16');
  });

  it('imageKeyがnullの場合はイニシャルにフォールバックする', () => {
    render(<Avatar username="yamada" imageKey={null} />);
    expect(screen.getByText('Y')).toBeInTheDocument();
  });
});
