'use client';

export interface LoadingProps {
  /** スピナーのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** 読み込み中テキスト（スクリーンリーダー向け） */
  label?: string;
}

// サイズ別のスタイル定義
const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
} as const;

/**
 * ローディングスピナーコンポーネント
 */
export function Loading({ size = 'md', label = '読み込み中' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label={label}>
      <div
        className={`
          animate-spin rounded-full
          border-gray-300 border-t-blue-600
          ${sizeStyles[size]}
        `.trim()}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
