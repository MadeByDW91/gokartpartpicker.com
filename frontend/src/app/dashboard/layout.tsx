import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Your GoKartPartPicker dashboard. Pick up where you left off, manage builds, and explore guides and tools.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
