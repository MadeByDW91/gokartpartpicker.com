import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chassis Layout - GoKartPartPicker',
  description: 'Generic go-kart chassis blueprint: top and side view. Plan where the engine, axle, and key parts go. Reference for builders.',
  keywords: [
    'go-kart chassis',
    'chassis blueprint',
    'kart frame layout',
    'engine mount',
    'wheelbase',
  ],
  openGraph: {
    title: 'Chassis Layout - GoKartPartPicker',
    description: 'Generic go-kart chassis blueprint. Plan your build with top and side views.',
    type: 'website',
    url: 'https://gokartpartpicker.com/tools/chassis-layout',
  },
  alternates: {
    canonical: 'https://gokartpartpicker.com/tools/chassis-layout',
  },
};

export default function ChassisLayoutToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
