import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Go-Kart Parts | GoKartPartPicker',
  description: 'Browse go-kart parts including clutches, torque converters, chains, sprockets, brakes, and more. Find compatible parts for your engine and build.',
  keywords: [
    'go-kart parts',
    'kart parts',
    'clutch',
    'torque converter',
    'go-kart accessories',
    'kart components',
  ],
  openGraph: {
    title: 'Go-Kart Parts | GoKartPartPicker',
    description: 'Browse go-kart parts and find compatible components for your build.',
    type: 'website',
    url: 'https://gokartpartpicker.com/parts',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Go-Kart Parts | GoKartPartPicker',
    description: 'Browse go-kart parts and find compatible components.',
  },
  alternates: {
    canonical: 'https://gokartpartpicker.com/parts',
  },
};

export default function PartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
