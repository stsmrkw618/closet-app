import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import PasswordGate from '@/components/PasswordGate';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Closet - クローゼット管理アプリ',
  description: '服の着用履歴を管理して、眠っている服を発見しよう',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'My Closet',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <PasswordGate>
          <AuthProvider>{children}</AuthProvider>
        </PasswordGate>
      </body>
    </html>
  );
}
