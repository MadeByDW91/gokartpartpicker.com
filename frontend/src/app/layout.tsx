import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { AffiliateLinkTracker } from '@/components/analytics/AffiliateLinkTracker';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'GoKartPartPicker - Build Your Ultimate Go-Kart',
    template: '%s | GoKartPartPicker',
  },
  description:
    'Build your ultimate go-kart with our compatibility checker. Find engines, parts, and accessories that work together.',
  keywords: [
    'go-kart',
    'go kart parts',
    'go-kart engine',
    'kart building',
    'parts compatibility',
    'predator engine',
    'torque converter',
    'clutch',
  ],
  authors: [{ name: 'GoKartPartPicker' }],
  icons: {
    icon: '/brand/favicon.svg',
    apple: '/brand/apple-touch-icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gokartpartpicker.com',
    siteName: 'GoKartPartPicker',
    title: 'GoKartPartPicker - Build Your Ultimate Go-Kart',
    description:
      'Build your ultimate go-kart with our compatibility checker. Find engines, parts, and accessories that work together.',
    images: [
      {
        url: '/og/og-default-v1-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'GoKartPartPicker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoKartPartPicker - Build Your Ultimate Go-Kart',
    description:
      'Build your ultimate go-kart with our compatibility checker. Find engines, parts, and accessories that work together.',
    images: ['/og/og-default-v1-1200x630.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <AnalyticsProvider>
            <AffiliateLinkTracker />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AnalyticsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
