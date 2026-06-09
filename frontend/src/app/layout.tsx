import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

// 日本語対応フォント
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TripShare - 旅行記録SNS',
  description: '旅行の思い出を記録・共有するSNSアプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900 min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
