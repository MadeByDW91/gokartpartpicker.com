import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Go-Kart Builder | GoKartPartPicker',
  description: 'Build your ultimate go-kart with our compatibility checker. Select an engine and parts, see real-time compatibility warnings, and calculate performance metrics.',
  keywords: [
    'go-kart builder',
    'kart configurator',
    'parts compatibility',
    'go-kart build',
    'kart parts',
    'engine compatibility',
  ],
  openGraph: {
    title: 'Go-Kart Builder | GoKartPartPicker',
    description: 'Build your ultimate go-kart with real-time compatibility checking and performance calculations.',
    type: 'website',
    url: 'https://gokartpartpicker.com/builder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Go-Kart Builder | GoKartPartPicker',
    description: 'Build your ultimate go-kart with real-time compatibility checking.',
  },
  alternates: {
    canonical: 'https://gokartpartpicker.com/builder',
  },
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
