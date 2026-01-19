import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Torque Specs - GoKartPartPicker',
  description: 'Complete torque specifications for go-kart engines. View fastener torque values, export to spreadsheet, and print for your build.',
  keywords: [
    'torque specs',
    'engine torque',
    'fastener torque',
    'go-kart engine specs',
    'predator torque',
  ],
  openGraph: {
    title: 'Torque Specs - GoKartPartPicker',
    description: 'Complete torque specifications for go-kart engines. Export to spreadsheet for your build.',
    type: 'website',
    url: 'https://gokartpartpicker.com/tools/torque-specs',
  },
  alternates: {
    canonical: 'https://gokartpartpicker.com/tools/torque-specs',
  },
};

export default function TorqueSpecsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
