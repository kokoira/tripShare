import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
