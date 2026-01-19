import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Go-Kart Engines | GoKartPartPicker',
  description: 'Browse go-kart engines including Predator, Honda, and clone engines. Compare specs, prices, and find compatible parts for your build.',
  keywords: [
    'go-kart engines',
    'predator engine',
    'honda gx200',
    'clone engine',
    'kart engine',
    'small engine',
  ],
  openGraph: {
    title: 'Go-Kart Engines | GoKartPartPicker',
    description: 'Browse and compare go-kart engines. Find the ultimate engine for your build.',
    type: 'website',
    url: 'https://gokartpartpicker.com/engines',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Go-Kart Engines | GoKartPartPicker',
    description: 'Browse and compare go-kart engines.',
  },
  alternates: {
    canonical: 'https://gokartpartpicker.com/engines',
  },
};

export default function EnginesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
