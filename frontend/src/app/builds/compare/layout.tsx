import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Builds',
  description: 'Compare go-kart builds side by side.',
  robots: { index: false, follow: true },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
