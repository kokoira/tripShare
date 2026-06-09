import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 本番ビルド時の静的エクスポート設定（S3デプロイ用）
  // output: 'export',

  // API リクエストのプロキシ設定（開発環境）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },

  // 画像最適化の設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
