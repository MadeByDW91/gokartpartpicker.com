import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HP Contribution Calculator - GoKartPartPicker',
  description: 'Calculate how much horsepower each part adds to your go-kart build. See individual HP contributions and total build HP.',
  keywords: [
    'hp calculator',
    'horsepower calculator',
    'go-kart hp',
    'performance calculator',
    'parts hp contribution',
  ],
  openGraph: {
    title: 'HP Contribution Calculator - GoKartPartPicker',
    description: 'Calculate how much horsepower each part adds to your go-kart build.',
    type: 'website',
    url: 'https://gokartpartpicker.com/tools/hp-contribution',
  },
  alternates: {
    canonical: 'https://gokartpartpicker.com/tools/hp-contribution',
  },
};

export default function HPContributionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
