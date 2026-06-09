'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { Toast as ToastType, ToastType as ToastVariant } from '@/types';

// トースト自動消去の時間（ミリ秒）
const TOAST_DURATION_MS = 3000;

// バリアント別スタイル定義
const toastStyles: Record<ToastVariant, string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  info: 'bg-gray-50 border-gray-400 text-gray-800',
};

// バリアント別アイコン
const toastIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

// コンテキスト型定義
interface ToastContextValue {
  /** トーストを表示する */
  showToast: (type: ToastVariant, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * トースト通知プロバイダー
 * アプリケーション全体でトースト通知を管理する
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = useCallback((type: ToastVariant, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* トースト表示エリア */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2"
        aria-live="polite"
        aria-label="通知"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * 個別トーストアイテム
 * 3秒後に自動消去
 */
function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastType;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-3 rounded-md border shadow-md
        animate-[slideIn_0.3s_ease-out]
        min-w-[280px] max-w-[400px]
        ${toastStyles[toast.type]}
      `.trim()}
      role="alert"
    >
      <span className="text-lg font-bold" aria-hidden="true">
        {toastIcons[toast.type]}
      </span>
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity"
        aria-label="通知を閉じる"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * トーストを使用するカスタムフック
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast は ToastProvider 内で使用してください');
  }
  return context;
}
