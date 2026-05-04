import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { AuthProvider } from '@/context/AuthContext';
import { WatchlistProvider } from '@/context/WatchlistContext';
import { HistoryProvider } from '@/context/HistoryContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Netflix Pro — Watch Movies & TV Shows Online',
  description: 'Discover and watch the latest movies and TV shows on Netflix Pro. Powered by TMDB with personalized watchlists.',
  keywords: 'movies, TV shows, streaming, watch online, TMDB',
  openGraph: {
    title: 'Netflix Pro',
    description: 'Your premium movie streaming platform',
    type: 'website',
  },
  icons: {
    icon: '/image.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <WatchlistProvider>
            <HistoryProvider>
              <Navbar />
              <main className="main-content">{children}</main>
              <BottomNav />
            </HistoryProvider>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
