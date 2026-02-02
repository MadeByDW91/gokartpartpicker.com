import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Build',
  description: 'View your go-kart build.',
  robots: { index: false, follow: true },
};

export default function BuildDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
