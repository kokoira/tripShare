'use client';

export interface AvatarProps {
  /** S3画像キー（nullの場合はイニシャル表示） */
  imageKey?: string | null;
  /** ユーザー名（イニシャル生成・altテキスト用） */
  username: string;
  /** アバターのサイズ */
  size?: 'sm' | 'md' | 'lg';
}

// サイズ別のスタイル定義
const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
} as const;

/**
 * ユーザーアバターコンポーネント
 * 画像がない場合はユーザー名のイニシャルを表示
 */
export function Avatar({ imageKey, username, size = 'md' }: AvatarProps) {
  // イニシャルを取得（最初の1文字を大文字化）
  const initial = username.charAt(0).toUpperCase();

  // 画像URLの組み立て（S3/CloudFront想定）
  const imageUrl = imageKey
    ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? ''}/${imageKey}`
    : null;

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        rounded-full overflow-hidden bg-blue-100 text-blue-700 font-medium
        ${sizeStyles[size]}
      `.trim()}
      aria-label={`${username}のアバター`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${username}のアバター`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </div>
  );
}
