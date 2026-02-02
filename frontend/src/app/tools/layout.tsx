import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tools & Calculators - GoKartPartPicker',
  description: 'Useful tools and calculators to help you plan and build your ultimate go-kart. HP calculators, torque specs, ignition timing, and more.',
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
