import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './Toast';

// テスト用のトースト発火コンポーネント
function TestTrigger() {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast('success', '保存しました')}>成功</button>
      <button onClick={() => showToast('error', 'エラーが発生しました')}>エラー</button>
      <button onClick={() => showToast('info', '情報をお知らせします')}>情報</button>
    </div>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('成功トーストが緑系スタイルで表示される', () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '成功' }));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('保存しました');
    expect(alert.className).toContain('bg-green-50');
    expect(alert.className).toContain('border-green-400');
  });

  it('エラートーストが赤系スタイルで表示される', () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'エラー' }));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('エラーが発生しました');
    expect(alert.className).toContain('bg-red-50');
    expect(alert.className).toContain('border-red-400');
  });

  it('情報トーストがグレー系スタイルで表示される', () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '情報' }));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('情報をお知らせします');
    expect(alert.className).toContain('bg-gray-50');
    expect(alert.className).toContain('border-gray-400');
  });

  it('約3秒後にトーストが自動消去される', () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '成功' }));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // 3秒経過で自動消去
    act(() => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('閉じるボタンで手動消去できる', () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '成功' }));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '通知を閉じる' }));
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ToastProvider外でuseToastを使うとエラーが発生する', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestTrigger />);
    }).toThrow('useToast は ToastProvider 内で使用してください');

    consoleError.mockRestore();
  });
});
