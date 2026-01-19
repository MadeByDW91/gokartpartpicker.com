import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Useful Videos - Tools & Calculators | GoKartPartPicker',
  description: 'Browse our complete library of go-kart videos. Installation guides, tutorials, reviews, maintenance tips, and more.',
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
