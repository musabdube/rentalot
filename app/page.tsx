import type { Metadata } from 'next';
import HomeClient from './home/HomeClient';

export const metadata: Metadata = {
  title: 'Rentalot | Find Your Perfect Rental Home',
  description: 'Browse verified rental properties, compare listings, and find your next home with Rentalot.',
  keywords: ['rentalot', 'rental properties', 'apartments', 'houses', 'property rentals', 'real estate'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Rentalot | Find Your Perfect Rental Home',
    description: 'Browse verified rental properties, compare listings, and find your next home with Rentalot.',
    url: '/',
    siteName: 'Rentalot',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rentalot - Find Your Perfect Rental Home',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rentalot | Find Your Perfect Rental Home',
    description: 'Browse verified rental properties, compare listings, and find your next home with Rentalot.',
    images: ['/og-image.jpg'],
    creator: '@rentalot',
    site: '@rentalot',
  },
};

export default function Page() {
  return <HomeClient />;
}
